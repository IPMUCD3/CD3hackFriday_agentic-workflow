# Ioannidis App-to-CLI Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and cold-test a private, self-contained prototype that turns Ioannidis (2005) into a personalized App artifact, an independent audit, a replication brief, and a tested CLI reproduction of Figure 1, Table 4, and the corrected Table 2 identity.

**Architecture:** Keep the prototype under `prototype/ioannidis-app-to-cli/` and isolate the three App prompts from the computational exercise. The CLI solution reads immutable reference data transcribed from the paper, implements the published equations in a small Python package, produces the figure, and reports `MATCH` or `UNMATCHED` for every check. A deliberately incomplete `starter/` snapshot contains the same oracle and tests but no scientific implementation.

**Tech Stack:** Python 3.11+, uv, NumPy, Matplotlib, pytest, Markdown, PLOS CC-BY source PDFs.

---

## File map

- `prototype/ioannidis-app-to-cli/README.md` - private-prototype entry point and 60-minute flow.
- `prototype/ioannidis-app-to-cli/sources/` - paper, correction, attribution, DOI, and SHA-256 provenance.
- `prototype/ioannidis-app-to-cli/app/prompts/` - the three short App prompts.
- `prototype/ioannidis-app-to-cli/app/example-outputs/` - cold-run companion, audit, and replication brief.
- `prototype/ioannidis-app-to-cli/cli/solution/` - working package, independent oracle, tests, lockfile, and generated figure.
- `prototype/ioannidis-app-to-cli/cli/starter/` - learner starting state with oracle and black-box tests but no implementation.
- `prototype/ioannidis-app-to-cli/dry-run/RESULTS.md` - timed gate results and remaining App-UI caveats.

### Task 1: Stage and verify the source packet

**Files:**
- Create: `prototype/ioannidis-app-to-cli/cli/solution/pyproject.toml`
- Create: `prototype/ioannidis-app-to-cli/cli/solution/tests/test_sources.py`
- Create: `prototype/ioannidis-app-to-cli/sources/ioannidis-2005.pdf`
- Create: `prototype/ioannidis-app-to-cli/sources/ioannidis-2022-correction.pdf`
- Create: `prototype/ioannidis-app-to-cli/sources/SOURCES.md`

- [ ] **Step 1: Create the Python test project**

```toml
[project]
name = "ioannidis-reproduction"
version = "0.1.0"
description = "Verified reproduction of Ioannidis (2005) Figure 1 and Table 4"
requires-python = ">=3.11"
dependencies = [
  "matplotlib>=3.10,<4",
  "numpy>=2,<3",
]

[dependency-groups]
dev = ["pytest>=8,<9"]

[project.scripts]
ioannidis-reproduce = "ioannidis_reproduction.cli:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/ioannidis_reproduction"]

[tool.pytest.ini_options]
pythonpath = ["src"]
testpaths = ["tests"]
```

- [ ] **Step 2: Write the failing source-provenance test**

```python
from hashlib import sha256
from pathlib import Path


SOURCES = Path(__file__).parents[3] / "sources"


def digest(name: str) -> str:
    return sha256((SOURCES / name).read_bytes()).hexdigest()


def test_open_access_source_hashes_are_pinned() -> None:
    assert digest("ioannidis-2005.pdf") == (
        "ffc1005680cb620eec4c913437dfabbf311b535cfe16cbaeb2faec1f92afc362"
    )
    assert digest("ioannidis-2022-correction.pdf") == (
        "3cf06b98e2f61177d80c53ada12cd91949400dfdd114fefe9e2b47b87948c65e"
    )
```

- [ ] **Step 3: Run the test and verify RED**

Run: `cd prototype/ioannidis-app-to-cli/cli/solution && uv run pytest tests/test_sources.py -v`

Expected: FAIL with `FileNotFoundError` for `sources/ioannidis-2005.pdf`.

- [ ] **Step 4: Copy the downloaded PLOS PDFs and add attribution**

Copy `/tmp/ioannidis-2005.pdf` and `/tmp/ioannidis-2022-correction.pdf` into `sources/`. Use this exact provenance record:

