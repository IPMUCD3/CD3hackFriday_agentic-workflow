"""Independent checks against values transcribed from the paper."""

import csv
import json
from dataclasses import dataclass
from math import isclose
from pathlib import Path

import numpy as np

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
    """One expected reproduction or audit outcome."""

    label: str
    status: str
    detail: str
    ok: bool


def _table4_checks() -> list[Check]:
    checks: list[Check] = []
    with (REFERENCE / "published_table4.csv").open(newline="") as handle:
        rows = list(csv.DictReader(handle))
    for index, row in enumerate(rows, start=1):
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
    return checks


def _table2_checks() -> list[Check]:
    c, odds, bias = 1000.0, 0.1, 0.3
    expected_total = no_relationship_column_total(c, odds)
    negative_cell = negative_finding_no_relationship_cell(c, odds, bias)

    printed_total = printed_false_positive_cell(c, odds, bias) + negative_cell
    printed_unmatched = not isclose(printed_total, expected_total)
    corrected_total = corrected_false_positive_cell(c, odds, bias) + negative_cell
    corrected_matched = isclose(corrected_total, expected_total)

    return [
        Check(
            "Table 2 printed expression",
            "UNMATCHED" if printed_unmatched else "MATCH",
            f"column sum={printed_total:.12f}, required={expected_total:.12f}",
            printed_unmatched,
        ),
        Check(
            "Table 2 corrected expression",
            "MATCH" if corrected_matched else "UNMATCHED",
            f"column sum={corrected_total:.12f}, required={expected_total:.12f}",
            corrected_matched,
        ),
    ]


def _figure1_checks() -> list[Check]:
    checks: list[Check] = []
    rows = json.loads((REFERENCE / "figure1_checkpoints.json").read_text())
    for row in rows:
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


def run_checks() -> list[Check]:
    """Return every numerical and correction check in presentation order."""
    return [*_table4_checks(), *_table2_checks(), *_figure1_checks()]
