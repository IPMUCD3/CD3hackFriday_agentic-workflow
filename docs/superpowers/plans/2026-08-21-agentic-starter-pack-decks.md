# Agentic Starter-Pack Decks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revise both slide decks in `slide_deck/` in place into a matched pair of 17-slide starter packs for students and junior researchers, with a scripted check harness that makes "all texts visible" and "mirror twins" verifiable properties rather than claims.

**Architecture:** Both decks stay single-file, dependency-free, offline-capable HTML. A separate `slide_deck/checks/` directory holds a Playwright-based harness — four checks — which is the only place any dependency lives. Checks are written *before* the fixes they guard, so each fix has a failing check to turn green. The ICISE deck is restructured first because it is already closest to the target spine; the kickoff deck is then rewritten to structural parity with it.

**Tech Stack:** HTML5, CSS custom properties, vanilla JS (decks); Node 25 + Playwright (checks only).

**Read first:** `docs/superpowers/specs/2026-08-21-agentic-starter-pack-decks-design.md`. It carries the 17-slide spine, the terminology mapping table, and the verified corrections list. This plan implements that spec and does not restate its rationale.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `slide_deck/kickoff_overview_2026June12.html` | Claude Code deck. Revised in place. |
| `slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html` | Codex deck. Revised in place. |
| `slide_deck/checks/package.json` | Pins Playwright. Checks-only; decks never import it. |
| `slide_deck/checks/overflow.mjs` | Check 1 — no element escapes the viewport, at four sizes, notes closed and open. |
| `slide_deck/checks/parity.mjs` | Check 2 — both decks share one structural signature. |
| `slide_deck/checks/terminology.mjs` | Check 3 — no cross-tool terminology leakage. |
| `slide_deck/checks/filenames.mjs` | Check 4 — every filename printed on a demo slide exists on disk. |
| `slide_deck/checks/run-all.mjs` | Runs all four, exits non-zero on any failure. |
| `slide_deck/README.md` | How to run the checks. |

Each check is a separate file with one responsibility and its own exit code, so a failure names itself without a test runner.

---

## Task 1: Scaffold the check harness

**Files:**
- Create: `slide_deck/checks/package.json`
- Create: `slide_deck/checks/.gitignore`

- [ ] **Step 1: Create the package manifest**

Create `slide_deck/checks/package.json`:

```json
{
  "name": "slide-deck-checks",
  "private": true,
  "type": "module",
  "description": "Verification harness for the agentic workflow slide decks",
  "scripts": {
    "check": "node run-all.mjs"
  },
  "devDependencies": {
    "playwright": "^1.49.0"
  }
}
```

- [ ] **Step 2: Ignore installed modules**

Create `slide_deck/checks/.gitignore`:

```gitignore
node_modules/
```

- [ ] **Step 3: Install Playwright and its browser**

Run:

```bash
cd slide_deck/checks && npm install && npx playwright install chromium
```

Expected: `npm install` reports added packages with no `ERR!` lines; `playwright install chromium` ends with a downloaded-browser message or reports the browser is already installed.

- [ ] **Step 4: Verify the browser actually launches**

Run:

```bash
cd slide_deck/checks && node -e "import('playwright').then(async ({chromium}) => { const b = await chromium.launch(); console.log('launch ok', await b.version()); await b.close(); })"
```

Expected: prints `launch ok` followed by a Chromium version string.

- [ ] **Step 5: Commit**

```bash
git add slide_deck/checks/package.json slide_deck/checks/package-lock.json slide_deck/checks/.gitignore
git commit -m "Add slide-deck check harness scaffold"
```

---

## Task 2: Overflow check (the "all texts visible" guard)

This check must pass **before** any deck edits — it is the regression guard, and the decks are currently clean. Establishing it green first is what makes a later red meaningful.

**Files:**
- Create: `slide_deck/checks/decks.mjs`
- Create: `slide_deck/checks/overflow.mjs`

- [ ] **Step 1: Create the shared deck list**

Create `slide_deck/checks/decks.mjs`:

```js
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const DECK_DIR = join(here, '..');

export const DECKS = [
  { name: 'kickoff (Claude Code)', file: 'kickoff_overview_2026June12.html' },
  { name: 'ICISE (Codex)', file: 'AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html' },
];

export const fileUrl = (f) => 'file://' + join(DECK_DIR, f);
```

- [ ] **Step 2: Write the overflow check**

Create `slide_deck/checks/overflow.mjs`:

