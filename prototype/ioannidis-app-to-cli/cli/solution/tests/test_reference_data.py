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