```markdown
# Sources

## Original paper

Ioannidis, J. P. A. (2005). Why Most Published Research Findings Are False.
*PLOS Medicine*, 2(8), e124. https://doi.org/10.1371/journal.pmed.0020124

- License: Creative Commons Attribution License
- Download: https://journals.plos.org/plosmedicine/article/file?id=10.1371/journal.pmed.0020124&type=printable
- SHA-256: `ffc1005680cb620eec4c913437dfabbf311b535cfe16cbaeb2faec1f92afc362`

## Correction

Ioannidis, J. P. A. (2022). Correction: Why Most Published Research Findings
Are False. *PLOS Medicine*, 19(8), e1004085.
https://doi.org/10.1371/journal.pmed.1004085

- License: Creative Commons Attribution License
- Download: https://journals.plos.org/plosmedicine/article/file?id=10.1371/journal.pmed.1004085&type=printable
- SHA-256: `3cf06b98e2f61177d80c53ada12cd91949400dfdd114fefe9e2b47b87948c65e`
```

- [ ] **Step 5: Run the test and verify GREEN**

Run: `cd prototype/ioannidis-app-to-cli/cli/solution && uv run pytest tests/test_sources.py -v`

Expected: `1 passed`.

- [ ] **Step 6: Commit**

```bash
git add prototype/ioannidis-app-to-cli
git commit -m "test: pin Ioannidis source artifacts"
```

### Task 2: Add the independent paper oracle

**Files:**
- Create: `prototype/ioannidis-app-to-cli/cli/solution/tests/test_reference_data.py`
- Create: `prototype/ioannidis-app-to-cli/cli/solution/reference/published_table4.csv`
- Create: `prototype/ioannidis-app-to-cli/cli/solution/reference/figure1_checkpoints.json`

- [ ] **Step 1: Write the failing oracle-integrity test**

```python
import csv
import json
from pathlib import Path


REFERENCE = Path(__file__).parents[1] / "reference"


def test_table4_oracle_is_a_literal_transcription() -> None:
    with (REFERENCE / "published_table4.csv").open(newline="") as handle:
        rows = list(csv.DictReader(handle))
    assert [(row["published_ppv"], row["digits"]) for row in rows] == [
        ("0.85", "2"),
        ("0.85", "2"),
        ("0.41", "2"),
        ("0.23", "2"),
        ("0.17", "2"),
        ("0.20", "2"),
        ("0.12", "2"),
        ("0.0010", "4"),
        ("0.0015", "4"),
    ]


def test_figure1_oracle_covers_every_published_curve() -> None:
    checkpoints = json.loads((REFERENCE / "figure1_checkpoints.json").read_text())
    assert len(checkpoints) == 12
    assert {(row["power"], row["bias"]) for row in checkpoints} == {
        (power, bias)
        for power in (0.8, 0.5, 0.2)
        for bias in (0.05, 0.2, 0.5, 0.8)
    }
    assert all(row["odds"] == [0.1, 0.5, 1.0] for row in checkpoints)
```

- [ ] **Step 2: Run the test and verify RED**

Run: `cd prototype/ioannidis-app-to-cli/cli/solution && uv run pytest tests/test_reference_data.py -v`

Expected: FAIL because `reference/published_table4.csv` does not exist.

- [ ] **Step 3: Add the literal Table 4 CSV**

```csv
power,odds,bias,published_ppv,digits,label
0.80,1,0.10,0.85,2,Adequately powered RCT with little bias
0.95,2,0.30,0.85,2,Confirmatory meta-analysis of good-quality RCTs
0.80,0.3333333333333333,0.40,0.41,2,Meta-analysis of small inconclusive studies
0.20,0.2,0.20,0.23,2,Underpowered but well-performed phase I/II RCT
0.20,0.2,0.80,0.17,2,Underpowered poorly performed phase I/II RCT
0.80,0.1,0.30,0.20,2,Adequately powered exploratory epidemiological study
0.20,0.1,0.30,0.12,2,Underpowered exploratory epidemiological study
0.20,0.001,0.80,0.0010,4,Discovery-oriented exploratory research with massive testing
0.20,0.001,0.20,0.0015,4,Massive testing with more limited bias
```