```js
import { chromium } from 'playwright';
import { DECKS, fileUrl } from './decks.mjs';

const VIEWPORTS = [
  { width: 1440, height: 810 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 1280, height: 620 },
];

// Runs in the page. Activates each slide in turn and reports anything that
// escapes the viewport. Checks r.top < 0 as well as scrollHeight because the
// slides are flex-centred, so overflow escapes upward too and scrollHeight
// only ever measures downward overflow.
function probe(notesOpen) {
  const slides = [...document.querySelectorAll('.slide')];
  const VW = window.innerWidth;
  const VH = window.innerHeight;
  const findings = [];

  slides.forEach((slide, i) => {
    slides.forEach((s) => s.classList.remove('on'));
    slide.classList.add('on');
    slide.getBoundingClientRect();

    if (slide.scrollHeight - slide.clientHeight > 1) {
      findings.push({ slide: i + 1, kind: 'slide-scrolls', detail: `${slide.scrollHeight - slide.clientHeight}px` });
    }

    slide.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      // A panel that scrolls its own content is allowed to exceed its box.
      if (el.closest('[data-scrollable]')) return;
      if (r.bottom > VH + 1 || r.top < -1 || r.right > VW + 1 || r.left < -1) {
        findings.push({
          slide: i + 1,
          kind: 'clipped',
          notesOpen,
          el: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).trim().split(/\s+/)[0] : ''),
          box: { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) },
          text: (el.textContent || '').trim().slice(0, 60),
        });
      }
    });
  });

  return findings;
}

const browser = await chromium.launch();
let failures = 0;

for (const deck of DECKS) {
  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage({ viewport });
    await page.goto(fileUrl(deck.file));

    for (const notesOpen of [false, true]) {
      if (notesOpen) {
        await page.keyboard.press('n');
        const hasPanel = await page.evaluate(() => !!document.querySelector('[data-notes-panel]'));
        if (!hasPanel) continue; // deck has no notes layer yet
      }
      const findings = await page.evaluate(probe, notesOpen);
      const label = `${deck.name} @ ${viewport.width}x${viewport.height}${notesOpen ? ' (notes open)' : ''}`;
      if (findings.length) {
        failures += findings.length;
        console.error(`FAIL ${label}`);
        for (const f of findings.slice(0, 6)) console.error('     ', JSON.stringify(f));
      } else {
        console.log(`PASS ${label}`);
      }
      if (notesOpen) await page.keyboard.press('n');
    }

    await page.close();
  }
}

await browser.close();
console.log(failures ? `\noverflow: ${failures} finding(s)` : '\noverflow: clean');
process.exit(failures ? 1 : 0);
```

- [ ] **Step 3: Run it against the unmodified decks**

Run:

```bash
cd slide_deck/checks && node overflow.mjs
```

Expected: **seven `PASS` lines and one `FAIL`**, then `overflow: 1 finding(s)`, exit code 1.

The single expected failure is:

```
FAIL ICISE (Codex) @ 1280x620
      {"slide":11,"kind":"slide-scrolls","detail":"28px"}
```

This is correct behaviour, not a harness bug. Slide 11's four-row `.evidence-list` genuinely
overflows at that viewport — a real pre-existing defect the check catches on its first run.
Task 9 step 4 removes the `SCALE CHECK` row for editorial reasons, which takes the overflow to
exactly 0px; this has been verified empirically against a scratch copy.

Commit the check with this failure standing, exactly as Task 3 commits a failing filename
check. **Do not edit either deck to make it pass** — that is Task 9's job.

If the output differs from the above in any way — a different slide, a different viewport, more
than one finding — stop and report, because then the baseline really has moved.

- [ ] **Step 4: Commit**

```bash
git add slide_deck/checks/decks.mjs slide_deck/checks/overflow.mjs
git commit -m "Add slide overflow check"
```

---

## Task 3: Filename check — write it and watch it fail

**Files:**
- Create: `slide_deck/checks/filenames.mjs`

- [ ] **Step 1: Write the check**

Create `slide_deck/checks/filenames.mjs`:

```js
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
```

- [ ] **Step 2: Run it and confirm it fails on the known defect**

Run:

```bash
cd slide_deck/checks && node filenames.mjs
```

Expected: **PASS** for the kickoff deck (it has no demo slides yet — it gains them in Task 10)
and **FAIL** for the ICISE deck naming exactly `verify_B1_B2.wls` and
`gaussian_covariance_B1_B2.nb`, exit code 1. This is the spec's correction #2 reproducing itself.

If the failure lists more than those two names, the demo-slide scoping is not working — the
check is picking up a mock transcript or a URL path segment, neither of which is a claim about
a local artifact.

- [ ] **Step 3: Commit the failing check**

```bash
git add slide_deck/checks/filenames.mjs
git commit -m "Add demo-artifact filename check (currently failing)"
```

---

## Task 4: Fix the wrong Mathematica filenames

**Files:**
- Modify: `slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html` (slide 15, `.artifact-line` and its `speaker-notes`)

- [ ] **Step 1: Confirm the real filenames**

Run:

```bash
ls paper-to-mathematica-nb_demo/
```

Expected output includes exactly:

```
PowerSpectrumMultipoleGaussianCovariance.nb
verify_power_spectrum_multipole_covariance.wls
```

- [ ] **Step 2: Replace the artifact line**

In `slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html`, find:

```html
  <p class="artifact-line">gaussian_covariance_B1_B2.nb · WolframKernel -script verify_B1_B2.wls · symbolic comparison against Eq. (B2)</p>
```

Replace with:

```html
  <aside class="speaker-notes"><p>Artifacts</p><p>PowerSpectrumMultipoleGaussianCovariance.nb · verify_power_spectrum_multipole_covariance.wls · symbolic comparison against Eq. (B2)</p></aside>
```

This both corrects the names and executes the spec's removal of `.artifact-line` micro-copy from the slide face.

- [ ] **Step 3: Replace the stale names in the existing speaker note**

Find:

```html
  <aside class="speaker-notes"><p>[Sources]</p><p>paper-to-mathematica-nb_demo/verify_B1_B2.wls; paper-to-mathematica-nb_demo/gaussian_covariance_B1_B2.nb. Verified with /Applications/Wolfram.app/Contents/MacOS/WolframKernel -script.</p></aside>
```

Replace with:

```html
  <aside class="speaker-notes"><p>Sources</p><p>paper-to-mathematica-nb_demo/verify_power_spectrum_multipole_covariance.wls; paper-to-mathematica-nb_demo/PowerSpectrumMultipoleGaussianCovariance.nb. Validation command: /Applications/Wolfram.app/Contents/MacOS/WolframKernel -script verify_power_spectrum_multipole_covariance.wls</p></aside>
```

