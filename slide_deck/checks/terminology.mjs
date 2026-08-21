import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DECK_DIR } from './decks.mjs';

// The Codex deck must carry no Claude terminology at all.
// The spec permits cross-tool mentions in exactly one place: the bridge note on
// the instruction-file slide, marked data-cross-tool. Everywhere else must be
// clean. A global count cannot express "here and nowhere else" at any ceiling.
const stripSanctioned = (html) => html.replace(/<aside[^>]*data-cross-tool[\s\S]*?<\/aside>/g, '');

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
    maxHits: 0,
    strip: stripSanctioned,
  },
];

let failures = 0;
for (const rule of RULES) {
  let html = readFileSync(join(DECK_DIR, rule.file), 'utf8');
  if (rule.strip) html = rule.strip(html);
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
