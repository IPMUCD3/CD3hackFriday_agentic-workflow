import hashlib
import json
import re
from pathlib import Path


APP = Path(__file__).parents[3] / "app"
PROTOTYPE = APP.parent
REFERENCE = Path(__file__).parents[1] / "reference"


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
        ("10.1371/journal.pmed.1004085", "supported", "qualified"),
    )


def test_replication_brief_is_an_executable_contract() -> None:
    require(
        APP / "example-outputs" / "replication-brief.md",
        ("inputs", "equations", "acceptance tests", "figure 1", "table 4", "table 2"),
    )


def test_workflow_passes_live_artifacts_between_stages() -> None:
    audit_prompt = (APP / "prompts" / "02-independent-audit.md").read_text()
    brief_prompt = (APP / "prompts" / "03-replication-brief.md").read_text()
    readme = (PROTOTYPE / "README.md").read_text()

    assert "example-outputs" not in audit_prompt
    assert "paper-companion.md" in audit_prompt
    assert "example-outputs" not in brief_prompt
    assert "audit-report.md" in brief_prompt
    assert "reference/published_table4.csv" in brief_prompt
    assert "reference/figure1_checkpoints.json" in brief_prompt
    assert "reference/published_table4.csv" in readme
    assert "reference/figure1_checkpoints.json" in readme
    assert "Read replication-brief.md." in readme
    assert "Read ../../app/example-outputs/replication-brief.md." not in readme


def test_audit_covers_every_companion_claim_id() -> None:
    companion = (APP / "example-outputs" / "paper-companion.md").read_text()
    audit = (APP / "example-outputs" / "audit-report.md").read_text()
    companion_claims = re.findall(r"\[C\d{2}\]", companion)
    audit_rows = re.findall(
        r"^\| (\[C\d{2}\]) \| \*\*(SUPPORTED|QUALIFIED|UNSUPPORTED)\*\* \| (.+) \|$",
        audit,
        flags=re.MULTILINE,
    )
    audited_claims = [claim_id for claim_id, _, _ in audit_rows]

    assert len(companion_claims) >= 20
    assert len(companion_claims) == len(set(companion_claims))
    assert len(audited_claims) == len(set(audited_claims))
    assert set(audited_claims) == set(companion_claims)
    assert all(len(evidence.strip()) >= 20 for _, _, evidence in audit_rows)


def test_audit_status_has_official_record_and_access_date() -> None:
    audit = (APP / "example-outputs" / "audit-report.md").read_text()

    assert (
        "https://journals.plos.org/plosmedicine/article?"
        "id=10.1371/journal.pmed.0020124"
    ) in audit
    assert re.search(r"checked on \d{4}-\d{2}-\d{2}", audit)


def test_replication_brief_pins_the_figure_oracle() -> None:
    brief = (APP / "example-outputs" / "replication-brief.md").read_text()
    files = ("published_table4.csv", "figure1_checkpoints.json")

    for name in files:
        digest = hashlib.sha256((REFERENCE / name).read_bytes()).hexdigest()
        assert f"reference/{name}" in brief
        assert digest in brief

    checkpoints = json.loads((REFERENCE / "figure1_checkpoints.json").read_text())
    assert len(checkpoints) == 12
    assert sum(len(curve["ppv"]) for curve in checkpoints) == 36
    assert "36 checkpoints" in brief


def test_dry_run_records_locked_environment_setup() -> None:
    require(
        PROTOTYPE / "dry-run" / "RESULTS.md",
        ("uv sync --locked", "exit code 0", "measured wall time"),
    )