- [ ] **Step 4: Add the 12 independent Figure 1 checkpoints**

Each JSON object contains `power`, `bias`, `odds: [0.1, 0.5, 1.0]`, and these hard-coded PPV values:

```text
0.8/0.05: 0.453781512605, 0.805970149254, 0.892561983471
0.8/0.20: 0.259259259259, 0.636363636364, 0.777777777778
0.8/0.50: 0.146341463415, 0.461538461538, 0.631578947368
0.8/0.80: 0.105960264901, 0.372093023256, 0.542372881356
0.5/0.05: 0.350000000000, 0.729166666667, 0.843373493976
0.5/0.20: 0.200000000000, 0.555555555556, 0.714285714286
0.5/0.50: 0.125000000000, 0.416666666667, 0.588235294118
0.5/0.80: 0.100000000000, 0.357142857143, 0.526315789474
0.2/0.05: 0.197530864198, 0.551724137931, 0.711111111111
0.2/0.20: 0.130434782609, 0.428571428571, 0.600000000000
0.2/0.50: 0.102564102564, 0.363636363636, 0.533333333333
0.2/0.80: 0.093959731544, 0.341463414634, 0.509090909091
```

- [ ] **Step 5: Run the test and verify GREEN**

Run: `cd prototype/ioannidis-app-to-cli/cli/solution && uv run pytest tests/test_reference_data.py -v`

Expected: `2 passed`.

- [ ] **Step 6: Commit**

```bash
git add prototype/ioannidis-app-to-cli/cli/solution
git commit -m "test: add independent paper reference data"
```

### Task 3: Reproduce Table 4 from the published PPV equation

**Files:**
- Create: `prototype/ioannidis-app-to-cli/cli/solution/tests/test_model.py`
- Create: `prototype/ioannidis-app-to-cli/cli/solution/src/ioannidis_reproduction/__init__.py`
- Create: `prototype/ioannidis-app-to-cli/cli/solution/src/ioannidis_reproduction/model.py`

- [ ] **Step 1: Write the failing Table 4 test**

```python
import csv
from pathlib import Path

import pytest

from ioannidis_reproduction.model import ppv_with_bias


REFERENCE = Path(__file__).parents[1] / "reference" / "published_table4.csv"


def test_published_table4_values_match_after_published_rounding() -> None:
    with REFERENCE.open(newline="") as handle:
        rows = list(csv.DictReader(handle))
    for row in rows:
        computed = ppv_with_bias(
            power=float(row["power"]),
            odds=float(row["odds"]),
            bias=float(row["bias"]),
        )
        assert f'{computed:.{int(row["digits"])}f}' == row["published_ppv"]


@pytest.mark.parametrize(
    ("name", "kwargs"),
    [
        ("power", {"power": -0.1, "odds": 1.0, "bias": 0.1}),
        ("odds", {"power": 0.8, "odds": -1.0, "bias": 0.1}),
        ("bias", {"power": 0.8, "odds": 1.0, "bias": 1.1}),
        ("alpha", {"power": 0.8, "odds": 1.0, "bias": 0.1, "alpha": 1.1}),
    ],
)
def test_invalid_probabilities_and_odds_are_rejected(name: str, kwargs: dict[str, float]) -> None:
    with pytest.raises(ValueError, match=name):
        ppv_with_bias(**kwargs)
```

- [ ] **Step 2: Run the test and verify RED**

Run: `cd prototype/ioannidis-app-to-cli/cli/solution && uv run pytest tests/test_model.py -v`

Expected: collection ERROR with `ModuleNotFoundError: ioannidis_reproduction`.

- [ ] **Step 3: Implement the minimal model**

```python
def ppv_with_bias(power: float, odds: float, bias: float, alpha: float = 0.05) -> float:
    if not 0.0 <= power <= 1.0:
        raise ValueError("power must be between 0 and 1")
    if odds < 0.0:
        raise ValueError("odds must be non-negative")
    if not 0.0 <= bias <= 1.0:
        raise ValueError("bias must be between 0 and 1")
    if not 0.0 <= alpha <= 1.0:
        raise ValueError("alpha must be between 0 and 1")
    beta = 1.0 - power
    numerator = power * odds + bias * beta * odds
    denominator = odds + alpha - beta * odds + bias - bias * alpha + bias * beta * odds
    if denominator == 0.0:
        raise ValueError("PPV denominator is zero")
    return numerator / denominator
```

