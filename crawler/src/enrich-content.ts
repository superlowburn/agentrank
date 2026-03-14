import type { Octokit } from "octokit";
import { getReposNeedingContent, updateReadmeAndTopics } from "./db.js";

function cleanReadme(raw: string): string {
  return raw
    // Strip badge lines: [![...](...)
    .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '')
    // Strip standalone images: ![...](...)
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Strip <img> tags
    .replace(/<img[^>]*>/gi, '')
    // Strip HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 2000);
}

export async function enrichContent(
  octokit: Octokit,
  maxRepos: number = 300
): Promise<number> {
  const repos = getReposNeedingContent(maxRepos);

  console.log(`\nContent enrichment: ${repos.length} repos need README + topics`);

  if (repos.length === 0) return 0;

  let enriched = 0;
  for (const repo of repos) {
    const [owner, name] = repo.full_name.split("/");

    try {
      const [readmeResult, topicsResult] = await Promise.allSettled([
        octokit.rest.repos.getReadme({ owner, repo: name }),
        octokit.rest.repos.getAllTopics({ owner, repo: name }),
      ]);

      let readmeExcerpt: string | null = null;
      if (readmeResult.status === 'fulfilled') {
        const content = Buffer.from(readmeResult.value.data.content, 'base64').toString('utf-8');
        readmeExcerpt = cleanReadme(content);
        if (readmeExcerpt.length === 0) readmeExcerpt = null;
      }

      const topics: string[] = topicsResult.status === 'fulfilled'
        ? topicsResult.value.data.names
        : [];

      updateReadmeAndTopics(repo.id, {
        readme_excerpt: readmeExcerpt,
        github_topics: topics,
      });

      enriched++;
      if (enriched % 50 === 0) {
        console.log(`  Content enriched ${enriched}/${repos.length}`);
      }
    } catch (err) {
      console.error(`  Failed to enrich content for ${repo.full_name}:`, err);
    }
  }

  console.log(`Content enrichment complete: ${enriched}/${repos.length}`);
  return enriched;
}
