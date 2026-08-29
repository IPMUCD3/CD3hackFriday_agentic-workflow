# Cold dry-run results

Date: 2026-08-29  
Environment: macOS, Python 3.14.3, uv 0.12.7, Codex CLI 0.150.1

## Computational checks

| Gate | Result | Evidence |
|---|---|---|
| Source provenance | **PASS** | Both PLOS PDFs match pinned SHA-256 values. |
| Independent oracle integrity | **PASS** | Nine literal Table 4 values and 36 checkpoints spanning all 12 Figure 1 curves are tested before implementation. |
| Solution test suite | **PASS** | `18 passed in 0.84s`; measured wall time `1.02s`. |
| Reproduction command | **PASS** | Exit code 0; final `OVERALL: MATCH`; measured wall time `0.35s`. |
| Table 4 | **PASS** | All nine values match the precision displayed in the paper. |
| Table 2 audit | **PASS** | Printed expression is intentionally `UNMATCHED`; corrected expression is `MATCH`. |
| Figure 1 data | **PASS** | All 12 curves match three independent checkpoints at absolute tolerance `1e-12`. |
| Figure 1 visual structure | **PASS** | Three power panels, four bias curves, axes, ordering, and legend match the scientific content of PDF page 3. |
| Starter boundary | **PASS** | After dependency setup, starter collection stops at missing `ioannidis_reproduction.model`, not missing data or environment configuration. |

## Learning-experience gates

| Gate | Result | Evidence or blocker |
|---|---|---|
| Useful native-App artifact within five minutes | **NOT YET TESTED** | Desktop control is prohibited for `com.openai.codex` in this environment. |
| Automated CLI proxy for Prompt 1 | **FAIL** | The clean read-only proxy spent more than 30 minutes following PDF inspection procedures and produced no final artifact. It is not a valid performance proxy for native PDF handling. |
| Independent App audit discovers the correction | **NOT YET TESTED** | The correction is verified from PLOS and represented in the curated audit, but the native fresh-task interaction was not observable. |
| Replication brief supports a cold agent implementation | **NOT YET TESTED** | Its artifact contract passes, but an independent agent has not yet implemented the starter using only the brief. |
| Cold CLI implementation within 20 minutes | **NOT YET TESTED** | Solution execution is sub-second; implementation time from the starter remains unmeasured. |
| Complete core within 60 minutes | **NOT YET TESTED** | Requires a native-App and instructor dry run. |
| Researcher explains reproduction versus endorsement | **NOT YET TESTED** | Requires observation with a participant. |

## Decision

The paper is a **computationally strong provisional choice**: it has an exact
figure, nine numerical checks, and a correction that produces a genuine
`UNMATCHED` to `MATCH` verification moment. It is not yet the final paper choice.
Run the three prompts in the native App and test with at least two non-technical
researchers before promotion.