- [ ] **Step 4: Run the test and verify GREEN**

Run: `cd prototype/ioannidis-app-to-cli/cli/solution && uv run pytest tests/test_model.py -v`

Expected: `5 passed`.

- [ ] **Step 5: Commit**

```bash
git add prototype/ioannidis-app-to-cli/cli/solution
git commit -m "feat: reproduce published Table 4 values"
```

### Task 4: Turn the 2022 correction into an executable audit

**Files:**
- Modify: `prototype/ioannidis-app-to-cli/cli/solution/tests/test_model.py`
- Modify: `prototype/ioannidis-app-to-cli/cli/solution/src/ioannidis_reproduction/model.py`

- [ ] **Step 1: Add failing tests for the corrected and printed Table 2 expressions**

```python
from math import isclose

from ioannidis_reproduction.model import (
    corrected_false_positive_cell,
    negative_finding_no_relationship_cell,
    no_relationship_column_total,
    printed_false_positive_cell,
)


def test_corrected_table2_cells_sum_to_the_no_relationship_column_total() -> None:
    corrected_sum = corrected_false_positive_cell(1000, 0.1, 0.3) + (
        negative_finding_no_relationship_cell(1000, 0.1, 0.3)
    )
    assert isclose(corrected_sum, no_relationship_column_total(1000, 0.1))


def test_printed_table2_expression_breaks_the_column_total_identity() -> None:
    printed_sum = printed_false_positive_cell(1000, 0.1, 0.3) + (
        negative_finding_no_relationship_cell(1000, 0.1, 0.3)
    )
    assert not isclose(printed_sum, no_relationship_column_total(1000, 0.1))
```

- [ ] **Step 2: Run the two tests and verify RED**

Run: `cd prototype/ioannidis-app-to-cli/cli/solution && uv run pytest tests/test_model.py -v`

Expected: collection ERROR because the four functions are missing.

- [ ] **Step 3: Implement the four literal Table 2 expressions**

```python
def corrected_false_positive_cell(c: float, odds: float, bias: float, alpha: float = 0.05) -> float:
    return (c * alpha + bias * c * (1.0 - alpha)) / (odds + 1.0)


def printed_false_positive_cell(c: float, odds: float, bias: float, alpha: float = 0.05) -> float:
    return c * alpha + bias * c * (1.0 - alpha) / (odds + 1.0)


def negative_finding_no_relationship_cell(
    c: float, odds: float, bias: float, alpha: float = 0.05
) -> float:
    return (1.0 - bias) * c * (1.0 - alpha) / (odds + 1.0)


def no_relationship_column_total(c: float, odds: float) -> float:
    return c / (odds + 1.0)
```

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `cd prototype/ioannidis-app-to-cli/cli/solution && uv run pytest tests/test_model.py -v`

Expected: `7 passed`.

- [ ] **Step 5: Commit**

```bash
git add prototype/ioannidis-app-to-cli/cli/solution
git commit -m "feat: encode the corrected Table 2 identity"
```

### Task 5: Reproduce the scientific content of Figure 1

**Files:**
- Create: `prototype/ioannidis-app-to-cli/cli/solution/tests/test_figure1.py`
- Create: `prototype/ioannidis-app-to-cli/cli/solution/src/ioannidis_reproduction/figure1.py`

- [ ] **Step 1: Write failing data and rendering tests**

