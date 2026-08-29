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
        (
            "90-second explanation",
            "reading map",
            "[paper]",
            "[inference]",
            "[open question]",
        ),
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
