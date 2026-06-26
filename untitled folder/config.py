from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    pinecone_api_key: str
    groq_api_key: str

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()