```python
import json
from pathlib import Path

import pytest

from ioannidis_reproduction.figure1 import figure1_values, save_figure1


REFERENCE = Path(__file__).parents[1] / "reference" / "figure1_checkpoints.json"


def test_all_figure1_checkpoints_match_the_independent_oracle() -> None:
    rows = json.loads(REFERENCE.read_text())
    for row in rows:
        computed = figure1_values(row["power"], row["bias"], row["odds"])
        assert computed == pytest.approx(row["ppv"], abs=1e-12)


def test_figure1_is_rendered_as_a_nonempty_png(tmp_path: Path) -> None:
    output = tmp_path / "figure1.png"
    save_figure1(output)
    assert output.read_bytes().startswith(b"\x89PNG\r\n\x1a\n")
    assert output.stat().st_size > 20_000
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `cd prototype/ioannidis-app-to-cli/cli/solution && uv run pytest tests/test_figure1.py -v`

Expected: collection ERROR because `ioannidis_reproduction.figure1` is missing.

- [ ] **Step 3: Implement curve evaluation and the three-panel plot**

```python
from collections.abc import Iterable
from pathlib import Path

import matplotlib
import numpy as np

matplotlib.use("Agg")
import matplotlib.pyplot as plt

from .model import ppv_with_bias


POWERS = (0.8, 0.5, 0.2)
BIASES = (0.05, 0.2, 0.5, 0.8)


def figure1_values(power: float, bias: float, odds: Iterable[float]) -> np.ndarray:
    return np.array([ppv_with_bias(power, value, bias) for value in odds])


