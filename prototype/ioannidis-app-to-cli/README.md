# Private prototype: paper audit to tested reproduction

This prototype tests one field-neutral learning arc:

> Understand a paper in the App, independently audit the result, write a
> replication contract, and let the CLI execute that contract against an
> independent oracle.

The source is Ioannidis (2005), *Why Most Published Research Findings Are
False*. Reproducing its calculations does **not** endorse its assumptions or
headline claim.

## Intended 60-minute path

### 1. App: useful result first (0-15 minutes)

Upload only `sources/ioannidis-2005.pdf`. Run
`app/prompts/01-paper-companion.md`. Export the new answer as
`paper-companion.md`; do not substitute the curated example.

### 2. App: independent audit (15-23 minutes)

Open a fresh task. Upload the paper and the `paper-companion.md` you just
created, then run `app/prompts/02-independent-audit.md`. The audit should
discover the 2022 correction without being given the correction PDF. Export
the new answer as `audit-report.md`.

### 3. App: portable handoff (23-30 minutes)

Open a fresh task with the original paper, your new `audit-report.md`, and the
two supplied oracle files `cli/starter/reference/published_table4.csv` and
`cli/starter/reference/figure1_checkpoints.json`. Run
`app/prompts/03-replication-brief.md`. Export the new answer as
`cli/starter/replication-brief.md`.

### 4. CLI: implement the contract (30-50 minutes)

Open `cli/starter/` in Codex CLI and ask:

```text
Read replication-brief.md. Implement the audited reproduction without changing
reference/ or tests/. Run every check and explain the intentional Table 2
UNMATCHED result.
```

The starter contains the independently transcribed reference values and
black-box tests, but no scientific implementation.

Files under `app/example-outputs/` are instructor previews only. The workshop
chain always passes the participant's newly exported artifact to the next stage.

### 5. Debrief (50-60 minutes)

Discuss why these are different claims:

- The implementation reproduces the paper's calculation.
- The equation is internally consistent after the correction.
- The model assumptions describe a particular scientific field.
- The paper's headline conclusion is warranted.

Only the first two are tested here.

## Verify the completed solution

Install [uv](https://docs.astral.sh/uv/), then run:

```bash
cd cli/solution
uv sync --locked
uv run pytest -q
uv run ioannidis-reproduce --output artifacts/figure1-reproduced.png
```

Expected finish:

```text
Table 2 printed expression: UNMATCHED (...)
Table 2 corrected expression: MATCH (...)
OVERALL: MATCH
```

Each of the nine Table 4 values and 12 Figure 1 curves also receives an explicit
status. The intentional `UNMATCHED` is evidence that the published correction is
material to the displayed Table 2 cell.

## Safety and source policy

Use public or explicitly authorized papers. Do not upload confidential reviews,
unpublished manuscripts, or sensitive data without institutional approval. The
bundled paper and correction are CC BY; citations and hashes are recorded in
`sources/SOURCES.md`.

## Prototype status

The computational path passes. The exact native-App and novice-participant gates
remain open because this environment cannot automate the Codex desktop App. The
files under `app/example-outputs/` are curated reference artifacts, not claimed
native-App cold-run outputs. See `dry-run/RESULTS.md`.
