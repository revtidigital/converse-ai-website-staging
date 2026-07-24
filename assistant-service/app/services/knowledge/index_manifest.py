import json
from pathlib import Path

from app.services.knowledge.models import IndexedSourceManifest


class JsonIndexManifestStore:
    def __init__(self, path: Path) -> None:
        self.path = path
        self._items: dict[str, IndexedSourceManifest] = {}
        self.load()

    def load(self) -> None:
        if not self.path.exists():
            return
        data = json.loads(self.path.read_text())
        self._items = {key: IndexedSourceManifest.model_validate(value) for key, value in data.items()}

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps({key: value.model_dump(mode="json") for key, value in self._items.items()}, indent=2, sort_keys=True))

    def get(self, source_id: str) -> IndexedSourceManifest | None:
        return self._items.get(source_id)

    def upsert(self, item: IndexedSourceManifest) -> None:
        self._items[item.source_id] = item

    def remove_missing(self, active_source_ids: set[str]) -> list[IndexedSourceManifest]:
        removed: list[IndexedSourceManifest] = []
        for source_id in list(self._items):
            if source_id not in active_source_ids:
                removed.append(self._items.pop(source_id))
        return removed