- [ ] **Step 4: Re-run the check**

Run:

```bash
cd slide_deck/checks && node filenames.mjs
```

Expected: two `PASS` lines and `filenames: clean`, exit code 0.

- [ ] **Step 5: Confirm no text was pushed off-slide**

Run:

```bash
cd slide_deck/checks && node overflow.mjs
```

Expected: **unchanged from the baseline** — 7 PASS, 1 FAIL, `overflow: 1 finding(s)`, exit code 1.

The single failure must still be the known one and nothing else:

```
FAIL ICISE (Codex) @ 1280x620
      {"slide":11,"kind":"slide-scrolls","detail":"28px"}
```

That defect is slide 11's, and Task 9 clears it. What this step is checking is that moving the
artifact line into a `speaker-notes` aside (which is `display: none`) did not push anything off
slide 15. If a SECOND finding appears, or the finding moves to a different slide, stop — this
task caused a regression.

- [ ] **Step 6: Commit**

```bash
git add slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html
git commit -m "Correct Mathematica artifact filenames on demo-02 debrief"
```

---

## Task 5: Fix the malformed anchor and the factual precedence error

Both defects live in the kickoff deck and are one-line edits with no layout consequence. Grouping them keeps the commit coherent.

**Files:**
- Modify: `slide_deck/kickoff_overview_2026June12.html`

- [ ] **Step 1: Delete the malformed cross-tool resources row**

Find (note the doubled quote after `href=` and the missing closing quote):

```html
	<div class="row"><b>codex</b><span><a href=""https://developers.openai.com/codex>developers.openai.com/codex</a> — /skills · /mcp · /agents</span></div>
```

**Delete this line entirely.** Repairing the anchor was the original instruction; deleting the
row is better. A Codex resources row inside a Claude Code deck is exactly the cross-tool
contamination this revision exists to remove, a dedicated Codex deck now covers those links,
and the malformed anchor disappears with the row it belongs to. The spec allows the kickoff
deck exactly one deliberate Codex mention, and that allowance is spent on slide 7's bridge
note, added in Task 10.

- [ ] **Step 2: Fix the precedence claim**

Find:

```html
<div class="note">MORE SPECIFIC WINS · PERMISSIONS MERGE: DENY → ASK → ALLOW</div>
```

Replace with:

```html
<div class="note">INSTRUCTIONS CONCATENATE — CLOSEST READ LAST · PERMISSIONS: DENY → ASK → ALLOW, FIRST MATCH WINS</div>
```

Why this matters: CLAUDE.md files do not override one another — every discovered file is concatenated, ordered from the filesystem root down, so the file closest to your working directory is read last. And permission rules are evaluated deny, then ask, then allow, with **specificity explicitly irrelevant**: a broad `Bash(aws *)` deny blocks a narrower `Bash(aws s3 ls)` allow. The old wording taught both of these backwards.

- [ ] **Step 3: Remove the cross-tool micro-copy line**

Find:

```html
<div class="note" style="color:var(--muted)">CODEX: SAME LADDER, DIFFERENT NAMES — AGENTS.md (GLOBAL &amp; ./) · ~/.codex/config.toml</div>
```

Delete this line entirely. The equivalent fact moves to the notes layer in Task 9.

- [ ] **Step 4: Verify every anchor is now well-formed**

Run:

```bash
grep -o 'href="[^"]*"' slide_deck/kickoff_overview_2026June12.html
```

Expected: one clean `href="https://..."` per line, no doubled quotes, no unterminated values. Count should be 5 — the sixth was the malformed row deleted in step 1.

- [ ] **Step 5: Verify all links still resolve**

Run:

```bash
grep -o 'href="https://[^"]*"' slide_deck/kickoff_overview_2026June12.html \
  | sed 's/href="//; s/"$//' \
  | while read -r u; do printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 20 "$u")" "$u"; done
```

Expected: every line begins with `200`.

- [ ] **Step 6: Commit**

```bash
git add slide_deck/kickoff_overview_2026June12.html
git commit -m "Fix malformed anchor and correct precedence claim in kickoff deck"
```

---

## Task 6: Terminology check

**Files:**
- Create: `slide_deck/checks/terminology.mjs`

- [ ] **Step 1: Write the check**

Create `slide_deck/checks/terminology.mjs`:

```js
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
```

- [ ] **Step 2: Run it and record the baseline**

Run:

```bash
cd slide_deck/checks && node terminology.mjs
```

Expected: both decks `PASS`. The ICISE deck should report 0 hits. The kickoff deck should report 1 — the lone `AGENTS.md` label inside the "everything hangs off the loop" SVG, which Task 10 removes along with that slide. Task 5 deleted the other cross-tool copy.

If the kickoff deck exceeds 3, list the hits before continuing rather than raising the ceiling: the ceiling is the spec's requirement, not a tuning knob.

- [ ] **Step 3: Commit**

```bash
git add slide_deck/checks/terminology.mjs
git commit -m "Add cross-tool terminology check"
```

---

## Task 7: Structural-parity check — write it and watch it fail

**Files:**
- Create: `slide_deck/checks/parity.mjs`

- [ ] **Step 1: Write the check**

Create `slide_deck/checks/parity.mjs`:

