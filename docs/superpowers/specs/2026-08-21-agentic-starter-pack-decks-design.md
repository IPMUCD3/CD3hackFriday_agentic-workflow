# Agentic workflow starter-pack decks — revision design

## Goal

Revise both slide decks in `slide_deck/` into a matched pair of practical starter packs for
students and junior researchers beginning to use a terminal coding agent:

- `slide_deck/kickoff_overview_2026June12.html` — Claude Code
- `slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html` — Codex

Both files are revised **in place**. Filenames and title-slide dates are preserved: they are
honest provenance for when each talk was given. No new deck files are created.

## Audience and outcome

A student or junior researcher who has never run a coding agent. After the session they should
be able to state what the agent loop is, know where their instruction and permission files live,
recognize the ways an agent fails, write a prompt with a verification criterion in it, and have a
concrete list of things to do in their first week.

Two properties the current decks lack and this revision must supply:

- **Transparency** — enough background that the audience understands *why* the tool behaves as it
  does, including how it fails.
- **Practicality** — guidelines, tips, and an on-ramp they can act on without a presenter.

## Decisions

Settled with the user before this spec was written:

| Decision | Choice |
| --- | --- |
| Relationship between decks | **Mirror twins** — one shared content spine; only terminology and visual skin differ |
| Delivery mode | **Both** — minimal projected slides, with the detail in a toggleable notes layer |
| Content additions | All four: prompt anatomy, failure modes, context/cost hygiene, first-week on-ramp |
| Slide budget | 15–18 per deck; the spine below is **17** |
| Visual skins | Unchanged — kickoff keeps ivory/coral serif, ICISE keeps dark/green sans |

## The mirror-twin contract

"Mirror twins" is a testable property, not an aspiration. Both files:

- contain the same number of `section.slide` elements, in the same order;
- use the same class names and the same element tree within each slide;
- differ **only** in (a) the `:root` design-token block, (b) the font-family declarations,
  (c) the text content where terminology genuinely differs, (d) the `<title>` element.

A structural-parity check (see Verification) enforces this. It is what makes a single editorial
decision propagate to both decks instead of drifting.

## The shared spine — 17 slides

| # | Section | Slide | Notes-layer content |
| ---: | --- | --- | --- |
| 1 | Orientation | Title | venue, date |
| 2 | Orientation | What this session covers — the two-demo arc | timing budget |
| 3 | The model | Chat answers. An agent acts. | — |
| 4 | The model | The loop: gather context → take action → verify results | that you can interrupt at any point |
| 5 | The model | The working set: files, terminal, documents, local tools, its own output | what is *not* in the working set |
| 6 | Control | Boundaries: what it may touch | **instruction files are context, not enforcement** — hard guarantees need hooks |
| 7 | Control | Persistent context: the instruction-file ladder | the `@AGENTS.md` / symlink bridge between the two tools; `/init`, `/context`, `/memory`; keep under 200 lines |
| 8 | Control | ★ Failure modes | confident wrong answers; silent scope creep; edits you did not sanction; work better done by hand |
| 9 | Control | ★ Context and cost hygiene | why long sessions degrade; when to start fresh; scoping the working set |
| 10 | Practice | Anatomy of a prompt: objective · context · constraints · deliverable · verification | worked before/after example |
| 11 | Practice | Skills: turning a method into a repeatable procedure | `SKILL.md` layout |
| 12 | Demo 01 | Setup — an unfamiliar codebase | repo background |
| 13 | Demo 01 | Debrief — structure, tests, risks | the `jaxPTPolyPol` scale check (moved off-slide) |
| 14 | Demo 02 | Setup — paper → verified notebook | Eq. (B1)–(B2) conventions |
| 15 | Demo 02 | Debrief — six independent entries, all MATCH | artifact filenames and the validation command |
| 16 | On-ramp | ★ Your first week | the three-rung ladder: new → power → superpower user |
| 17 | On-ramp | Resources | — |

★ marks content absent from both current decks.

### What is cut

| Cut | From | Rationale |
| --- | --- | --- |
| "Everything hangs off the loop" map | kickoff | rung-3 features; survives as one line on slide 16 |
| Standalone **hooks** slide | kickoff | rung-3; the *concept* survives as slide 6's note |
| Load-order chain slide | kickoff | merged into slide 7 |
| "Bridge" slide | ICISE | carries no concept |
| `SCALE CHECK` block | ICISE slide 11 | an aside, not a concept — moves to notes |
| `.stack-note`, `.equation-note`, `.artifact-line`, cross-tool `.note` | both | on-slide micro-copy — moves to notes |

### Scope guard

Research for this spec surfaced far more material than the spine can hold: auto memory,
`.claude/rules/`, path-scoped rules, `claudeMdExcludes`, Codex profiles and granular approval
policies. **None of these becomes a slide.** They belong in the notes layer or nowhere. The
17-slide budget is a hard ceiling; adding a slide requires cutting one.

## Terminology mapping

Verified against current documentation on 2026-08-21.

