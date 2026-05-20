from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    REDIS_URL: str = ""
    API_KEY: str = ""
    SERP_API_KEY: str = ""
    NEWS_API_KEY: str = ""
    GOOGLE_FACTCHECK_API_KEY: str = ""
    SEMANTIC_SCHOLAR_BASE_URL: str = "https://api.semanticscholar.org/graph/v1"
    SENTENCE_TRANSFORMER_MODEL: str = "all-MiniLM-L6-v2"
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
