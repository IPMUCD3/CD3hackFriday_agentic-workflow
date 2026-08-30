"""Command-line entry point for the reproduction report."""

import argparse
from collections.abc import Sequence
from pathlib import Path

from .figure1 import save_figure1
from .verification import run_checks


def main(argv: Sequence[str] | None = None) -> int:
    """Run all checks, render Figure 1, and return a process status."""
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