```js
import { chromium } from 'playwright';
import { DECKS, fileUrl } from './decks.mjs';

// The structural signature is the tag/class tree with all text stripped.
// Two mirror-twin decks must produce byte-identical signatures; only the
// :root token block, font declarations, <title>, and text content may differ,
// none of which appear here.
function signature() {
  const lines = [];
  const walk = (el, depth) => {
    const cls = String(el.className || '').trim().split(/\s+/).filter(Boolean).sort().join('.');
    lines.push('  '.repeat(depth) + el.tagName.toLowerCase() + (cls ? '.' + cls : ''));
    [...el.children].forEach((c) => walk(c, depth + 1));
  };
  [...document.body.children].forEach((c) => walk(c, 0));
  return lines;
}

const browser = await chromium.launch();
const sigs = [];

for (const deck of DECKS) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
  await page.goto(fileUrl(deck.file));
  sigs.push({ name: deck.name, lines: await page.evaluate(signature) });
  await page.close();
}

await browser.close();

const [a, b] = sigs;
const max = Math.max(a.lines.length, b.lines.length);
const diffs = [];
for (let i = 0; i < max; i++) {
  if (a.lines[i] !== b.lines[i]) diffs.push({ line: i + 1, a: a.lines[i] ?? '(none)', b: b.lines[i] ?? '(none)' });
}

if (diffs.length) {
  console.error(`FAIL structural parity: ${diffs.length} differing node(s)`);
  console.error(`     ${a.name}: ${a.lines.length} nodes | ${b.name}: ${b.lines.length} nodes`);
  for (const d of diffs.slice(0, 10)) {
    console.error(`     line ${d.line}\n       ${a.name}: ${d.a}\n       ${b.name}: ${d.b}`);
  }
  process.exit(1);
}

console.log(`PASS structural parity: ${a.lines.length} nodes identical in both decks`);
process.exit(0);
```

- [ ] **Step 2: Run it and confirm it fails**

Run:

```bash
cd slide_deck/checks && node parity.mjs
```

Expected: **FAIL**, reporting a large node-count mismatch — the decks currently have 12 and 17 slides with entirely different internal markup. Exit code 1. This check turns green only at the end of Task 11.

- [ ] **Step 3: Commit the failing check**

```bash
git add slide_deck/checks/parity.mjs
git commit -m "Add structural-parity check (currently failing)"
```

---

## Task 8: Add the notes layer to the ICISE deck

The ICISE deck already carries `<aside class="speaker-notes">` markup and a `display: none` rule. This task turns that dead markup into a toggleable panel, which is what lets slides stay minimal while the background stays available.

**Files:**
- Modify: `slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html` (CSS block near line 742; the `<script>` block near line 1020)

- [ ] **Step 1: Replace the hiding rule with panel styling**

Find:

```css
  .speaker-notes { display: none; }
```

Replace with:

```css
  .speaker-notes { display: none; }

  #notes-panel {
    position: fixed;
    right: 0;
    bottom: 0;
    width: min(420px, 38vw);
    max-height: 62vh;
    overflow-y: auto;
    padding: 24px 28px 28px;
    background: var(--panel);
    border-top: 1px solid var(--accent);
    border-left: 1px solid var(--accent);
    z-index: 9;
    display: none;
  }
  #notes-panel.open { display: block; }
  #notes-panel h4 {
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 12px;
  }
  #notes-panel p { font-size: 14.5px; line-height: 1.6; color: var(--panel-fg); margin-bottom: 10px; }
  #notes-panel p:last-child { margin-bottom: 0; }
  #notes-panel .empty { color: #6E6E68; font-style: italic; }
```

Then add the two tokens this rule needs to the ICISE `:root` block, alongside the existing custom properties:

```css
    --panel:#0D0D0D; --panel-fg:#C9C9C4;
```

The `overflow-y: auto` and `max-height` are what satisfy the spec's requirement that the panel scroll rather than clip. Defining `--panel` and `--panel-fg` here rather than hardcoding colours is what lets Task 10 reskin the panel by changing two token values instead of editing the rule.

- [ ] **Step 2: Add the panel element**

Immediately before the closing `</section>` of the last slide — that is, directly before the `<script>` tag — insert:

```html
<div id="notes-panel" data-notes-panel data-scrollable aria-live="polite">
  <h4>Notes — press N to hide</h4>
  <div id="notes-body"></div>
</div>
```

The `data-scrollable` attribute is what the overflow check reads to permit a deliberately scrolling container.

- [ ] **Step 3: Wire up the N key**

In the `<script>` block, immediately before the final call that shows the first slide, insert:

```js
const notesPanel = document.getElementById('notes-panel');
const notesBody = document.getElementById('notes-body');

function renderNotes() {
  const current = document.querySelector('.slide.on');
  const notes = current ? current.querySelector('.speaker-notes') : null;
  notesBody.innerHTML = notes
    ? notes.innerHTML
    : '<p class="empty">No notes for this slide.</p>';
}

addEventListener('keydown', (e) => {
  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    notesPanel.classList.toggle('open');
    if (notesPanel.classList.contains('open')) renderNotes();
  }
});
```

- [ ] **Step 4: Keep the panel in sync when slides change**

Find the function that advances slides and applies the `on` class. At the end of that function, add:

```js
  if (notesPanel.classList.contains('open')) renderNotes();
```

- [ ] **Step 5: Verify the toggle works and nothing clips**

Run:

```bash
cd slide_deck/checks && node overflow.mjs
```

Expected: the ICISE deck now runs both a notes-closed and a notes-open pass at each of the four
viewports (eight ICISE lines instead of four). The kickoff deck still runs four, because it has
no notes panel until Task 10.

Work the arithmetic through before you run it, because the known failure now fires **twice**:

| Deck | Runs | Result |
| --- | ---: | --- |
| kickoff | 4 | 4 PASS (notes pass skipped — no panel) |
| ICISE | 8 | 6 PASS, **2 FAIL** — slide 11 @ 1280x620, once notes-closed and once notes-open |

