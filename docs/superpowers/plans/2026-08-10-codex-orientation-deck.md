# Codex Orientation Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-free 17-slide HTML orientation deck for a 40–45 minute ICISE session, using a Codex visual theme and two live research demonstrations.

**Architecture:** Preserve the source deck as a reference and create one standalone HTML file containing semantic slide sections, embedded theme CSS, and embedded navigation JavaScript. Live terminal demonstrations are bracketed by setup, prompt, and debrief/fallback slides; current Codex terminology is verified against official OpenAI documentation before final copy is accepted.

**Tech Stack:** HTML5, CSS custom properties and responsive layout, inline SVG for one simple loop diagram, vanilla JavaScript, browser screenshot/render QA, shell-based acceptance checks.

---

## File structure

- Create: `slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html` — the complete standalone presentation.
- Preserve: `slide_deck/kickoff_overview_2026June12.html` — source/reference deck; no edits.
- Use temporarily: `/tmp/codex-orientation-deck/` — official-document notes, browser screenshots, and QA output; do not commit.

### Task 1: Verify Codex terminology and source material

**Files:**
- Read: `slide_deck/kickoff_overview_2026June12.html`
- Read: `paper-to-mathematica-nb_demo/README.md`
- Read: `paper-to-mathematica-nb_demo/verify_B1_B2.wls`
- Read: `codebase-onboarding_demo/steady-2d-heat-inverse/README.md`
- Read: `codebase-onboarding_demo/steady-2d-heat-inverse/CLAUDE.md`
- Read: `codebase-onboarding_demo/jaxPTPolyPol/AGENTS.md`
- Create temporarily: `/tmp/codex-orientation-deck/source-notes.txt`

- [ ] **Step 1: Record the source-deck checksum before editing**

Run:

```bash
shasum -a 256 slide_deck/kickoff_overview_2026June12.html
```

Expected: one SHA-256 value to compare again in Task 5.

- [ ] **Step 2: Verify current product terminology using official OpenAI documentation**

Confirm and record direct official links for:

```text
AGENTS.md and AGENTS.override.md instruction discovery
~/.codex/config.toml and trusted-project .codex/config.toml
approval policy and sandbox mode
skills
MCP
Codex CLI and app entry points
```

Expected: the temporary source notes contain a concise terminology ledger and official links; no Anthropic or third-party source is used for Codex behavior claims.

- [ ] **Step 3: Extract the two live-demo contracts**

Record these exact outcomes:

```text
Demo 1: identify scientific purpose, architecture, entry points, data flow, tests, and risks in steady-2d-heat-inverse; mention jaxPTPolyPol only as the scaling example.
Demo 2: read Chudaykin–Ivanov Eqs. (B1)–(B2), derive the six independent covariance entries, create an executable Wolfram artifact, and show six MATCH results from verify_B1_B2.wls.
```

Expected: both demos have a starting situation, opening prompt, observable result, and verification criterion.

### Task 2: Create the standalone deck and core interaction

**Files:**
- Create: `slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html`

- [ ] **Step 1: Run the initial acceptance check and confirm it fails**

Run:

```bash
node -e "const fs=require('fs'); const p='slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html'; if(!fs.existsSync(p)) throw Error('deck missing')"
```

Expected: non-zero exit with `Error: deck missing`.

- [ ] **Step 2: Create the document shell and Codex visual system**

Implement:

```text
17 semantic <section class="slide"> elements
16:9 full-viewport composition with safe responsive padding
near-black #0D0D0D canvas, warm-white #F4F4F0 type, #10A37F accent
system sans-serif and monospace stacks
subtle grid/caret motifs without external assets
progress bar, slide counter, section label, and live-demo marker
reduced-motion support
```

Expected: the file is self-contained and contains no external stylesheet, font, image, or script dependency.

- [ ] **Step 3: Implement navigation**

Implement vanilla JavaScript supporting:

```text
ArrowRight, Space, PageDown, and Enter: next slide
ArrowLeft, PageUp, and Backspace: previous slide
Home and End: first and last slide
click/tap right half: next; left half: previous
URL hash updates to #1 through #17
initial slide restored from a valid hash
```

Expected: navigation clamps safely between slides 1 and 17, and the counter/progress bar update after every move.

- [ ] **Step 4: Run the shell acceptance check**

Run:

```bash
node -e "const fs=require('fs'); const s=fs.readFileSync('slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html','utf8'); const n=(s.match(/<section class=\"slide/g)||[]).length; if(n!==17) throw Error('expected 17 slides, got '+n); for(const x of ['#0D0D0D','#10A37F','AGENTS.md','gather','verify']) if(!s.includes(x)) throw Error('missing '+x); console.log('structure PASS')"
```

Expected: `structure PASS`.

### Task 3: Write the 17-slide narrative and live-demo bridges

**Files:**
- Modify: `slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html`

- [ ] **Step 1: Add slides 1–8**

Use these audience-facing jobs:

```text
1 title: Agentic research workflows with Codex; ICISE; 10 August 2026
2 promise: unfamiliar repository → verified research artifact
3 model: Chat answers. An agent acts.
4 loop: gather context → take action → verify results → repeat
5 reach: repository, terminal, documents, local tools, connected services
6 safety: sandbox boundaries, approval points, verification
7 context: AGENTS.md hierarchy and local refinements
8 procedures: skills package repeatable domain methods and checks
```

