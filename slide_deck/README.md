# Slide decks

Two decks teaching the same agentic-workflow starter pack, one per tool.

| File | Tool | Skin |
| --- | --- | --- |
| `kickoff_overview_2026June12.html` | Claude Code | ivory / coral, serif |
| `AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html` | Codex | near-black / green, sans |

Both are single-file, dependency-free, and work offline. Open either in a browser.

**Navigation:** `←` `→` or click to move between slides. `N` toggles the notes
panel, which carries the background detail the slides deliberately leave off.

The two decks are *structural twins*: identical slide sequence and markup,
differing only in terminology and theme tokens. `checks/parity.mjs` enforces
this, so an edit to one deck that is not mirrored in the other fails the check.

## Checks

```bash
cd checks && npm install && npx playwright install chromium
npm run check
```

| Check | Enforces |
| --- | --- |
| `overflow.mjs` | No text is clipped, at four viewport sizes, notes open and closed |
| `parity.mjs` | Both decks share one structural signature |
| `terminology.mjs` | No cross-tool terminology leakage |
| `filenames.mjs` | Every filename shown on a demo slide exists on disk |