So the expected output is **10 PASS, 2 FAIL, `overflow: 2 finding(s)`, exit code 1**, and both
findings must name slide 11 at 1280x620. Slide 11 overflows on its own; opening the panel does
not cause it, and the panel is excluded from the probe by its `data-scrollable` attribute.

A finding naming any other slide, or naming the panel itself, means this task regressed
something — most likely the panel is clipping instead of scrolling. Stop and report rather than
adjusting the expectation.

- [ ] **Step 6: Commit**

```bash
git add slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html
git commit -m "Add toggleable notes panel to Codex deck"
```

---

## Task 9: Restructure the ICISE deck to the 17-slide spine

This is the content task. Work against the spine table in the spec.

**Arithmetic, stated explicitly because it is easy to get wrong.** The deck starts at 17
slides. One slide is deleted (Bridge), two pairs are merged into one slide each (the demo
setup and its opening prompt), and three new slides are added. 17 − 1 − 2 + 3 = **17**.

Final mapping from current slide ids to spine positions:

| Spine | Source |
| ---: | --- |
| 1–7 | `slide-1` … `slide-7`, unchanged in position |
| 8 | **new** — Failure modes |
| 9 | **new** — Context and cost hygiene |
| 10 | `slide-16` (prompt recipe), moved up |
| 11 | `slide-8` (skills), moved down |
| 12 | `slide-9` **merged with** `slide-10` |
| 13 | `slide-11` |
| 14 | `slide-13` **merged with** `slide-14` |
| 15 | `slide-15` |
| 16 | **new** — Your first week |
| 17 | `slide-17` |
| — | `slide-12` (Bridge) **deleted** |

**Files:**
- Modify: `slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html`

- [ ] **Step 1: Delete the Bridge slide**

Remove the entire `<section>` with `id="slide-12"` — the `data-section="Bridge"` slide whose
body is only the `.bridge` paragraph. It carries no concept the surrounding slides do not
already establish.

- [ ] **Step 2: Merge the demo-01 setup and prompt slides**

Replace both `slide-9` and `slide-10` with this single section. The prompt shell is the most
practical artifact in the deck for a student, so it is what survives on the slide face; the
setup slide's `.demo-context` grid moves into the notes.

```html
<section class="slide demo-slide" data-number="12" data-section="Live demo 01" aria-label="Codebase onboarding demo">
  <div class="demo-tag">Live demo 01 · codebase onboarding</div>
  <h2>State the task and how<br>the result will be checked.</h2>
  <p class="lede"><code>steady-2d-heat-inverse</code> infers a spatially varying conductivity from a forward heat equation, through an adjoint gradient and PETSc TAO.</p>
  <div class="prompt-shell">
    <div class="prompt-bar">
      <span class="prompt-dot"></span><span class="prompt-dot"></span><span class="prompt-dot"></span>
      <span class="prompt-path">codex · steady-2d-heat-inverse</span>
    </div>
    <div class="prompt-body">Onboard me to this repository as a research collaborator. Independently inspect the source, configuration, and tests; do not rely on prewritten agent notes. Explain the scientific objective; trace the forward → adjoint → optimization data flow; identify the main entry points and test strategy; and flag the first risks I should know about. Cite the files you used. Then create concise AGENTS.md guidance. Do not modify scientific source code.</div>
  </div>
  <p class="handoff">Switch to the terminal →</p>
  <aside class="speaker-notes"><p>Setup</p><p>What Codex receives: a clean copy of an unfamiliar repository. What we ask for: a working model backed by file evidence. Scale check: repeat the same map on jaxPTPolyPol.</p></aside>
</section>
```

- [ ] **Step 3: Merge the demo-02 setup and prompt slides**

Replace both `slide-13` and `slide-14` with this single section:

```html
<section class="slide demo-slide" data-number="14" data-section="Live demo 02" aria-label="Paper to Mathematica demo">
  <div class="demo-tag">Live demo 02 · paper to Mathematica</div>
  <h2>Derive, run, and<br>compare the result.</h2>
  <p class="lede">Cov[P<sub>ℓ₁</sub>(k), P<sub>ℓ₂</sub>(k)] ∝ <span class="integral">∫<sub>−1</sub><sup>1</sup> dμ</span> 𝓛<sub>ℓ₁</sub>(μ) 𝓛<sub>ℓ₂</sub>(μ) [P<sub>g</sub>(k,μ) + 1/n<sub>g</sub>]<sup>2</sup></p>
  <div class="prompt-shell">
    <div class="prompt-bar">
      <span class="prompt-dot"></span><span class="prompt-dot"></span><span class="prompt-dot"></span>
      <span class="prompt-path">codex · paper-to-mathematica-nb_demo</span>
    </div>
    <div class="prompt-body">Treat the PDF as the source of truth; do not inspect existing solution artifacts before deriving. Reproduce Chudaykin–Ivanov (2019), p.45, Eqs. (B1)–(B2), and state the conventions. First create and run a Wolfram verification script that evaluates the exact μ integrals and prints MATCH or MISMATCH for all six independent entries. Only after six matches, compose a reviewer-friendly Mathematica notebook and report the validation command.</div>
  </div>
  <p class="handoff">Switch to the terminal →</p>
  <aside class="speaker-notes"><p>Setup</p><p>Source: paper-to-mathematica-nb_demo/Chudaykin-Ivanov_2019.pdf, Appendix B, Eqs. (B1)–(B2).</p><p>Target: six independent entries for ℓ ∈ {0, 2, 4}. To match Eq. (B2), absorb 1/n_g into P_0.</p></aside>
</section>
```

