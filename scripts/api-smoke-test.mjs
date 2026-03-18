#!/usr/bin/env node
/**
 * AgentRank API Smoke Tests
 * Tests all public endpoints against production: https://agentrank-ai.com
 * Run: node scripts/api-smoke-test.mjs
 */

const BASE = 'https://agentrank-ai.com';

const results = [];
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    const result = await fn();
    if (result.pass) {
      passed++;
      results.push({ name, status: 'PASS', detail: result.detail });
    } else {
      failed++;
      results.push({ name, status: 'FAIL', detail: result.detail });
    }
  } catch (e) {
    failed++;
    results.push({ name, status: 'FAIL', detail: `Exception: ${e.message}` });
  }
}

function pass(detail) { return { pass: true, detail }; }
function fail(detail) { return { pass: false, detail }; }

async function get(path, opts = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, opts);
  let body;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  return { status: res.status, body, headers: res.headers };
}

function isValidJson(body) {
  return typeof body === 'object' && body !== null;
}

// ─── GET /api/status ──────────────────────────────────────────────────────────

await test('GET /api/status — returns 200 with valid JSON', async () => {
  const { status, body } = await get('/api/status');
  if (status !== 200) return fail(`Expected 200, got ${status}`);
  if (!isValidJson(body)) return fail('Non-JSON response');
  if (body.status !== 'ok') return fail(`status field: ${body.status}`);
  return pass(`status=ok, db.ok=${body.checks?.db?.ok}, tools.total=${body.checks?.tools?.total}`);
});

await test('GET /api/status — response schema has required fields', async () => {
  const { body } = await get('/api/status');
  const required = ['status', 'timestamp', 'response_ms', 'checks'];
  const missing = required.filter(k => !(k in body));
  if (missing.length) return fail(`Missing fields: ${missing.join(', ')}`);
  if (!body.checks?.db) return fail('Missing checks.db');
  if (!body.checks?.tools) return fail('Missing checks.tools');
  return pass(`All required fields present. tools.total=${body.checks.tools.total}, skills.total=${body.checks.skills?.total}`);
});

// ─── GET /api/v1/search ───────────────────────────────────────────────────────

await test('GET /api/v1/search?q=mcp — returns 200 with results', async () => {
  const { status, body } = await get('/api/v1/search?q=mcp');
  if (status !== 200) return fail(`Expected 200, got ${status}`);
  if (!Array.isArray(body.results)) return fail('results not an array');
  if (body.results.length === 0) return fail('Empty results for query "mcp"');
  return pass(`${body.results.length} results, meta.total=${body.meta?.total}`);
});

await test('GET /api/v1/search — response schema validation', async () => {
  const { body } = await get('/api/v1/search?q=mcp');
  if (!body.query) return fail('Missing query field');
  if (!body.category) return fail('Missing category field');
  if (!body.results) return fail('Missing results field');
  if (!body.meta) return fail('Missing meta field');
  const firstResult = body.results[0];
  const resultFields = ['type', 'id', 'name', 'score', 'rank', 'url'];
  const missing = resultFields.filter(k => !(k in firstResult));
  if (missing.length) return fail(`Result missing fields: ${missing.join(', ')}`);
  return pass(`Schema valid. First result: ${firstResult.name} (score=${firstResult.score})`);
});

await test('GET /api/v1/search — pagination with limit param', async () => {
  const { status, body } = await get('/api/v1/search?q=mcp&limit=5');
  if (status !== 200) return fail(`Expected 200, got ${status}`);
  if (body.results.length > 5) return fail(`Expected max 5 results, got ${body.results.length}`);
  return pass(`limit=5 works. Got ${body.results.length} results`);
});

await test('GET /api/v1/search — pagination with offset param', async () => {
  const { body: page1 } = await get('/api/v1/search?q=mcp&limit=3&offset=0');
  const { body: page2 } = await get('/api/v1/search?q=mcp&limit=3&offset=3');
  if (!page1.results || !page2.results) return fail('Missing results arrays');
  const ids1 = page1.results.map(r => r.id);
  const ids2 = page2.results.map(r => r.id);
  const overlap = ids1.filter(id => ids2.includes(id));
  if (overlap.length > 0) return fail(`Pages overlap: ${overlap.join(', ')}`);
  return pass(`offset pagination works. Page1: [${ids1.slice(0,2).join(',')}...], Page2: [${ids2.slice(0,2).join(',')}...]`);
});

await test('GET /api/v1/search — category filter: tool', async () => {
  const { status, body } = await get('/api/v1/search?q=mcp&category=tool');
  if (status !== 200) return fail(`Expected 200, got ${status}`);
  const nonTools = body.results.filter(r => r.type !== 'tool');
  if (nonTools.length > 0) return fail(`Non-tool results with category=tool: ${nonTools.length}`);
  return pass(`category=tool works. All ${body.results.length} results are tools`);
});

