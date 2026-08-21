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

// The demo repositories are nested, untracked git repos. On a fresh clone their
// PARENT directory still exists -- `codebase-onboarding_demo` holds a tracked
// README -- while the files the slides name do not. A directory-existence test
// therefore never fires, and the check this repo's README tells people to run
// fails red on a clean machine. Judge each demo by whether it actually CONTAINS
// artifacts instead.
const ARTIFACT_FILE = /\.(wls|nb|pdf|py)$/;
const onDisk = {};
const populated = {};
for (const [label, dir] of Object.entries(DEMO_DIRS)) {
  onDisk[label] = walk(join(REPO, dir));
  populated[label] = [...onDisk[label]].some((f) => ARTIFACT_FILE.test(f));
}

const unpopulated = Object.entries(DEMO_DIRS).filter(([l]) => !populated[l]).map(([, d]) => d);
if (unpopulated.length) {
  console.warn(`SKIP demo content not checked out: ${unpopulated.join(', ')}`);
  console.warn('     names from those demos are reported as warnings, not failures');
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
  const hard = [];
  const soft = [];
  for (const [label, names] of namedByLabel) {
    namedCount += names.size;
    for (const f of names) {
      if (onDisk[label].has(f)) continue;
      (populated[label] ? hard : soft).push(`${f} (expected in ${DEMO_DIRS[label]})`);
    }
  }

  if (soft.length) console.warn(`WARN ${deck.name}: unverifiable -> ${soft.join(', ')}`);
  if (hard.length) {
    failures += hard.length;
    console.error(`FAIL ${deck.name}: named on a demo slide but not in its demo directory -> ${hard.join(', ')}`);
  } else if (!soft.length) {
    console.log(`PASS ${deck.name}: all ${namedCount} named artifact(s) exist`);
  }
}

console.log(failures ? `\nfilenames: ${failures} missing` : '\nfilenames: clean');
process.exit(failures ? 1 : 0);
