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
