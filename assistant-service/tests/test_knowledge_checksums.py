from app.services.knowledge.checksums import normalized_checksum


def test_checksum_normalizes_whitespace() -> None:
    assert normalized_checksum("a  b") == normalized_checksum("a b")