def save_figure1(output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    odds = np.linspace(0.0, 1.0, 201)
    colors = ("#2563eb", "#dc2626", "#4d7c0f", "#ea580c")
    figure, axes = plt.subplots(3, 1, figsize=(6.2, 10.0), sharex=True, sharey=True)
    for panel, (axis, power) in enumerate(zip(axes, POWERS, strict=True)):
        for bias, color in zip(BIASES, colors, strict=True):
            axis.plot(
                odds,
                100.0 * figure1_values(power, bias, odds),
                color=color,
                label=f"u={bias:.2f}",
            )
        axis.set_ylim(0.0, 100.0)
        axis.set_ylabel("Post-study probability, PPV (%)")
        axis.set_title(f"{chr(65 + panel)}   power = {power:.0%}", loc="left")
        axis.grid(alpha=0.2)
    axes[-1].set_xlabel("Pre-study odds, R")
    axes[0].legend(ncol=2, frameon=False)
    figure.suptitle("Reproduction of Ioannidis (2005), Figure 1")
    figure.tight_layout()
    figure.savefig(output, dpi=180)
    plt.close(figure)
```

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `cd prototype/ioannidis-app-to-cli/cli/solution && uv run pytest tests/test_figure1.py -v`

Expected: `2 passed`.

- [ ] **Step 5: Commit**

```bash
git add prototype/ioannidis-app-to-cli/cli/solution
git commit -m "feat: reproduce Figure 1 scientific content"
```

### Task 6: Add the unambiguous verification CLI

**Files:**
- Create: `prototype/ioannidis-app-to-cli/cli/solution/tests/test_cli.py`
- Create: `prototype/ioannidis-app-to-cli/cli/solution/src/ioannidis_reproduction/verification.py`
- Create: `prototype/ioannidis-app-to-cli/cli/solution/src/ioannidis_reproduction/cli.py`

- [ ] **Step 1: Write the failing CLI test**

```python
from pathlib import Path

from ioannidis_reproduction.cli import main


def test_cli_prints_a_status_for_every_check(tmp_path: Path, capsys) -> None:
    result = main(["--output", str(tmp_path / "figure1.png")])
    output = capsys.readouterr().out
    assert result == 0
    assert output.count("Table 4 row") == 9
    assert "Table 2 printed expression: UNMATCHED" in output
    assert "Table 2 corrected expression: MATCH" in output
    assert output.count("Figure 1 curve") == 12
    assert output.rstrip().endswith("OVERALL: MATCH")
```

- [ ] **Step 2: Run the test and verify RED**

Run: `cd prototype/ioannidis-app-to-cli/cli/solution && uv run pytest tests/test_cli.py -v`

Expected: collection ERROR because `ioannidis_reproduction.cli` is missing.

- [ ] **Step 3: Implement verification and CLI orchestration**

Use this verification module:

```python
import csv
import json
from dataclasses import dataclass
from math import isclose
from pathlib import Path

from .figure1 import figure1_values
from .model import (
    corrected_false_positive_cell,
    negative_finding_no_relationship_cell,
    no_relationship_column_total,
    ppv_with_bias,
    printed_false_positive_cell,
)


REFERENCE = Path(__file__).parents[2] / "reference"


@dataclass(frozen=True)
class Check:
    label: str
    status: str
    detail: str
    ok: bool


def run_checks() -> list[Check]:
    checks: list[Check] = []
    with (REFERENCE / "published_table4.csv").open(newline="") as handle:
        table_rows = list(csv.DictReader(handle))
    for index, row in enumerate(table_rows, start=1):
        computed = ppv_with_bias(
            float(row["power"]), float(row["odds"]), float(row["bias"])
        )
        rendered = f'{computed:.{int(row["digits"])}f}'
        matched = rendered == row["published_ppv"]
        checks.append(
            Check(
                f"Table 4 row {index}",
                "MATCH" if matched else "UNMATCHED",
                f"computed={rendered}, published={row['published_ppv']}",
                matched,
            )
        )

    c, odds, bias = 1000.0, 0.1, 0.3
    expected_total = no_relationship_column_total(c, odds)
    negative_cell = negative_finding_no_relationship_cell(c, odds, bias)
    printed_total = printed_false_positive_cell(c, odds, bias) + negative_cell
    printed_unmatched = not isclose(printed_total, expected_total)
    checks.append(
        Check(
            "Table 2 printed expression",
            "UNMATCHED" if printed_unmatched else "MATCH",
            f"column sum={printed_total:.12f}, required={expected_total:.12f}",
            printed_unmatched,
        )
    )
    corrected_total = corrected_false_positive_cell(c, odds, bias) + negative_cell
    corrected_matched = isclose(corrected_total, expected_total)
    checks.append(
        Check(
            "Table 2 corrected expression",
            "MATCH" if corrected_matched else "UNMATCHED",
            f"column sum={corrected_total:.12f}, required={expected_total:.12f}",
            corrected_matched,
        )
    )

    figure_rows = json.loads((REFERENCE / "figure1_checkpoints.json").read_text())
    for row in figure_rows:
        computed = figure1_values(row["power"], row["bias"], row["odds"])
        matched = bool(np.allclose(computed, row["ppv"], rtol=0.0, atol=1e-12))
        checks.append(
            Check(
                f"Figure 1 curve power={row['power']:.1f} bias={row['bias']:.2f}",
                "MATCH" if matched else "UNMATCHED",
                "three numerical checkpoints",
                matched,
            )
        )
    return checks
```

Add `import numpy as np` to that module. Use this CLI module:

```python
import argparse
from pathlib import Path
from collections.abc import Sequence

from .figure1 import save_figure1
from .verification import run_checks


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output", type=Path, default=Path("artifacts/figure1-reproduced.png")
    )
    args = parser.parse_args(argv)
    save_figure1(args.output)
    checks = run_checks()
    for check in checks:
        print(f"{check.label}: {check.status} ({check.detail})")
    overall = all(check.ok for check in checks)
    print(f"OVERALL: {'MATCH' if overall else 'UNMATCHED'}")
    return 0 if overall else 1


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Run the CLI test and full suite**

Run: `cd prototype/ioannidis-app-to-cli/cli/solution && uv run pytest -q`

Expected: all tests pass with no warnings.

- [ ] **Step 5: Run the public command**

Run: `cd prototype/ioannidis-app-to-cli/cli/solution && uv run ioannidis-reproduce --output artifacts/figure1-reproduced.png`

Expected: nine Table 4 `MATCH` lines, one intentional printed-expression `UNMATCHED`, one corrected-expression `MATCH`, 12 Figure 1 `MATCH` lines, and final `OVERALL: MATCH`.

- [ ] **Step 6: Commit**

```bash
git add prototype/ioannidis-app-to-cli/cli/solution
git commit -m "feat: report reproducibility checks explicitly"
```

### Task 7: Add the three-step App workflow and cold-run artifacts

