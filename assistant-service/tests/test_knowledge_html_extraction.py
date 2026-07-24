from app.services.knowledge.content_extractor import extract_public_html


def test_extracts_public_content_and_removes_scripts() -> None:
    title, sections = extract_public_html("<html><head><title>T</title><script>secret</script></head><body><h1>Head</h1><p>Price is $10.</p><style>.x{}</style><ul><li>One</li></ul></body></html>")
    assert title == "T"
    text = " ".join(s.content for s in sections)
    assert "Price is $10" in text and "secret" not in text and "One" in text