Note the `.equation` block is replaced by a `.lede` carrying the same expression. If the
equation renders poorly at that size, keep the `.equation` class instead and move the
`<h2>` into the notes — but the two decks must make the same choice, since Task 10 clones
whatever this produces.

- [ ] **Step 4: Move the demo-01 aside off the slide face**

On the demo-01 debrief (`slide-11`), find and delete this row from the `.evidence-list`:

```html
      <p><strong>SCALE CHECK</strong>The same evidence-first map applies to the larger <code>jaxPTPolyPol</code> research stack.</p>
```

Then replace that slide's `speaker-notes` aside with:

```html
  <aside class="speaker-notes"><p>Sources</p><p>codebase-onboarding_demo/steady-2d-heat-inverse/README.md; source modules; tests/test_grad_*.py</p><p>Scale check: the same evidence-first map applies to the larger jaxPTPolyPol research stack.</p></aside>
```

Removing this row does double duty. Editorially it drops an aside that is not a concept. Structurally it is
the fix for the one baseline overflow failure: slide 11 overflows by 28px at 1280×620, and
deleting this row takes it to exactly 0px (verified). It also closes the empty bottom-left
quadrant noted in the spec, because the remaining three rows balance the science-loop column.

After this step, `overflow.mjs` must go fully green — that is the check this task turns.

- [ ] **Step 5: Move the remaining micro-copy into notes**

Delete each of these from its slide face, appending the same text to that slide's
`speaker-notes` aside:

| Slide | Delete this element |
| --- | --- |
| `slide-6` | `<p class="stack-note">User defaults · ~/.codex/config.toml &nbsp;&nbsp; Project overrides · .codex/config.toml for trusted projects</p>` |

**`slide-7`'s `.stack-note` is the one exception — keep it on the slide face**, reworded to
the tool-neutral form so the kickoff deck can carry the identical sentence. It is the single
statement true of both tools and is load-bearing for the mirror-twin design:

```html
    <p class="stack-note">Instruction files concatenate from the project root down toward where you are working — the closest guidance is read last.</p>
```

- [ ] **Step 6: Add slide 8 — Failure modes**

Insert after `slide-7`:

```html
<section class="slide" data-number="08" data-section="Control" aria-label="Failure modes">
  <p class="kicker">What goes wrong</p>
  <h2>Three failure modes worth<br>recognizing early.</h2>
  <div class="three-col">
    <div class="principle">
      <span class="n">01 · PLAUSIBLE</span>
      <h3>Confident and wrong</h3>
      <p>Fluent output is not evidence. An unverified result is a hypothesis.</p>
    </div>
    <div class="principle">
      <span class="n">02 · DRIFT</span>
      <h3>Silent scope creep</h3>
      <p>A small request grows extra edits. Read the diff, not the summary.</p>
    </div>
    <div class="principle">
      <span class="n">03 · REACH</span>
      <h3>Edits you did not sanction</h3>
      <p>Boundaries are configuration, not good intentions. Set them first.</p>
    </div>
  </div>
  <aside class="speaker-notes"><p>Notes</p><p>A fourth mode: work better done by hand. If you can write it faster than you can specify it, write it. The loop pays off when verification is cheaper than production.</p><p>Instruction files are context, not enforcement — the agent reads them and tries to comply, but nothing guarantees it. For a hard guarantee, use a hook or a deny rule.</p></aside>
</section>
```

The headline says three because `.three-col` renders three columns. The fourth mode lives in
the notes, which is where the plan already put it.

- [ ] **Step 7: Add slide 9 — Context and cost hygiene**

Insert immediately after the failure-modes slide:

```html
<section class="slide" data-number="09" data-section="Control" aria-label="Context and cost hygiene">
  <p class="kicker">Session hygiene</p>
  <h2>A session has a working<br>memory, and it fills up.</h2>
  <div class="method">
    <div class="method-row"><b>01</b><span>Scope the working set — point at the files that matter, not the whole tree</span></div>
    <div class="method-row"><b>02</b><span>Start fresh when the task changes — a long session carries its whole history</span></div>
    <div class="method-row"><b>03</b><span>Prefer one verified step to five unverified ones</span></div>
  </div>
  <aside class="speaker-notes"><p>Notes</p><p>Everything the session has read stays in context and is re-sent with each turn, so a long session is both slower and more expensive than a short one. Quality degrades too: relevant detail competes with everything read earlier.</p><p>Practical rule — one task per session. When you find yourself re-explaining what the session already did, start a new one and give it the conclusion rather than the history.</p></aside>
</section>
```

- [ ] **Step 8: Reorder the practice pair**

Move the prompt-recipe section (currently `slide-16`, the one whose `.kicker` reads
"A reusable prompt recipe") so it sits immediately after the hygiene slide, and move the
skills section (currently `slide-8`) so it sits immediately after the recipe. Change the
recipe slide's `<h2>` to:

```html
  <h2>A practical prompt<br>names its own finish line.</h2>
```

Everything else in both sections is unchanged — this is a move, not a rewrite.

- [ ] **Step 9: Add slide 16 — Your first week**

Insert immediately before the resources slide (`slide-17`):