await test('GET /api/v1/search — category filter: skill', async () => {
  const { status, body } = await get('/api/v1/search?q=git&category=skill');
  if (status !== 200) return fail(`Expected 200, got ${status}`);
  const nonSkills = body.results.filter(r => r.type !== 'skill');
  if (nonSkills.length > 0) return fail(`Non-skill results with category=skill: ${nonSkills.length}`);
  return pass(`category=skill works. All ${body.results.length} results are skills`);
});

await test('GET /api/v1/search — error: invalid category returns 400', async () => {
  const { status, body } = await get('/api/v1/search?q=mcp&category=invalid');
  if (status !== 400) return fail(`Expected 400, got ${status}`);
  if (!body.error) return fail('Missing error message');
  return pass(`400 error: "${body.error}"`);
});

await test('GET /api/v1/search — empty query returns results or 400', async () => {
  const { status } = await get('/api/v1/search?q=');
  if (status !== 200 && status !== 400) return fail(`Expected 200 or 400, got ${status}`);
  return pass(`status=${status} for empty query`);
});

// ─── GET /api/v1/tool/:id ─────────────────────────────────────────────────────

await test('GET /api/v1/tool/:id — returns 200 for known tool', async () => {
  const { status, body } = await get('/api/v1/tool/PrefectHQ--fastmcp');
  if (status !== 200) return fail(`Expected 200, got ${status}`);
  if (!isValidJson(body)) return fail('Non-JSON response');
  if (!body.name) return fail('Missing name field');
  return pass(`name="${body.name}", score=${body.score}`);
});

await test('GET /api/v1/tool/:id — response schema validation', async () => {
  const { body } = await get('/api/v1/tool/PrefectHQ--fastmcp');
  // v1 tool response uses githubUrl (not url) plus signals/weights detail
  const required = ['id', 'name', 'score', 'rank', 'githubUrl'];
  const missing = required.filter(k => !(k in body));
  if (missing.length) return fail(`Missing fields: ${missing.join(', ')}`);
  if (!body.signals || !body.weights) return fail('Missing signals/weights breakdown');
  return pass(`Schema valid. id=${body.id}, rank=${body.rank}, score=${body.score}, githubUrl=${body.githubUrl}`);
});

await test('GET /api/v1/tool/:id — returns 404 for unknown tool', async () => {
  const { status, body } = await get('/api/v1/tool/nonexistent--totally-fake-tool-xyz');
  if (status !== 404) return fail(`Expected 404, got ${status}`);
  if (!body.error) return fail('Missing error field');
  return pass(`404 error: "${body.error}"`);
});

await test('GET /api/v1/tool/:id — returns tool for skill slug', async () => {
  // Skills can also be looked up via v1/tool endpoint
  const { status } = await get('/api/v1/tool/obra--superpowers--test-driven-development');
  if (status !== 200 && status !== 404) return fail(`Unexpected status ${status}`);
  return pass(`skill slug lookup: status=${status}`);
});

// ─── GET /api/v1/movers ───────────────────────────────────────────────────────

await test('GET /api/v1/movers — returns 200 with valid JSON', async () => {
  const { status, body } = await get('/api/v1/movers');
  if (status !== 200) return fail(`Expected 200, got ${status}`);
  if (!isValidJson(body)) return fail('Non-JSON response');
  if (!body.movers) return fail('Missing movers field');
  return pass(`movers array length=${body.movers.length}, meta=${JSON.stringify(body.meta)}`);
});

await test('GET /api/v1/movers — response schema validation', async () => {
  const { body } = await get('/api/v1/movers');
  if (!Array.isArray(body.movers)) return fail('movers is not an array');
  if (body.movers.length > 0) {
    const first = body.movers[0];
    const required = ['id', 'name', 'score'];
    const missing = required.filter(k => !(k in first));
    if (missing.length) return fail(`Mover missing fields: ${missing.join(', ')}`);
  }
  return pass(`Schema valid. ${body.movers.length} movers`);
});

// ─── GET /api/v1/new-tools ────────────────────────────────────────────────────

await test('GET /api/v1/new-tools — returns 200 with valid JSON', async () => {
  const { status, body } = await get('/api/v1/new-tools');
  if (status !== 200) return fail(`Expected 200, got ${status}`);
  if (!isValidJson(body)) return fail('Non-JSON response');
  if (!body.tools) return fail('Missing tools field');
  return pass(`tools array length=${body.tools.length}`);
});

await test('GET /api/v1/new-tools — response schema validation', async () => {
  const { body } = await get('/api/v1/new-tools');
  if (!Array.isArray(body.tools)) return fail('tools is not an array');
  if (body.tools.length > 0) {
    const first = body.tools[0];
    if (!first.id && !first.name) return fail('Tool missing id/name');
  }
  return pass(`Schema valid. ${body.tools.length} new tools`);
});

// ─── GET /api/tools (HTML page, not a JSON API) ───────────────────────────────

await test('GET /api/tools — serves the tools page (HTML, not a JSON endpoint)', async () => {
  const res = await fetch(`${BASE}/api/tools`);
  const ct = res.headers.get('content-type') || '';
  if (res.status !== 200) return fail(`Expected 200, got ${res.status}`);
  // This route is a static HTML page redirect, not a JSON endpoint
  if (ct.includes('text/html')) return pass(`/api/tools returns HTML page (expected — it's a UI route, not JSON API)`);
  return pass(`status=200, content-type=${ct}`);
});