Expected: no slide requires more than about 45 seconds of reading; titles remain one line at a 16:9 viewport.

- [ ] **Step 2: Add slides 9–11 for codebase onboarding**

```text
9 situation: unfamiliar steady-state heat inverse-problem repository
10 opening prompt: ask for purpose, architecture, entry points, data flow, tests, and risks; request evidence from files
11 debrief/fallback: forward → adjoint → TAO loop, key modules, three gradient checks, and the lesson that context gathering is useful work
```

Expected: slide 10 is a clear handoff to the live terminal; slide 11 works as post-demo synthesis and failure fallback.

- [ ] **Step 3: Add slides 12–15 for the scientific artifact**

```text
12 bridge: understand existing work → create and verify new work
13 situation: derive Gaussian covariance of P0, P2, P4 from Eqs. (B1)–(B2)
14 opening prompt: read the paper, explain assumptions, build an executable Mathematica notebook/script, integrate over mu, and verify every independent matrix entry
15 debrief/fallback: artifact path plus C(0,0), C(0,2), C(0,4), C(2,2), C(2,4), C(4,4) = MATCH
```

Expected: the second demo visibly escalates from reading to artifact creation, execution, and verification.

- [ ] **Step 4: Add slides 16–17**

```text
16 prompt recipe: objective + context + constraints + deliverable + verification
17 next move: try one real research task; official Codex documentation links; concise Q&A close
```

Expected: the ending gives the audience an actionable first task rather than a feature inventory.

### Task 4: Terminology, interaction, and visual QA

**Files:**
- Modify: `slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html`
- Create temporarily: `/tmp/codex-orientation-deck/screenshots/`

- [ ] **Step 1: Run the terminology gate**

Run:

```bash
if rg -n -i 'claude|anthropic|\.claude|CLAUDE\.md' slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html; then exit 1; else echo 'terminology PASS'; fi
```

Expected: `terminology PASS` with no matches.

- [ ] **Step 2: Validate links and document structure**

Run:

```bash
node -e "const fs=require('fs'); const s=fs.readFileSync('slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html','utf8'); if((s.match(/<!DOCTYPE html>/gi)||[]).length!==1) throw Error('doctype'); const slides=[...s.matchAll(/<section class=\"slide[^\"]*\" id=\"([^\"]+)\"/g)].map(x=>x[1]); if(slides.length!==17||new Set(slides).size!==17) throw Error('slide ids'); const hrefs=[...s.matchAll(/href=\"([^\"]*)\"/g)].map(x=>x[1]); if(hrefs.some(x=>!x)) throw Error('empty href'); if(hrefs.some(x=>!/^https:\/\/(developers\.openai\.com|learn\.chatgpt\.com)\//.test(x))) throw Error('non-official link'); console.log('semantic PASS')"
```

Expected: `semantic PASS`.

- [ ] **Step 3: Render every slide at 1440×810**

Run:

```bash
mkdir -p /tmp/codex-orientation-deck/screenshots
for i in {1..17}; do n=$(printf '%02d' "$i"); '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --headless=new --hide-scrollbars --disable-gpu --window-size=1440,810 --screenshot="/tmp/codex-orientation-deck/screenshots/slide-${n}.png" "file:///Users/nguyenmn/CD3HackFriday_agentic-workflow/slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html#${i}"; done
```

Expected: 17 screenshots named `slide-01.png` through `slide-17.png`.

- [ ] **Step 4: Inspect and fix every slide**

Check each screenshot for:

```text
clipping or unexpected wrapping
small text or low contrast
overlap between content, counter, and progress elements
inconsistent margins or alignment
diagram arrows crossing labels
prompt blocks too dense to read from the back of a room
fallback content revealing results before the live-demo handoff
```

Expected: all text is visible, demo handoffs are obvious, and the deck maintains one dominant composition per slide.

- [ ] **Step 5: Exercise navigation**

Test all keyboard keys, first/last bounds, right/left click regions, and loading `#10`, `#14`, and `#17` directly.

Expected: each interaction lands on the correct slide and updates hash, counter, and progress bar.

### Task 5: Final verification and commit

**Files:**
- Verify: `slide_deck/kickoff_overview_2026June12.html`
- Verify and commit: `slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html`

- [ ] **Step 1: Confirm the source deck is unchanged**

Run:

```bash
shasum -a 256 slide_deck/kickoff_overview_2026June12.html
git diff --exit-code -- slide_deck/kickoff_overview_2026June12.html
```

Expected: checksum matches Task 1 and `git diff` exits zero.

- [ ] **Step 2: Run the final acceptance suite**

Repeat the structure check, terminology gate, semantic link check, and screenshot-count check.

Expected:

```text
structure PASS
terminology PASS
semantic PASS
17 screenshots
```

- [ ] **Step 3: Review the final diff**

Run:

```bash
git diff --check -- slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html
git diff --stat -- slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html
git status --short
```

Expected: no whitespace errors; only the intended deck is staged in the implementation commit; unrelated user changes remain untouched.

- [ ] **Step 4: Commit the deck**

Run:

```bash
git add slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html
git commit -m "Add Codex research workflow orientation deck"
```

Expected: one commit containing only the new deck.
