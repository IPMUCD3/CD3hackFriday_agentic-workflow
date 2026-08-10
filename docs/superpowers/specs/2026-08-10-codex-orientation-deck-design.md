# Codex agentic workflow orientation deck

## Goal

Create `slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html` as a 40–45 minute orientation to research workflows with ChatGPT Codex. The existing `kickoff_overview_2026June12.html` supplies the core mental model and interaction pattern, but the new deck will use Codex terminology, a Codex-inspired visual system, and two live demonstrations.

The source deck remains unchanged.

## Audience and outcome

The audience is scientific researchers with mixed experience using coding agents. By the end, they should understand:

- the `gather context → take action → verify results` agent loop;
- how Codex receives persistent project guidance through `AGENTS.md`;
- how permissions, sandboxing, skills, and tools shape safe agent behavior;
- how to begin a research task with a concrete prompt and explicit verification criteria;
- why the same loop applies both to learning an unfamiliar codebase and producing a verified scientific artifact.

## Presentation strategy

Use a hybrid live-demo format. Slides establish the model, frame each demonstration, and debrief the result. The detailed interactions happen in live terminal sessions rather than simulated terminal sequences embedded throughout the deck.

Target timing:

| Segment | Time |
| --- | ---: |
| Mental model and Codex orientation | 10 minutes |
| Live codebase-onboarding demonstration | 7 minutes |
| Onboarding debrief and workflow concepts | 5 minutes |
| Live paper-to-Mathematica demonstration | 12 minutes |
| Scientific verification debrief | 6 minutes |
| Next steps, questions, and buffer | 5 minutes |

## Demonstration order

1. **Codebase onboarding** establishes the low-risk, read-heavy form of agency: Codex inventories an unfamiliar repository, finds entry points and tests, reconstructs data flow, and produces a useful working model. Start with `codebase-onboarding_demo/steady-2d-heat-inverse`, whose scientific goal and module structure are quickly legible. Mention `jaxPTPolyPol` briefly as evidence that the same approach scales to a larger multi-layer research codebase.
2. **Paper to Mathematica** is the capstone. Codex reads the Chudaykin–Ivanov paper, extracts Eqs. (B1)–(B2), builds a Mathematica notebook or Wolfram script, performs the angular integrals, and verifies each covariance component. This demonstrates the complete loop across literature, symbolic reasoning, artifact creation, execution, and numerical/symbolic verification.

The narrative escalation is:

`understand existing work → retain project context → create new scientific work → verify the result`

## Slide sequence

The deck will contain 17 low-density slides:

1. **Title** — “Agentic research workflows with Codex”; ICISE; 10 August 2026.
2. **Orientation promise** — from an unfamiliar repository to a verified research artifact.
3. **One-sentence model** — “Chat answers. An agent acts.”
4. **The agent loop** — gather context, act, verify, repeat; the researcher remains in the loop.
5. **What Codex can work with** — repository files, terminal commands, documents, local tools, and connected services.
6. **Safe agency** — sandbox boundaries, approval points, and explicit verification.
7. **Persistent project context** — `AGENTS.md` hierarchy and the principle that more-local guidance refines broader guidance.
8. **Reusable workflows** — skills as procedures that package domain-specific methods and verification steps.
9. **Demo 1: scientific situation** — an unfamiliar PDE inverse-problem codebase.
10. **Demo 1: opening prompt** — a concise, audience-readable prompt and the expected deliverable.
11. **Demo 1: debrief/fallback** — architecture map, entry points, tests, risks, and generated `AGENTS.md`-style knowledge.
12. **Bridge** — the same loop moves from understanding code to creating scientific work.
13. **Demo 2: scientific situation** — Gaussian covariance of power-spectrum multipoles from Eqs. (B1)–(B2).
14. **Demo 2: opening prompt** — read, derive, implement, execute, and verify.
15. **Demo 2: debrief/fallback** — notebook/script artifact and six `MATCH` checks for the independent covariance entries.
16. **A reusable prompt recipe** — objective, context, constraints, deliverable, and verification.
17. **Next move/resources** — official Codex resources and an invitation to try one real research task.

Slides 11 and 15 double as reliable fallbacks if a live dependency or tool invocation fails. In a successful live run, they are used as post-demo debriefs rather than spoilers.

## Visual direction

Use a custom ChatGPT Codex-inspired theme rather than the source deck’s Claude-like ivory/coral styling:

- near-black canvas (`#0D0D0D`) with warm-white primary type (`#F4F4F0`);
- OpenAI green accent (`#10A37F`) for progress, active states, verification, and key words;
- charcoal and gray secondary tones for dividers and supporting text;
- modern sans-serif hierarchy using system fonts, paired with a compact system monospace for prompts and commands;
- subtle grid-line or terminal-caret motifs, with ample margins and one dominant composition per slide;
- minimal motion: short opacity/vertical transitions that respect reduced-motion preferences.

The deck remains a dependency-free, responsive 16:9 HTML presentation with keyboard, click, and touch navigation, plus progress and slide-count indicators. It will not depend on external fonts, JavaScript libraries, or remote images.

## Terminology migration

Every audience-facing Claude Code-specific term will be removed or translated to current Codex concepts. The migration includes:

| Source concept | Codex treatment |
| --- | --- |
| Claude Code / `claude` | Codex / `codex` |
| `CLAUDE.md` | `AGENTS.md` |
| `CLAUDE.local.md` | `AGENTS.override.md`, or a nested `AGENTS.md` for directory-specific guidance |
| `.claude/settings*.json` | user-level `~/.codex/config.toml` and trusted project-level `.codex/config.toml` |
| allow/ask/deny permission lists | Codex sandbox and approval-policy model |
| Claude lifecycle hooks | omit; cover sandboxing, approvals, and skills without implying feature parity |
| Claude documentation and Anthropic skill links | official OpenAI Codex documentation and skill resources |
| Claude-specific plugin/subagent wording | use only Codex capabilities confirmed in current official documentation |

Before writing final copy, current terminology and links will be checked against official OpenAI documentation. A final case-insensitive scan will ensure that no `Claude`, `Anthropic`, `.claude`, or `CLAUDE.md` references remain in the new deck.

## Validation

The finished HTML will be checked at representative desktop and laptop viewport sizes. Validation includes:

- rendering every slide and reviewing it individually at full size;
- checking title wrapping, text clipping, diagram labels, prompt readability, and consistent margins;
- verifying keyboard, mouse, and touch navigation, progress bar, counter, and internal state;
- checking external links and HTML syntax;
- confirming the source deck was not modified;
- scanning for residual Claude-specific terminology;
- verifying that the two demonstration prompts match the files currently present in their respective demo directories.

## Deliverable

One new file:

`slide_deck/AIagentic_workflow_orientation_tutorial_ICISE_2026August10.html`

No demo code, source deck, or existing user files will be changed.
