from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class KnowledgeSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", str_strip_whitespace=True)

    knowledge_site_base_url: str = Field(default="http://localhost:5173", alias="KNOWLEDGE_SITE_BASE_URL")
    knowledge_allowed_domains: list[str] = Field(default_factory=lambda: ["localhost"], alias="KNOWLEDGE_ALLOWED_DOMAINS")
    knowledge_max_sources: int = Field(default=2000, alias="KNOWLEDGE_MAX_SOURCES")
    knowledge_fetch_concurrency: int = Field(default=5, alias="KNOWLEDGE_FETCH_CONCURRENCY")
    knowledge_fetch_timeout_seconds: float = Field(default=20, alias="KNOWLEDGE_FETCH_TIMEOUT_SECONDS")
    knowledge_index_version: str = Field(default="1", alias="KNOWLEDGE_INDEX_VERSION")
    knowledge_index_admin_token: SecretStr | None = Field(default=None, alias="KNOWLEDGE_INDEX_ADMIN_TOKEN")
    knowledge_chunk_max_characters: int = Field(default=1800, alias="KNOWLEDGE_CHUNK_MAX_CHARACTERS")
    knowledge_chunk_overlap_characters: int = Field(default=200, alias="KNOWLEDGE_CHUNK_OVERLAP_CHARACTERS")
    knowledge_max_chunks_per_source: int = Field(default=100, alias="KNOWLEDGE_MAX_CHUNKS_PER_SOURCE")
    knowledge_max_source_characters: int = Field(default=100000, alias="KNOWLEDGE_MAX_SOURCE_CHARACTERS")
    supabase_url: str | None = Field(default=None, alias="SUPABASE_URL")
    supabase_anon_key: SecretStr | None = Field(default=None, alias="SUPABASE_ANON_KEY")
    supabase_service_role_key: SecretStr | None = Field(default=None, alias="SUPABASE_SERVICE_ROLE_KEY")
    embedding_model: str = Field(default="intfloat/multilingual-e5-small", alias="EMBEDDING_MODEL")
    embedding_device: str = Field(default="cpu", alias="EMBEDDING_DEVICE")
    embedding_batch_size: int = Field(default=16, alias="EMBEDDING_BATCH_SIZE")
    embedding_vector_dimension: int = Field(default=384, alias="EMBEDDING_VECTOR_DIMENSION")
    embedding_request_timeout_seconds: float = Field(default=30, alias="EMBEDDING_REQUEST_TIMEOUT_SECONDS")
    qdrant_url: str = Field(default="http://127.0.0.1:6333", alias="QDRANT_URL")
    qdrant_api_key: SecretStr | None = Field(default=None, alias="QDRANT_API_KEY")
    qdrant_collection: str = Field(default="converse_website", alias="QDRANT_COLLECTION")
    qdrant_request_timeout_seconds: float = Field(default=15, alias="QDRANT_REQUEST_TIMEOUT_SECONDS")
    qdrant_vector_dimension: int = Field(default=384, alias="QDRANT_VECTOR_DIMENSION")
    qdrant_distance: str = Field(default="cosine", alias="QDRANT_DISTANCE")
    retrieval_fetch_k: int = Field(default=20, alias="RETRIEVAL_FETCH_K")
    retrieval_top_k: int = Field(default=6, alias="RETRIEVAL_TOP_K")
    retrieval_score_threshold: float = Field(default=0.35, alias="RETRIEVAL_SCORE_THRESHOLD")
    retrieval_max_chunks: int = Field(default=8, alias="RETRIEVAL_MAX_CHUNKS")
    retrieval_max_context_characters: int = Field(default=16000, alias="RETRIEVAL_MAX_CONTEXT_CHARACTERS")
    retrieval_current_route_boost: float = Field(default=0.05, alias="RETRIEVAL_CURRENT_ROUTE_BOOST")

    @field_validator("knowledge_allowed_domains", mode="before")
    @classmethod
    def parse_domains(cls, value: object) -> list[str]:
        if isinstance(value, str):
            return [domain.strip().lower() for domain in value.split(",") if domain.strip()]
        return value  # type: ignore[return-value]

    @field_validator("knowledge_index_admin_token", "supabase_anon_key", "supabase_service_role_key", "qdrant_api_key", mode="before")
    @classmethod
    def empty_secret_to_none(cls, value: object) -> object:
        return None if isinstance(value, str) and not value.strip() else value

    @field_validator("knowledge_max_sources", "knowledge_fetch_concurrency", "knowledge_chunk_max_characters", "knowledge_max_chunks_per_source", "knowledge_max_source_characters", "embedding_batch_size", "embedding_vector_dimension", "qdrant_vector_dimension", "retrieval_fetch_k", "retrieval_top_k", "retrieval_max_chunks", "retrieval_max_context_characters")
    @classmethod
    def positive_ints(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("value must be positive")
        return value

    @field_validator("qdrant_distance")
    @classmethod
    def valid_distance(cls, value: str) -> str:
        value = value.lower()
        if value not in {"cosine", "dot", "euclid"}:
            raise ValueError("unsupported Qdrant distance")
        return value
