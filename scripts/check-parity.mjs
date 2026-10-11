// Verifies that docs/en and docs/zh-CN stay a 1:1 structural mirror, and that the
// navigation files do not link to anything that is missing.
//
// Checks, per file pair:
//   - every English file has a Chinese counterpart and vice versa
//   - `date`, `updated` and `tags` are byte-identical (translation must not drift)
//   - heading levels appear in the same sequence
//   - same number of horizontal rules, fenced code blocks, table rows, images
//   - same image paths
//
// Checks, across both navigation files:
//   - every relative link in README.md / README.zh-CN.md / SUMMARY.md / SUMMARY.zh-CN.md
//     resolves to a file and the nav files cover every article in both trees
//
// Run: node scripts/check-parity.mjs
// Exits non-zero on any mismatch, so it can gate a commit.
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const EN = path.join(root, 'docs', 'en');
const ZH = path.join(root, 'docs', 'zh-CN');
const LOCALES = [['en', EN], ['zh-CN', ZH]];

async function walk(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full, base));
    else if (entry.name.endsWith('.md')) out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out.sort();
}

const [enFiles, zhFiles] = await Promise.all([walk(EN), walk(ZH)]);
const problems = [];

const enSet = new Set(enFiles);
const zhSet = new Set(zhFiles);
for (const f of enFiles) if (!zhSet.has(f)) problems.push(`missing Chinese counterpart: docs/zh-CN/${f}`);
for (const f of zhFiles) if (!enSet.has(f)) problems.push(`missing English counterpart: docs/en/${f}`);

function analyse(raw) {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fm = fmMatch ? fmMatch[1] : '';
  const body = fmMatch ? raw.slice(fmMatch[0].length) : raw;
  const grab = (key) => {
    const m = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
    return m ? m[1].trim() : null;
  };
  const lines = body.split(/\r?\n/);
  return {
    date: grab('date'),
    updated: grab('updated'),
    tags: grab('tags'),
    headings: lines.filter((l) => /^#{1,6}\s/.test(l)).map((l) => l.match(/^(#{1,6})/)[1]),
    rules: lines.filter((l) => /^-{3,}\s*$/.test(l)).length,
    fences: lines.filter((l) => /^```/.test(l)).length,
    tableRows: lines.filter((l) => l.trim().startsWith('|')).length,
    images: (body.match(/!\[[^\]]*\]\(([^)]+)\)/g) || [])
      .map((s) => s.replace(/^!\[[^\]]*\]\(/, '').replace(/\)$/, '.'))
      .sort(),
  };
}

// Ignore the migration helper itself and any non-mirrored tooling.
const SKIP = new Set();

for (const rel of enFiles) {
  if (SKIP.has(rel) || !zhSet.has(rel)) continue;
  const [enRaw, zhRaw] = await Promise.all([
    readFile(path.join(EN, rel), 'utf8'),
    readFile(path.join(ZH, rel), 'utf8'),
  ]);
  const en = analyse(enRaw);
  const zh = analyse(zhRaw);

  for (const key of ['date', 'updated', 'tags']) {
    if (en[key] !== zh[key]) {
      problems.push(`${rel}: frontmatter \`${key}\` differs\n    en: ${en[key]}\n    zh: ${zh[key]}`);
    }
  }
  if (en.headings.join(',') !== zh.headings.join(',')) {
    problems.push(`${rel}: heading levels differ\n    en: ${en.headings.join(',')}\n    zh: ${zh.headings.join(',')}`);
  }
  for (const key of ['rules', 'fences', 'tableRows']) {
    if (en[key] !== zh[key]) problems.push(`${rel}: ${key} count differs (en ${en[key]} vs zh ${zh[key]})`);
  }
  if (en.images.join('|') !== zh.images.join('|')) {
    problems.push(`${rel}: image paths differ\n    en: ${en.images.join(', ')}\n    zh: ${zh.images.join(', ')}`);
  }
}

// --- navigation files: links must resolve, and must cover every article ---

const NAV = ['README.md', 'README.zh-CN.md', 'SUMMARY.md', 'SUMMARY.zh-CN.md'];
const NAV_SETS = [
  { nav: ['README.md', 'SUMMARY.md'], tree: EN, label: 'en' },
  { nav: ['README.zh-CN.md', 'SUMMARY.zh-CN.md'], tree: ZH, label: 'zh-CN' },
];

const exists = async (p) => {
  try { await access(p); return true; } catch { return false; }
};

for (const file of NAV) {
  const raw = await readFile(path.join(root, file), 'utf8');
  const links = [...raw.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
  for (const link of links) {
    if (/^[a-z]+:\/\//i.test(link) || link.startsWith('#')) continue;
    const target = path.join(root, decodeURIComponent(link.split('#')[0]));
    if (!await exists(target)) problems.push(`${file}: dead link -> ${link}`);
  }
}

for (const { nav, tree, label } of NAV_SETS) {
  const listed = new Set();
  for (const file of nav) {
    const raw = await readFile(path.join(root, file), 'utf8');
    for (const m of raw.matchAll(/\]\((docs\/[^)#]+\.md)\)/g)) listed.add(m[1]);
  }
  for (const rel of await walk(tree)) {
    const expected = `docs/${label}/${rel}`;
    if (!listed.has(expected)) problems.push(`not listed in ${nav.join(' / ')}: ${expected}`);
  }
}

if (problems.length > 0) {
  console.error(`check-parity: ${problems.length} problem(s) found.\n`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}

console.log(`check-parity: ${enFiles.length} pairs OK (en ${enFiles.length} / zh-CN ${zhFiles.length}), nav links OK.`);
