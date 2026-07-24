from app.services.knowledge.content_cleaner import clean_text


def test_cleaner_preserves_numbers_and_dedupes() -> None:
    assert clean_text("Price 10 USD\n\nPrice 10 USD\n\nDate 2026-07-24") == "Price 10 USD\n\nDate 2026-07-24"
