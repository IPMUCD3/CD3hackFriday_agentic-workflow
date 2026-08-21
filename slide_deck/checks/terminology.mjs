import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DECK_DIR } from './decks.mjs';

// The Codex deck must carry no Claude terminology at all.
// The kickoff deck is allowed exactly one deliberate Codex mention: the
// cross-tool bridge note on the instruction-file slide, which names AGENTS.md
// twice (once plain, once as @AGENTS.md). The ceiling of 3 leaves one hit of
// headroom for rewording while still catching a whole reintroduced section.
const RULES = [
  {
    file: 'AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html',
    label: 'ICISE (Codex)',
    pattern: /claude|anthropic/gi,
    maxHits: 0,
  },
  {
    file: 'kickoff_overview_2026June12.html',
    label: 'kickoff (Claude Code)',
    pattern: /\bcodex\b|AGENTS\.md|\.codex/gi,
    maxHits: 3,
  },
];

let failures = 0;
for (const rule of RULES) {
  const html = readFileSync(join(DECK_DIR, rule.file), 'utf8');
  const hits = html.match(rule.pattern) || [];
  if (hits.length > rule.maxHits) {
    failures++;
    console.error(`FAIL ${rule.label}: ${hits.length} hit(s), max ${rule.maxHits} -> ${[...new Set(hits)].join(', ')}`);
  } else {
    console.log(`PASS ${rule.label}: ${hits.length}/${rule.maxHits} allowed hit(s)`);
  }
}

console.log(failures ? `\nterminology: ${failures} rule(s) violated` : '\nterminology: clean');
process.exit(failures ? 1 : 0);