| Concept | Claude Code | Codex |
| --- | --- | --- |
| CLI | `claude` | `codex` |
| Personal instructions | `~/.claude/CLAUDE.md` | `~/.codex/AGENTS.md` |
| Project instructions | `./CLAUDE.md` or `./.claude/CLAUDE.md` | `./AGENTS.md` |
| Local / narrower scope | `./CLAUDE.local.md` | `AGENTS.override.md`, per directory |
| Discovery | walks up from cwd; all files **concatenate**, ordered root-down, closest read last | walks root → cwd; at most one file per directory, `AGENTS.override.md` preferred; concatenated root-down |
| Configuration | `~/.claude/settings.json`, `.claude/settings.json`, `.claude/settings.local.json` | `~/.codex/config.toml`, `.codex/config.toml` (trusted projects) |
| Boundaries | `permissions.allow` / `ask` / `deny` | `sandbox_mode`, `approval_policy` |
| Boundary values | evaluated **deny → ask → allow**; first match wins; specificity does not affect order | `sandbox_mode = "read-only" \| "workspace-write" \| "danger-full-access"`; `approval_policy = "untrusted" \| "on-request" \| "never"` |
| Reusable procedures | Skills (`SKILL.md`) | Skills (`SKILL.md`) |

Slide 7 can make one statement true of both tools: *instruction files concatenate from the
project root down toward where you are working, so the closest guidance is read last.*

## Corrections

Defects found during review. All are verified, not suspected.

1. **`MORE SPECIFIC WINS` is wrong, twice over** (kickoff, memory-ladder slide). CLAUDE.md files
   concatenate — nothing overrides anything. And permission rules evaluate deny → ask → allow
   with *specificity explicitly irrelevant*: a broad `Bash(aws *)` deny blocks a narrower
   `Bash(aws s3 ls)` allow. Replace with:
   `INSTRUCTIONS CONCATENATE — CLOSEST READ LAST · PERMISSIONS: DENY → ASK → ALLOW, FIRST MATCH WINS`
2. **Wrong artifact filenames** (ICISE slide 15). Deck says `verify_B1_B2.wls` and
   `gaussian_covariance_B1_B2.nb`. Actual files are
   `verify_power_spectrum_multipole_covariance.wls` and
   `PowerSpectrumMultipoleGaussianCovariance.nb`.
3. **Malformed anchor** (kickoff, resources slide): `<a href=""https://developers.openai.com/codex>`
   — misplaced quotes.
4. **No media queries** in the kickoff deck. It currently survives small viewports by luck of its
   `vh`/`vw` padding, not by design. Port the ICISE deck's `@media (max-width: 920px)` approach.
5. **Composition dead space**: the kickoff "map" slide uses ~55% of frame width; the ICISE
   demo-01 debrief leaves an empty bottom-left quadrant. Both are being replaced or rebalanced.

**Not a defect:** all twelve slide URLs were checked with `curl -sIL` and return 200, including
every `learn.chatgpt.com` link. Link rot was suspected during review and ruled out.

## Notes layer

Both decks gain a notes panel toggled with the `N` key.

- ICISE already has `<aside class="speaker-notes">` markup and a `display: none` rule; the kickoff
  deck needs both added.
- Notes render as an overlay panel, not inline, so projected slides stay minimal.
- The panel must **scroll** when its content exceeds the viewport, never clip.
- Default state is hidden, so a live presentation is unaffected.

This is what lets the decks satisfy "absolutely minimal" and "enough transparency" at once: the
slide carries the concept, the panel carries the background.

## Verification

"All texts visible" is the binding constraint, and it is **not** currently satisfied. A probe
across all 29 slides at 1440×810, 1280×720, 1024×768, and 1280×620 finds exactly one defect:
ICISE slide 11 (demo-01 debrief) overflows its box by 28px at 1280×620. Every other
deck/viewport combination is clean.

The overflow originates in the four-row `.evidence-list`; removing the `SCALE CHECK` row —
which this spec already cuts as aside-grade micro-copy — takes the overflow to exactly 0px,
verified empirically. So one edit satisfies both the editorial and the layout requirement.

An earlier draft of this spec claimed the baseline was clean. That claim came from probing
each deck at a subset of viewports and generalising to the full cross product; the ICISE deck
was never probed at 1280×620. The check harness caught it on its first run. Four checks, all scripted, all committed under `slide_deck/checks/`:

1. **Overflow probe** — for each slide at each of the four viewports, assert no element's
   bounding box escapes the viewport and no slide scrolls. Must also pass with the notes panel
   open, where the panel is expected to scroll rather than clip.
2. **Structural parity** — parse both decks, strip text content, the `:root` token block, and
   font declarations, then diff the remaining tag/class tree. Must be identical.
3. **Terminology scan** — case-insensitive; no `claude`, `anthropic`, `.claude`, or `CLAUDE.md`
   in the Codex deck body. The Claude deck keeps exactly one deliberate Codex mention (slide 7's
   cross-tool bridge note) and no others.
4. **Filename cross-check** — every filename printed on a demo slide must exist in the
   corresponding demo directory.

## Non-goals

- No changes to demo code in `codebase-onboarding_demo/` or `paper-to-mathematica-nb_demo/`.
- No new deck files; no renaming; no change to the title-slide dates.
- No build step, framework, or external dependency. Both decks stay single-file, self-contained,
  offline-capable HTML.
- No reintroduction of promotional register. Commit `3cb712e` deliberately toned this copy down;
  the new tips-and-tricks copy matches that restrained voice.

## Deliverables

- Two revised deck files, in place.
- Four check scripts under `slide_deck/checks/`.
- A short `slide_deck/README.md` recording how to run the checks.
