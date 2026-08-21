import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { DECKS, DECK_DIR } from './decks.mjs';

const REPO = join(DECK_DIR, '..');

// The spec says a filename on a demo slide must exist in the CORRESPONDING demo
// directory. A flat union across both would let a Demo-01 artifact name pass
// while sitting on a Demo-02 slide.
const DEMO_DIRS = {
  'Live demo 01': 'codebase-onboarding_demo',
  'Live demo 02': 'paper-to-mathematica-nb_demo',
};

// Split into sections, keep only demo slides, tag each with its demo. href
// attributes are stripped: a filename inside a URL is a path segment, not a
// claim that a local artifact exists.
const demoSections = (html) =>
  html
    .split(/<section\b/)
    .slice(1)
    .map((s) => {
      const m = s.match(/data-section="(Live demo \d+)"/);
      return m ? { label: m[1], text: s.replace(/href="[^"]*"/g, '') } : null;
    })
    .filter(Boolean);

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
const absentDirs = Object.values(DEMO_DIRS).filter((d) => !existsSync(join(REPO, d)));
const onDisk = {};
for (const [label, dir] of Object.entries(DEMO_DIRS)) onDisk[label] = walk(join(REPO, dir));

if (absentDirs.length) {
  console.warn(`SKIP demo directories not checked out: ${absentDirs.join(', ')}`);
  console.warn('     filename mismatches will be reported as warnings, not failures');
}

let failures = 0;
for (const deck of DECKS) {
  const html = readFileSync(join(DECK_DIR, deck.file), 'utf8');

  // One artifact-name set per demo label -- never a cross-demo union.
  const namedByLabel = new Map();
  for (const { label, text } of demoSections(html)) {
    if (!DEMO_DIRS[label]) continue;
    const names = namedByLabel.get(label) || new Set();
    for (const f of text.match(ARTIFACT) || []) {
      if (!IGNORE.has(f)) names.add(f);
    }
    namedByLabel.set(label, names);
  }

  let namedCount = 0;
  const missing = [];
  for (const [label, names] of namedByLabel) {
    namedCount += names.size;
    for (const f of names) {
      if (!onDisk[label].has(f)) missing.push(`${f} (expected in ${DEMO_DIRS[label]})`);
    }
  }

  if (missing.length && absentDirs.length) {
    console.warn(`WARN ${deck.name}: unverifiable -> ${missing.join(', ')}`);
  } else if (missing.length) {
    failures += missing.length;
    console.error(`FAIL ${deck.name}: named on a slide but not on disk -> ${missing.join(', ')}`);
  } else {
    console.log(`PASS ${deck.name}: all ${namedCount} named artifact(s) exist`);
  }
}

console.log(failures ? `\nfilenames: ${failures} missing` : '\nfilenames: clean');
process.exit(failures ? 1 : 0);