**Files:**
- Create: `prototype/ioannidis-app-to-cli/app/prompts/01-paper-companion.md`
- Create: `prototype/ioannidis-app-to-cli/app/prompts/02-independent-audit.md`
- Create: `prototype/ioannidis-app-to-cli/app/prompts/03-replication-brief.md`
- Create: `prototype/ioannidis-app-to-cli/app/example-outputs/paper-companion.md`
- Create: `prototype/ioannidis-app-to-cli/app/example-outputs/audit-report.md`
- Create: `prototype/ioannidis-app-to-cli/app/example-outputs/replication-brief.md`
- Create: `prototype/ioannidis-app-to-cli/cli/solution/tests/test_learning_artifacts.py`

- [ ] **Step 1: Write a failing artifact-contract test**

```python
from pathlib import Path


APP = Path(__file__).parents[3] / "app"


def require(path: Path, terms: tuple[str, ...]) -> None:
    text = path.read_text().lower()
    for term in terms:
        assert term.lower() in text, f"{term!r} missing from {path}"


def test_three_prompts_and_three_portable_outputs_exist() -> None:
    for name in (
        "01-paper-companion.md",
        "02-independent-audit.md",
        "03-replication-brief.md",
    ):
        assert (APP / "prompts" / name).is_file()
    for name in ("paper-companion.md", "audit-report.md", "replication-brief.md"):
        assert (APP / "example-outputs" / name).is_file()


def test_companion_separates_source_inference_and_uncertainty() -> None:
    require(
        APP / "example-outputs" / "paper-companion.md",
        ("90-second explanation", "reading map", "[paper]", "[inference]", "[open question]"),
    )


def test_audit_reports_the_correction_and_verdicts() -> None:
    require(
        APP / "example-outputs" / "audit-report.md",
        ("10.1371/journal.pmed.1004085", "supported", "qualified", "unsupported"),
    )


def test_replication_brief_is_an_executable_contract() -> None:
    require(
        APP / "example-outputs" / "replication-brief.md",
        ("inputs", "equations", "acceptance tests", "figure 1", "table 4", "table 2"),
    )
```

- [ ] **Step 2: Run the test and verify RED**

Run: `cd prototype/ioannidis-app-to-cli/cli/solution && uv run pytest tests/test_learning_artifacts.py -v`

Expected: FAIL because the prompt and output files do not exist.

- [ ] **Step 3: Add the three exact prompts**

`01-paper-companion.md`:

```markdown
# Create my paper companion

Read `sources/ioannidis-2005.pdf`. Do not browse or use outside sources in this
first pass.

Personalization: I am a researcher outside biomedicine reading this paper to
understand how assumptions affect the reliability of published claims; I know
basic hypothesis testing but not Bayesian statistics.

Create a concise companion with: a 90-second explanation, a purpose-specific
reading map, a plain-language glossary, the mathematical model and assumptions,
the main claims and evidence, questions worth asking, and suggested next steps.
Prefix every substantive item with `[PAPER]`, `[INFERENCE]`, or `[OPEN QUESTION]`.
For `[PAPER]` items, cite the PDF page and the nearest section, table, figure, or
displayed equation. Do not silently repair ambiguities or claim that reproduction
would validate the paper's interpretation.
```

`02-independent-audit.md`:

```markdown
# Independently audit the companion

Work in a fresh task. Read `sources/ioannidis-2005.pdf` and
`app/example-outputs/paper-companion.md`. Use the paper DOI
`10.1371/journal.pmed.0020124` to check the current publication record for
corrections, retractions, or updated versions.

Audit every substantive companion claim against the paper and current record.
Classify each as `SUPPORTED`, `QUALIFIED`, or `UNSUPPORTED`; give exact evidence;
report any correction and whether it changes the model, the numerical targets,
or only the presentation. Separate successful calculation reproduction from
agreement with assumptions or conclusions. Do not rewrite the companion.
```

`03-replication-brief.md`:

```markdown
# Write the replication brief

Read the original paper and `app/example-outputs/audit-report.md`. Produce a
code-free contract for a fresh CLI agent to reproduce Figure 1, all nine Table 4
values, and the Table 2 correction check.

Include: source provenance; inputs and symbols; the equations exactly as audited;
independent reference values; plot structure; numerical tolerances; acceptance
tests; required `MATCH` or `UNMATCHED` output for every check; and a statement
that reproduction does not endorse the model assumptions or headline claim.
The implementation must not generate its own oracle.
```

