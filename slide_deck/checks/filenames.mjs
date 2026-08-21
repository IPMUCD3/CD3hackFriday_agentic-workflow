import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { DECKS, DECK_DIR } from './decks.mjs';

const REPO = join(DECK_DIR, '..');
const DEMO_DIRS = ['codebase-onboarding_demo', 'paper-to-mathematica-nb_demo'];

// The spec scopes this check to demo slides: "every filename printed on a demo
// slide must exist in the corresponding demo directory". A filename anywhere
// else is not a claim about a local artifact -- a mock terminal transcript uses
// generic names on purpose, and a .pdf inside an external href is a URL path
// segment that no local file could ever satisfy. Scanning the whole document
// flags both and can never go green.
const demoSlideText = (html) =>
  html
    .split(/<section\b/)
    .slice(1)
    .filter((s) => /class="[^"]*demo-slide/.test(s) || /data-section="Live demo/.test(s))
    .join('\n')
    .replace(/href="[^"]*"/g, '');

// Only artifact extensions. Config filenames (CLAUDE.md, AGENTS.md, SKILL.md,
// settings.json, config.toml) name conventions, not files that must exist here.
const ARTIFACT = /\b[A-Za-z0-9_][A-Za-z0-9_.-]*\.(wls|nb|pdf|py)\b/g;
const IGNORE = new Set(['setup.py', '__init__.py']);

function walk(dir, out = new Set()) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === '.git' || entry === 'node_modules') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.add(entry);
  }
  return out;
}

// The demo repositories are nested, untracked git repos. On a fresh clone they
// are absent, and a missing file then means "not checked out", not "wrong name".
// Fail only when every demo directory is present; otherwise warn and pass.
const absentDirs = DEMO_DIRS.filter((d) => !existsSync(join(REPO, d)));
const onDisk = new Set();
for (const d of DEMO_DIRS) for (const f of walk(join(REPO, d))) onDisk.add(f);

if (absentDirs.length) {
  console.warn(`SKIP demo directories not checked out: ${absentDirs.join(', ')}`);
  console.warn('     filename mismatches will be reported as warnings, not failures');
}

let failures = 0;
for (const deck of DECKS) {
  const html = readFileSync(join(DECK_DIR, deck.file), 'utf8');
  const named = new Set((demoSlideText(html).match(ARTIFACT) || []).filter((f) => !IGNORE.has(f)));
  const missing = [...named].filter((f) => !onDisk.has(f));
  if (missing.length && absentDirs.length) {
    console.warn(`WARN ${deck.name}: unverifiable -> ${missing.join(', ')}`);
  } else if (missing.length) {
    failures += missing.length;
    console.error(`FAIL ${deck.name}: named on a slide but not on disk -> ${missing.join(', ')}`);
  } else {
    console.log(`PASS ${deck.name}: all ${named.size} named artifact(s) exist`);
  }
}

console.log(failures ? `\nfilenames: ${failures} missing` : '\nfilenames: clean');
process.exit(failures ? 1 : 0);
