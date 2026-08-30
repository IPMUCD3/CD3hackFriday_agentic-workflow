import os
from pathlib import Path
import subprocess
import sys

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


def test_module_cli_has_clean_stderr(tmp_path: Path) -> None:
    environment = os.environ.copy()
    environment.pop("MPLCONFIGDIR", None)
    completed = subprocess.run(
        [
            sys.executable,
            "-m",
            "ioannidis_reproduction.cli",
            "--output",
            str(tmp_path / "figure1.png"),
        ],
        check=False,
        capture_output=True,
        text=True,
        env=environment,
    )
    assert completed.returncode == 0
    assert completed.stderr == ""