- [ ] **Step 4: Execute three clean runs and save their outputs**

Use the personalization sentence: `I am a researcher outside biomedicine reading this paper to understand how assumptions affect the reliability of published claims; I know basic hypothesis testing but not Bayesian statistics.` Run Prompt 1 without web access. Run Prompt 2 in a fresh task with web access and verify it discovers DOI `10.1371/journal.pmed.1004085`. Run Prompt 3 in another fresh task using the audited artifacts. Save only the final Markdown responses.

- [ ] **Step 5: Run the artifact-contract test and full suite**

Run: `cd prototype/ioannidis-app-to-cli/cli/solution && uv run pytest -q`

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add prototype/ioannidis-app-to-cli
git commit -m "docs: add App-first paper audit workflow"
```

### Task 8: Package the starter state and record the cold dry run

**Files:**
- Create: `prototype/ioannidis-app-to-cli/cli/starter/`
- Create: `prototype/ioannidis-app-to-cli/README.md`
- Create: `prototype/ioannidis-app-to-cli/dry-run/RESULTS.md`

- [ ] **Step 1: Create the starter snapshot**

Copy `pyproject.toml`, `uv.lock`, `reference/`, and `tests/` from `solution/` into `starter/`. Add an empty `src/ioannidis_reproduction/__init__.py`; omit `model.py`, `figure1.py`, `verification.py`, and `cli.py`. Confirm `uv run pytest tests/test_model.py -v` fails with a missing-module error in the starter.

- [ ] **Step 2: Write the private prototype README**

Document the 60-minute path, the three App prompts, the fresh-task audit boundary, the source-safety rule, the instructor-led CLI command, the meaning of reproduction versus endorsement, and the fallback from `starter/` to `solution/`.

- [ ] **Step 3: Run the cold CLI path from a clean environment**

Run `uv sync --locked`, `uv run pytest -q`, and `uv run ioannidis-reproduce --output artifacts/figure1-reproduced.png` in `solution/`. Capture wall-clock timings, test count, command exit codes, and the final `OVERALL: MATCH` line.

- [ ] **Step 4: Visually inspect the regenerated figure**

Open `artifacts/figure1-reproduced.png` and compare its three panels, power order, four bias curves, axes, and legend with page 3 of the original PDF. Record any visual deviations that do not alter scientific content.

- [ ] **Step 5: Record the gate result**

In `dry-run/RESULTS.md`, mark each agreed gate as `PASS`, `FAIL`, or `NOT YET TESTED`: useful App artifact under five minutes, correction discovery, self-contained brief, cold CLI under 20 minutes, full core under 60 minutes, and participant explanation of reproduction versus endorsement. Do not mark the exact desktop-App or novice-participant gates as passed unless they were actually observed.

- [ ] **Step 6: Run final verification**

Run:

```bash
cd prototype/ioannidis-app-to-cli/cli/solution
uv run pytest -q
uv run ioannidis-reproduce --output artifacts/figure1-reproduced.png
git diff --check
git status --short
```

Expected: full test suite passes, CLI ends with `OVERALL: MATCH`, no whitespace errors, and only intended prototype/plan files are changed.

- [ ] **Step 7: Commit**

```bash
git add docs/superpowers/plans prototype/ioannidis-app-to-cli
git commit -m "feat: complete private Ioannidis App-to-CLI prototype"
```

## Self-review

- Spec coverage: source provenance, personalized companion, independent correction audit, code-free replication brief, independent oracle, starter/solution boundary, explicit statuses, Figure 1, Table 4, Table 2, dry-run gates, and reproduction-versus-endorsement framing are each assigned to a task.
- Placeholder scan: the plan contains no deferred implementation markers; the two human-observation gates are explicitly required to remain unpassed until observed.
- Type consistency: all tests call `ppv_with_bias(power, odds, bias, alpha=0.05)` and use the same four Table 2 helper names defined in Task 4.
