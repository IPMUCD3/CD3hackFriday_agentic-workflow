import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const DECK_DIR = join(here, '..');

export const DECKS = [
  { name: 'kickoff (Claude Code)', file: 'kickoff_overview_2026June12.html' },
  { name: 'ICISE (Codex)', file: 'AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html' },
];

export const fileUrl = (f) => 'file://' + join(DECK_DIR, f);