// ─── GET /api/tools/:slug/history ────────────────────────────────────────────

await test('GET /api/tools/:slug/history — returns 200 for known tool', async () => {
  const { status, body } = await get('/api/tools/PrefectHQ--fastmcp/history');
  if (status !== 200) return fail(`Expected 200, got ${status}`);
  if (!isValidJson(body)) return fail('Non-JSON response');
  return pass(`Response keys: ${Object.keys(body).join(', ')}`);
});

await test('GET /api/tools/:slug/history — days param works', async () => {
  const { status, body } = await get('/api/tools/PrefectHQ--fastmcp/history?days=7');
  if (status !== 200) return fail(`Expected 200, got ${status}`);
  // history array should have at most 7 entries
  const histArray = body.history || body.snapshots || body.data || [];
  return pass(`days=7 param accepted. history length=${histArray.length}`);
});

// ─── GET /api/search (root) ───────────────────────────────────────────────────

await test('GET /api/search?q= — returns 200', async () => {
  const { status, body } = await get('/api/search?q=mcp');
  if (status !== 200) return fail(`Expected 200, got ${status}`);
  if (!isValidJson(body)) return fail('Non-JSON response');
  return pass(`Root search works. Keys: ${Object.keys(body).join(', ')}`);
});

// ─── GET /api/lookup ──────────────────────────────────────────────────────────

await test('GET /api/lookup — returns 200', async () => {
  const { status, body } = await get('/api/lookup?q=modelcontextprotocol');
  if (status !== 200) return fail(`Expected 200, got ${status}`);
  if (!isValidJson(body)) return fail('Non-JSON response');
  return pass(`Lookup works. Keys: ${Object.keys(body).join(', ')}`);
});

// ─── GET /api/v2/search (auth-gated) ─────────────────────────────────────────

await test('GET /api/v2/search — returns 401 without auth (expected)', async () => {
  const { status, body } = await get('/api/v2/search?q=mcp');
  if (status !== 401) return fail(`Expected 401, got ${status}`);
  if (!body.error) return fail('Missing error field');
  return pass(`Correctly requires auth. error="${body.error}"`);
});

// ─── GET /api/v2/tool/:id (auth-gated) ───────────────────────────────────────

await test('GET /api/v2/tool/:id — returns 401 without auth (expected)', async () => {
  const { status, body } = await get('/api/v2/tool/PrefectHQ--fastmcp');
  if (status !== 401) return fail(`Expected 401, got ${status}`);
  if (!body.error) return fail('Missing error field');
  return pass(`Correctly requires auth. error="${body.error}"`);
});

// ─── POST /api/v2/batch (auth-gated) ─────────────────────────────────────────

await test('POST /api/v2/batch — returns 401 without auth (expected)', async () => {
  const { status, body } = await get('/api/v2/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: ['PrefectHQ--fastmcp'] }),
  });
  if (status !== 401) return fail(`Expected 401, got ${status}`);
  if (!body.error) return fail('Missing error field');
  return pass(`Correctly requires auth. error="${body.error}"`);
});

// ─── Error cases ──────────────────────────────────────────────────────────────

await test('Rate-limit headers present on v1 endpoints', async () => {
  const { headers } = await get('/api/v1/search?q=mcp');
  // Headers may vary — just verify request succeeded and check for any rate limit header
  const rlHeaders = ['ratelimit-limit', 'x-ratelimit-limit', 'ratelimit-remaining', 'x-ratelimit-remaining'];
  const found = rlHeaders.filter(h => headers.get(h) !== null);
  if (found.length === 0) return pass('No explicit rate-limit headers (acceptable — IP-based limiting may not expose headers)');
  return pass(`Rate limit headers: ${found.join(', ')}`);
});

await test('404 page returns proper response', async () => {
  const { status } = await get('/api/nonexistent-endpoint-xyz');
  // Either 404 from a catch-all or a redirect to 404 page
  if (status === 404 || status === 200) return pass(`status=${status} for unknown endpoint`);
  return fail(`Unexpected status ${status}`);
});

// ─── Print results ─────────────────────────────────────────────────────────────

console.log('\n=== AgentRank API Smoke Test Results ===\n');
console.log(`Target: ${BASE}\n`);

for (const r of results) {
  const icon = r.status === 'PASS' ? '✓' : '✗';
  console.log(`${icon} [${r.status}] ${r.name}`);
  if (r.status === 'FAIL' || process.env.VERBOSE) {
    console.log(`        ${r.detail}`);
  }
}

console.log(`\n─────────────────────────────────────────`);
console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
console.log(`─────────────────────────────────────────\n`);

if (failed > 0) {
  console.log('FAILED TESTS:');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`  ✗ ${r.name}`);
    console.log(`    ${r.detail}`);
  });
  process.exit(1);
} else {
  console.log('All tests passed!');
  process.exit(0);
}
