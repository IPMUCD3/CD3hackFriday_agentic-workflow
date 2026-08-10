# Codex Orientation Tone Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace promotional framing in the Codex orientation deck with neutral instructional copy while preserving its structure, technical content, and demonstrations.

**Architecture:** Modify only audience-facing framing copy in the existing standalone HTML deck. Keep CSS, slide order, demo prompts, equations, verification output, resource destinations, and navigation behavior unchanged, then rerender every slide for visual comparison.

**Tech Stack:** HTML5, embedded CSS/JavaScript, shell acceptance checks, browser rendering at 1440×810.

---

### Task 1: Apply the restrained editorial voice

**Files:**
- Modify: `slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html`

- [ ] **Step 1: Confirm the current promotional phrases are present**

Run:

```bash
rg -n "Leave with a workflow|Chat answers|work can be deep|whole research environment|Useful autonomy|turns a good method|observable finish line|not a tour|finish line is evidence|strong prompt names|Pick one real task|choose your first workflow" slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html
```

Expected: matches on the current framing slides.

- [ ] **Step 2: Replace framing titles and supporting copy**

Apply these exact audience-facing replacements:

```text
Slide 1 lede:
An orientation to using Codex with research code, documents, and verification.

Slide 2 kicker/title:
Session outline
Two examples of the same working process.

Slide 2 endpoints:
Demo 01 / Codebase onboarding
Demo 02 / Symbolic covariance derivation

Slide 3 kicker/large text:
Agentic workflow
Inspect.
Act. Check.

Slide 3 lede:
The session can inspect files, run tools, observe the output, and repeat when a task requires it. You can interrupt or redirect it at any point.

Slide 4 title:
Most tasks follow the same
working loop.

Slide 5 title/core:
The working context can include
code, tools, and documents.
Files and tools available to the session

Slide 6 title/verification body:
Sandboxing and approvals define
the operating boundaries.
Tests, renders, or comparisons provide checks on the result.

Slide 8 title:
Skills package reusable
instructions and checks.

Slide 9 title:
Inspect an unfamiliar
codebase.

Slide 10 title:
State the task and how
the result will be checked.

Slide 11 title:
An onboarding summary connects
structure, tests, and risks.

Slide 12 large text:
Demo 01
inspect · map · check
Demo 02
extract · derive · compare

Slide 13 title:
Derive and check the covariance
expressions from the paper.

Slide 14 title:
Derive, run, and
compare the result.

Slide 15 title:
The verification script checks
all six independent entries.

Slide 16 title:
A practical prompt
includes five pieces.

Slide 17 kicker/title:
Resources
Resources for applying the method
to a research task.
```

Expected: factual demo and technical copy remains unchanged.

- [ ] **Step 3: Remove the distracting closing subheadline**

Delete:

```html
<p class="eyeline">Questions · then choose your first workflow</p>
```

Expected: slide 17 ends after its resource list and hidden source note.

### Task 2: Verify copy scope and rendering

**Files:**
- Verify: `slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html`

- [ ] **Step 1: Run the tone gate**

Run:

```bash
if rg -n "Leave with a workflow|Chat answers|work can be deep|whole research environment|Useful autonomy|turns a good method|observable finish line|not a tour|finish line is evidence|strong prompt names|Pick one real task|choose your first workflow" slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html; then exit 1; else echo "tone PASS"; fi
```

Expected: `tone PASS`.

- [ ] **Step 2: Confirm protected technical content remains**

Run:

```bash
node -e "const fs=require('fs');const s=fs.readFileSync('slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html','utf8');const n=(s.match(/<section class=\"slide/g)||[]).length;if(n!==17)throw Error('slide count');for(const x of ['AGENTS.md','~/.codex/config.toml','steady-2d-heat-inverse','jaxPTPolyPol','Chudaykin–Ivanov','C(0,0)','C(4,4)','MATCH','developers.openai.com/codex'])if(!s.includes(x))throw Error('missing '+x);console.log('content PASS')"
```

Expected: `content PASS`.

- [ ] **Step 3: Render and inspect every slide**

Render all 17 slides at 1440×810 after waiting at least 500 ms for the entrance animation.

Expected: 17 full-opacity screenshots with no clipping, overlap, or accidental title wrapping; slide 7 remains correctly spaced.

- [ ] **Step 4: Recheck navigation and terminology**

Test hash navigation, Arrow keys, Home/End, click regions, and link-focused Space handling. Run the existing case-insensitive Claude/Anthropic terminology scan.

Expected: navigation behavior remains unchanged and the terminology scan passes.

### Task 3: Commit the revision

**Files:**
- Commit: `slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html`

- [ ] **Step 1: Review the final diff**

Run:

```bash
git diff --check -- slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html
git diff --word-diff -- slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html
```

Expected: only audience-facing framing copy is changed.

- [ ] **Step 2: Commit**

Run:

```bash
git add slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html
git commit -m "Tone down orientation deck copy"
```

Expected: one commit containing only the deck revision.
