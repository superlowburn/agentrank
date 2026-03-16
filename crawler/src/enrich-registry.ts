/**
 * Registry download enrichment: npm and PyPI weekly download counts.
 *
 * For JS/TS repos, tries the repo name (unscoped then @owner/name) against npm.
 * For Python repos, tries the repo name against PyPI.
 *
 * Marks repos as checked (registry_checked_at) regardless of match so they
 * are skipped on subsequent runs. Re-enrichment requires clearing that column.
 */
import {
  getReposNeedingRegistryEnrichmentMulti,
  getReposNeedingRegistryEnrichment,
  updateNpmDownloads,
  updatePypiDownloads,
  type RepoRow,
} from "./db.js";

const NPM_DOWNLOADS_API = "https://api.npmjs.org/downloads/point/last-week";
const PYPI_STATS_API = "https://pypistats.org/api/packages";

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AgentRank-Crawler/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

interface NpmDownloadResponse {
  downloads?: number;
  package?: string;
  error?: string;
}

interface PypiRecentResponse {
  data?: {
    last_week?: number;
    last_month?: number;
    last_day?: number;
  };
  package?: string;
}

async function getNpmDownloads(packageName: string): Promise<number> {
  const data = await fetchJson<NpmDownloadResponse>(
    `${NPM_DOWNLOADS_API}/${encodeURIComponent(packageName)}`
  );
  if (!data || data.error) return 0;
  return data.downloads ?? 0;
}

async function resolveBestNpmPackage(
  owner: string,
  repoName: string
): Promise<{ packageName: string; downloads: number } | null> {
  // Try most common patterns in order of likelihood for MCP servers
  const candidates = [
    repoName,
    `@${owner}/${repoName}`,
    // Some repos use "mcp-" prefix stripped
    repoName.replace(/^mcp-?/, ""),
    // Some use "-mcp" suffix stripped
    repoName.replace(/-mcp$/, ""),
  ].filter((v, i, arr) => v.length > 0 && arr.indexOf(v) === i);

  for (const candidate of candidates) {
    const downloads = await getNpmDownloads(candidate);
    if (downloads > 0) {
      return { packageName: candidate, downloads };
    }
    await delay(30);
  }
  return null;
}

async function getPypiDownloads(packageName: string): Promise<number> {
  const data = await fetchJson<PypiRecentResponse>(
    `${PYPI_STATS_API}/${encodeURIComponent(packageName)}/recent`
  );
  if (!data?.data) return 0;
  return data.data.last_week ?? data.data.last_month ?? 0;
}

async function resolveBestPypiPackage(
  repoName: string
): Promise<{ packageName: string; downloads: number } | null> {
  // PyPI names: try repo name with hyphens and underscores both ways
  const base = repoName.toLowerCase();
  const candidates = [
    base,
    base.replace(/_/g, "-"),
    base.replace(/-/g, "_"),
    // Some MCP Python servers use "mcp-" prefix
    base.replace(/^mcp-?/, ""),
  ].filter((v, i, arr) => v.length > 0 && arr.indexOf(v) === i);

  for (const candidate of candidates) {
    const downloads = await getPypiDownloads(candidate);
    if (downloads > 0) {
      return { packageName: candidate, downloads };
    }
    await delay(50);
  }
  return null;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function enrichNpmDownloads(maxRepos: number = 1500): Promise<number> {
  const repos = getReposNeedingRegistryEnrichmentMulti(
    ["TypeScript", "JavaScript"],
    maxRepos
  );
  console.log(`npm enrichment: checking ${repos.length} JS/TS repos`);

  let hits = 0;
  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i] as RepoRow;
    const [owner, name] = repo.full_name.split("/");

    const result = await resolveBestNpmPackage(owner, name);

    if (result) {
      updateNpmDownloads(repo.id, result.packageName, result.downloads);
      hits++;
    } else {
      // Mark as checked with 0 downloads so we don't retry on next run
      updateNpmDownloads(repo.id, null, 0);
    }

    if ((i + 1) % 100 === 0 || i === repos.length - 1) {
      console.log(`  npm: ${i + 1}/${repos.length} (${hits} hits)`);
    }

    // Polite delay between repos
    if (i < repos.length - 1) {
      await delay(60);
    }
  }

  console.log(`npm enrichment complete: ${hits}/${repos.length} packages found`);
  return hits;
}

export async function enrichPypiDownloads(maxRepos: number = 1500): Promise<number> {
  const repos = getReposNeedingRegistryEnrichment("Python", maxRepos);
  console.log(`PyPI enrichment: checking ${repos.length} Python repos`);

  let hits = 0;
  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i] as RepoRow;
    const [, name] = repo.full_name.split("/");

    const result = await resolveBestPypiPackage(name);

    if (result) {
      updatePypiDownloads(repo.id, result.packageName, result.downloads);
      hits++;
    } else {
      updatePypiDownloads(repo.id, null, 0);
    }

    if ((i + 1) % 100 === 0 || i === repos.length - 1) {
      console.log(`  pypi: ${i + 1}/${repos.length} (${hits} hits)`);
    }

    if (i < repos.length - 1) {
      await delay(80);
    }
  }

  console.log(`PyPI enrichment complete: ${hits}/${repos.length} packages found`);
  return hits;
}

export async function enrichRegistryDownloads(maxPerRegistry: number = 1500): Promise<void> {
  await enrichNpmDownloads(maxPerRegistry);
  await enrichPypiDownloads(maxPerRegistry);
}
