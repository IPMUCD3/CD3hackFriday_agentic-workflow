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
