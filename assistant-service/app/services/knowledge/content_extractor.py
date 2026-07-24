from html.parser import HTMLParser

from app.services.knowledge.content_cleaner import clean_text
from app.services.knowledge.models import SourceSection

_BLOCK_TAGS = {"p", "li", "dt", "dd"}
_HEADING_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6"}
_SKIP_TAGS = {"script", "style", "svg", "noscript", "template"}


class PublicContentExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = "Untitled"
        self._in_title = False
        self._skip_depth = 0
        self._current_tag: str | None = None
        self._buffer: list[str] = []
        self._heading_path: list[str] = []
        self.sections: list[SourceSection] = []
        self._current_heading = "Main content"
        self._current_level = 1

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_map = dict(attrs)
        if tag in _SKIP_TAGS or attrs_map.get("aria-hidden") == "true" or "hidden" in attrs_map:
            self._skip_depth += 1
            return
        if tag == "title":
            self._in_title = True
        if tag in _HEADING_TAGS or tag in _BLOCK_TAGS:
            self._current_tag = tag
            self._buffer = []

    def handle_endtag(self, tag: str) -> None:
        if self._skip_depth:
            if tag in _SKIP_TAGS:
                self._skip_depth -= 1
            return
        if tag == "title":
            self._in_title = False
        if tag == self._current_tag:
            raw_text = " ".join(self._buffer).strip()
            if not raw_text:
                self._current_tag = None
                self._buffer = []
                return
            text = clean_text(raw_text, max_characters=12000)
            if tag in _HEADING_TAGS:
                level = int(tag[1])
                self._heading_path = self._heading_path[: level - 1]
                self._heading_path.append(text[:300])
                self._current_heading = text[:300]
                self._current_level = level
            elif text:
                self.sections.append(SourceSection(heading=self._current_heading, heading_level=self._current_level, heading_path=self._heading_path.copy(), content=text))
            self._current_tag = None
            self._buffer = []

    def handle_data(self, data: str) -> None:
        if self._skip_depth:
            return
        if self._in_title and data.strip():
            self.title = data.strip()[:300]
        if self._current_tag:
            self._buffer.append(data)


def extract_public_html(html: str) -> tuple[str, list[SourceSection]]:
    parser = PublicContentExtractor()
    parser.feed(html)
    if not parser.sections:
        raise ValueError("no public content extracted")
    return parser.title, parser.sections