```html
<section class="slide" data-number="16" data-section="Next move" aria-label="First week on-ramp">
  <p class="kicker">Where to start</p>
  <h2>Five things, in this order.</h2>
  <div class="recipe">
    <div class="recipe-row"><b>01</b><strong>Write it down</strong><span>One project instruction file. Conventions, build command, what not to touch.</span></div>
    <div class="recipe-row"><b>02</b><strong>Set the boundary</strong><span>Decide what runs without asking, and what always stops for you.</span></div>
    <div class="recipe-row"><b>03</b><strong>Run something read-only</strong><span>Onboard it to a repository you already know. Check its answer.</span></div>
    <div class="recipe-row"><b>04</b><strong>Add a finish line</strong><span>Put a verification criterion in one real prompt this week.</span></div>
    <div class="recipe-row"><b>05</b><strong>Package what worked</strong><span>When you repeat a prompt a third time, make it a skill.</span></div>
  </div>
  <aside class="speaker-notes"><p>Notes</p><p>Three rungs, and most people should stay on the first two for a while: personal and project instruction files plus permissions; then installing and writing skills; then hooks, subagents, and MCP once a routine is stable enough to be worth automating.</p></aside>
</section>
```

- [ ] **Step 10: Renumber and re-caption**

Every `<section class="slide">` carries `data-number` and `data-section`, and most carry an
`id`. Renumber `data-number` sequentially `01`–`17` in document order, renumber each `id` to
match (`slide-1` … `slide-17`), and set `data-section` per the spine: `Orientation` (1–2),
`Mental model` (3–5), `Control` (6–9), `Practice` (10–11), `Live demo 01` (12–13),
`Live demo 02` (14–15), `Next move` (16–17).

- [ ] **Step 11: Verify the count**

Run:

```bash
grep -c '<section class="slide' slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html
```

Expected: exactly `17`. If it is not 17, the merges in steps 2–3 left a duplicate section
behind — find it before continuing, because Task 10 clones this structure.

- [ ] **Step 12: Verify layout and content**

Run:

```bash
cd slide_deck/checks && node overflow.mjs && node filenames.mjs && node terminology.mjs
```

Expected: all three clean, exit code 0. The two merged demo slides and the three new slides
are the likely sources of a clipping regression — if `overflow.mjs` reports one, shorten the
offending copy rather than reducing the font size, since legibility is the whole point of
the constraint.

- [ ] **Step 13: Commit**

```bash
git add slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html
git commit -m "Restructure Codex deck to the 17-slide starter-pack spine"
```

---

## Task 10: Port the ICISE structure into the kickoff deck

The kickoff deck now becomes a structural clone of the ICISE deck with Claude Code terminology and its own skin. This is the task that turns `parity.mjs` green.

**Files:**
- Modify: `slide_deck/kickoff_overview_2026June12.html`

- [ ] **Step 1: Preserve the skin, replace the skeleton**

Keep exactly three things from the current kickoff file: the `<title>`, the `:root` custom-property block (ivory/coral/serif tokens), and the `--serif`/`--sans`/`--mono` font declarations. Replace everything else — all CSS rules and the entire `<body>` — with the ICISE deck's, so that class names and element structure match node for node.

Concretely: copy the ICISE file, then substitute its `:root` block and font declarations with the kickoff ones, and change the `<title>` back to `Claude Code — CD3 Hack Friday`.

- [ ] **Step 2: Map the tokens**

The ICISE CSS references design tokens by name. Define the kickoff equivalents in its `:root` so no rule needs editing:

```css
  :root{
    --bg:#EBDBBC; --fg:#141413; --muted:#6E6B63; --accent:#D97757;
    --hairline:#E5E1D8; --panel:#F3E8CF; --panel-fg:#4A4740;
    --serif:'Iowan Old Style','Palatino Linotype',Georgia,serif;
    --sans:ui-sans-serif,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;
    --mono:ui-monospace,'SF Mono',Menlo,Consolas,monospace;
  }
```

The `--panel` and `--panel-fg` tokens were introduced in Task 8, so the notes-panel rule needs no editing — only these two values differ.

- [ ] **Step 3: Translate the terminology**

Apply the spec's terminology mapping table to the slide copy. The substitutions that must happen:

| ICISE text | kickoff text |
| --- | --- |
| `codex` (CLI, prompt paths) | `claude` |
| `~/.codex/AGENTS.md` | `~/.claude/CLAUDE.md` |
| `./AGENTS.md` | `./CLAUDE.md` |
| `subdir/AGENTS.override.md` | `./CLAUDE.local.md` |
| `Codex reads…` | `Claude Code reads…` |
| slide 6 boundary values | `permissions.allow` / `ask` / `deny`, evaluated deny → ask → allow, first match wins |
| resources links | `code.claude.com/docs/en`, `/skills`, `/permissions`, `/memory` |

Slide 7's `.stack-note` sentence stays **identical** in both decks — it was written in Task 9 step 3 to be true of both tools.

- [ ] **Step 3b: Carry Task 5's corrections into the new structure**

Task 5 corrected two facts in the kickoff deck's old body, which this task replaces. Both
must land in the new structure or the correction is lost:

- The **permissions precedence** fact belongs on the boundaries slide (spine position 6):
  rules evaluate deny → ask → allow, first match wins, and specificity does not affect the
  order.
- The **concatenation** fact is already carried by slide 7's shared `.stack-note`, written
  in Task 9 step 5. Confirm it survived the clone verbatim.

Verify neither reverted:

```bash
grep -c 'MORE SPECIFIC WINS' slide_deck/kickoff_overview_2026June12.html
```

Expected: `0`.

- [ ] **Step 4: Add the one permitted cross-tool mention**

On slide 7, inside the `speaker-notes` aside only:

```html
<p>If your repository already has an AGENTS.md for another agent, Claude Code does not read it directly — add a CLAUDE.md containing <code>@AGENTS.md</code>, or symlink one to the other, so both tools read the same instructions.</p>
```

