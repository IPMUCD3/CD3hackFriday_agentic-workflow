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
def test_invalid_probabilities_and_odds_are_rejected(
    name: str, kwargs: dict[str, float]
) -> None:
    with pytest.raises(ValueError, match=name):
        ppv_with_bias(**kwargs)