This is the single Codex mention the terminology check allows in this deck.

- [ ] **Step 5: Verify structural parity**

Run:

```bash
cd slide_deck/checks && node parity.mjs
```

Expected: `PASS structural parity: N nodes identical in both decks`, exit code 0. If it fails, the reported line number names the first divergent node — a stray element or a class-name difference introduced during translation.

- [ ] **Step 6: Verify everything else still holds**

Run:

```bash
cd slide_deck/checks && node overflow.mjs && node terminology.mjs && node filenames.mjs
```

Expected: all clean. The kickoff deck now runs notes-open passes too, because it inherited the notes panel.

- [ ] **Step 7: Commit**

```bash
git add slide_deck/kickoff_overview_2026June12.html slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html
git commit -m "Rebuild Claude Code deck as structural twin of the Codex deck"
```

---

## Task 11: Aggregate runner and documentation

**Files:**
- Create: `slide_deck/checks/run-all.mjs`
- Create: `slide_deck/README.md`

- [ ] **Step 1: Write the runner**

Create `slide_deck/checks/run-all.mjs`:

```js
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const CHECKS = ['overflow.mjs', 'parity.mjs', 'terminology.mjs', 'filenames.mjs'];

let failed = 0;
for (const check of CHECKS) {
  console.log(`\n=== ${check} ===`);
  const r = spawnSync(process.execPath, [join(here, check)], { stdio: 'inherit' });
  if (r.status !== 0) failed++;
}

console.log(failed ? `\n${failed} of ${CHECKS.length} check(s) failed` : `\nall ${CHECKS.length} checks passed`);
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Write the README**

Create `slide_deck/README.md`:

````markdown
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
````

- [ ] **Step 3: Run the full suite**

Run:

```bash
cd slide_deck/checks && npm run check
```

Expected: four `=== check ===` sections, every one clean, final line `all 4 checks passed`, exit code 0.

- [ ] **Step 4: Confirm the demos were not touched**

Run:

```bash
git status --short codebase-onboarding_demo/ paper-to-mathematica-nb_demo/
```

Expected: no modifications introduced by this work (pre-existing untracked entries from before this plan may remain).

- [ ] **Step 5: Commit**

```bash
git add slide_deck/checks/run-all.mjs slide_deck/README.md
git commit -m "Add aggregate check runner and slide deck README"
```

---

## Task 12: Final review pass

- [ ] **Step 1: Read every slide of both decks at 1440×810**

Run:

```bash
cd slide_deck/checks && node -e "
import('playwright').then(async ({chromium}) => {
  const { DECKS, fileUrl } = await import('./decks.mjs');
  const b = await chromium.launch();
  for (const d of DECKS) {
    const p = await b.newPage({ viewport: { width: 1440, height: 810 } });
    await p.goto(fileUrl(d.file));
    const n = await p.evaluate(() => document.querySelectorAll('.slide').length);
    for (let i = 0; i < n; i++) {
      await p.evaluate((i) => { const s=[...document.querySelectorAll('.slide')]; s.forEach(x=>x.classList.remove('on')); s[i].classList.add('on'); }, i);
      await p.screenshot({ path: \`/tmp/deck-\${d.file.slice(0,6)}-\${String(i+1).padStart(2,'0')}.png\` });
    }
    await p.close();
  }
  await b.close();
  console.log('screenshots written to /tmp');
});
"
```

Expected: 34 PNGs in `/tmp`. Review them for wrapping, orphaned words, and uneven density. This catches what the automated probe cannot: text that fits but reads badly.

- [ ] **Step 2: Confirm the register did not drift**

Re-read the copy added in Task 9 against `docs/superpowers/specs/2026-08-10-codex-orientation-tone-revision-design.md`. That commit deliberately removed promotional slogans. Any new headline that promises a transformation rather than describing what the slide explains should be rewritten.

- [ ] **Step 3: Confirm every spec requirement has landed**

Walk the spec's Corrections list (5 items) and Verification list (4 checks). Each must be either implemented or explicitly recorded as not-done with a reason.

- [ ] **Step 4: Commit any final copy adjustments**

```bash
git add slide_deck/
git commit -m "Final copy pass on starter-pack decks"
```

---

## Self-Review

**Spec coverage.** Every spec section maps to a task: mirror-twin contract → Tasks 7 and 10; 17-slide spine → Task 9 (ICISE) and Task 10 (kickoff); cuts → Task 9 steps 1–3; corrections 1–3 → Tasks 4 and 5; correction 4 (media queries) → **absorbed into Task 10 step 1**, because the kickoff deck inherits the ICISE deck's stylesheet wholesale, including its `@media (max-width: 920px)` block, which is a cleaner fix than porting the rule separately; correction 5 (dead space) → Task 9 step 2 and Task 10 step 1; notes layer → Task 8; verification → Tasks 2, 3, 6, 7, 11.

**Placeholder scan.** No step defers content. The two content-heavy tasks (9, 10) carry the actual slide markup and the actual substitution table rather than an instruction to write copy.

**Type consistency.** `decks.mjs` exports `DECKS`, `DECK_DIR`, and `fileUrl`; all four checks import only those names. The `data-scrollable` attribute set in Task 8 step 2 is the same attribute read by the probe in Task 2 step 2. The `--panel` token introduced in Task 10 step 2 is added to both decks' `:root` in that same step.

**Known ordering constraint.** Task 10 depends on Task 9 being complete, because it clones the ICISE structure. Running them out of order produces a twin of the wrong skeleton.
