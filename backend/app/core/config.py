import os
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

class Settings(BaseSettings):
    """Application settings."""
    
    # Database
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "kaapi-db"
    POSTGRES_DB: str = "kaapi"
    POSTGRES_ECHO: bool = False
    # Basic Configuration
    PROJECT_NAME: str = "KAAPI Backend"
    ENVIRONMENT: str = "development"
    
    # API Configuration
    API_PREFIX: str = "/api"  # Central prefix for all API routes
    API_V1_STR: str = "/api" 
    
    # Security
    SECRET_KEY: str = "CHANGE_ME"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10  # For tests, only 2 minutes
    REFRESH_TOKEN_EXPIRE_DAYS: int = 1  # For tests, only 1 day
    ALGORITHM: str = "HS256"
    
    # OAuth Providers
    OAUTH_PROVIDERS: dict = {
        "github": {
            "client_id": os.getenv("GITHUB_CLIENT_ID", "default_github_client_id"),
            "client_secret": os.getenv("GITHUB_CLIENT_SECRET", "default_github_client_secret"),
        },
        "google": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID", "xxxxxxx"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET", "xxxxxx"),
        },
        "facebook": {
            "client_id": os.getenv("FACEBOOK_CLIENT_ID", "default_facebook_client_id"),
            "client_secret": os.getenv("FACEBOOK_CLIENT_SECRET", "default_facebook_client_secret"),
        },
    }
    
    # CORS — origines explicites (allow_credentials=True interdit le wildcard "*").
    # Surchargeable via la variable d'env CORS_ORIGINS (format JSON), ex. dans Dokploy :
    #   CORS_ORIGINS=["https://tekawake.kortex.sbs"]
    CORS_ORIGINS: list[str] = [
        # Dev local
        "http://localhost:3000", "http://localhost:8000", "http://localhost:9000", "http://localhost:8501",
        # Prod (client Next.js déployé via Dokploy)
        "https://tekawake.kortex.sbs",
    ]
    CORS_METHODS: list[str] = ["*"]
    CORS_HEADERS: list[str] = ["*"]
    
    # Celery
    CELERY_BROKER_REDIS_DATABASE: int = 0
    CELERY_BACKEND_REDIS_DATABASE: int = 1
    
    # Messaging
    GMAIL_USERNAME: Optional[str] = None
    GMAIL_PASSWORD: Optional[str] = None
    SENDGRID_API_KEY: Optional[str] = None
    INFOBIP_API_KEY: Optional[str] = None
    INFOBIP_BASE_URL: Optional[str] = None
    INFOBIP_FROM_NUMBER: Optional[str] = None
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_FROM_NUMBER: Optional[str] = None
    ONESIGNAL_APP_ID: Optional[str] = None
    ONESIGNAL_REST_API_KEY: Optional[str] = None
    
    # RabbitMQ
    RABBITMQ_USERNAME: str = "guest"
    RABBITMQ_PASSWORD: str = "guest"
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672
    

    # Env Redis
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str | None = None
    REDIS_DATABASE: int = 0


    # Configuration optionnelle pour LangSmith
    LANGSMITH_TRACING_V2: Optional[str] = "true"
    LANGSMITH_ENDPOINT: Optional[str] = "https://api.smith.langchain.com"
    LANGSMITH_API_KEY: str = ""
    LANGSMITH_PROJECT: str = ""

    # LLM providers — 3 backends interchangeables via le param `llm_provider`
    # (cf. app/services/llm_factory.py). Le default historique est deepseek.
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_LLM_MODEL: str = "deepseek-chat"
    OPENAI_API_KEY: str = ""
    OPENAI_LLM_MODEL: str = "gpt-4o-mini"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_LLM_MODEL: str = "claude-sonnet-4-6"
    # Ollama — endpoint distant self-hosted, pas de clé API. Modèle par défaut
    # surchargeable via OLLAMA_LLM_MODEL dans le .env ou le param `ollama_model`
    # de la route (voir routers/veille.py).
    # gemma3:4b retenu par défaut : meilleur compromis vitesse/qualité au bench
    # interne (675s pour 38/40 articles processed vs 909s/36 pour llama3.1:8b).
    # Possible car le wrapper _OllamaJsonSchema force la contrainte JSON-schema
    # côté serveur Ollama → fiabilité indépendante du support tool-calling du
    # modèle (gemma3 ne supporte pas les tools, mais marche via json_schema).
    OLLAMA_BASE_URL: str = "https://ollama.traaf.app"
    OLLAMA_LLM_MODEL: str = "gemma3:4b"

    # Unsplash — banque d'images pour illustrer automatiquement les slides des
    # clusters (cf. services/slide_images.py). Clé gratuite (Access Key) :
    # https://unsplash.com/developers. Vide → l'illustration des slides est
    # simplement désactivée (pas d'erreur).
    UNSPLASH_ACCESS_KEY: str = ""

    # Upload d'images depuis le poste de l'éditeur (cf. routers/cluster.py).
    # Les fichiers sont stockés sur disque et servis en statique sous
    # {API_PREFIX}/uploads/ (cf. main.py). Chemin relatif à la racine du backend.
    UPLOAD_DIR: str = "uploads"
    # Taille max d'un upload (octets). 10 Mo par défaut.
    UPLOAD_MAX_BYTES: int = 10 * 1024 * 1024

    # --- MinIO (stockage objet) ------------------------------------------
    # Backend de stockage des fichiers/images de la veille. Les octets vont
    # dans MinIO (bucket), seules les métadonnées restent en Postgres
    # (cf. app/services/storage.py qui réutilise le plugin file_storage).
    # Valeurs alignées sur docker-compose.yml (service `minio`).
    MINIO_ENDPOINT: str = "minio:9000"          # hôte interne (réseau Docker)
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_SECURE: bool = False                   # True => HTTPS
    MINIO_BUCKET: str = "files"                   # bucket cible (auto-créé au 1er usage)
    # URL publique directe vers MinIO (prod, ex. https://files.example.com).
    # Vide => on ne sert jamais d'URL présignée, les images transitent par la
    # route preview de l'API (proxy-safe). À renseigner si accès direct voulu.
    MINIO_PUBLIC_ENDPOINT: str = ""

    # Embeddings — sentence-transformers/multilingual-e5-base, 768 dim, local CPU.
    # Multilingue (incl. FR), tourne sans clé API ni quota. ~500 MB en RAM,
    # ~30-50 docs/s sur CPU. Le 1er chargement télécharge le modèle dans HF_HOME
    # (cf. docker-compose : volume monté pour éviter le re-download).
    EMBED_MODEL: str = "intfloat/multilingual-e5-base"
    EMBED_DIM: int = 768

    # Qdrant (vector DB) — instance partagée, voir https://qdrant-client.kortexai.dev/dashboard
    QDRANT_URL: str = "https://qdrant-client.kortexai.dev"
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION: str = "tekawake_articles"

    # Clustering v2 — regroupement agglomératif des articles d'une veille sur
    # leurs vecteurs e5-base (cf. app/services/clustering.py).
    #  - CLUSTER_SIM_THRESHOLD : similarité cosine min pour regrouper 2 articles.
    #    À caler empiriquement ; les embeddings e5 ont une similarité de base
    #    élevée, monter la valeur si tout fusionne, la baisser si tout est isolé.
    #  - CLUSTER_MAX_SIZE : cap d'articles par cluster (on garde le top-N par
    #    score_pertinence, le reste repasse non-clusterisé).
    #  - MIN_CLUSTER_SIZE : un groupe sous ce seuil n'est pas promu en cluster
    #    (un article isolé reste cluster_id = NULL).
    CLUSTER_SIM_THRESHOLD: float = 0.86
    CLUSTER_MAX_SIZE: int = 10
    MIN_CLUSTER_SIZE: int = 2

    # --- Sourcing des articles (découverte) -------------------------------
    # "rss"       : flux RSS fixes + trafilatura (historique, cf. tekawake.py)
    # "firecrawl" : recherche pilotée par le prompt via Firecrawl self-host
    #               (/v1/search + scrape markdown), géo-ciblée, rendu JS.
    # Flag de bascule (rollback instantané) ; le worker Celery doit redémarrer
    # après changement (pas de hot-reload).
    SOURCING_PROVIDER: str = "rss"
    # Firecrawl self-host — API INTERNE (réseau Dokploy), aucune auth requise.
    FIRECRAWL_BASE_URL: str = "http://firecrawl-api:3002"
    FIRECRAWL_SEARCH_LIMIT: int = 15          # nb de résultats par veille
    FIRECRAWL_LANG: str = "fr"
    FIRECRAWL_COUNTRY: str = "bj"             # géo par défaut (ISO 3166-1 alpha-2)
    FIRECRAWL_WAIT_FOR_MS: int = 2500         # laisse le JS s'hydrater (sites squelette)
    FIRECRAWL_PROXY: str = "auto"            # basic|stealth|enhanced|auto (escalade anti-bot)
    FIRECRAWL_TIMEOUT_MS: int = 45000

    # Logging
    LOKI_URL: str = "http://loki:3100"

    # --- Pool de connexions SQLAlchemy (tunable sans rebuild) ---
    DB_ECHO: bool = False              # JAMAIS True en prod (log chaque requête SQL)
    DB_POOL_SIZE: int = 20            # connexions persistantes
    DB_MAX_OVERFLOW: int = 30         # connexions supplémentaires en pic
    DB_POOL_TIMEOUT: int = 30         # attente max avant TimeoutError (s)
    DB_POOL_RECYCLE: int = 1800       # recycle les connexions > 30 min
    DB_POOL_PRE_PING: bool = True     # détecte/écarte les connexions mortes

    @property
    def CELERY_BROKER_URL(self) -> str:
        password = f":{self.REDIS_PASSWORD}" if self.REDIS_PASSWORD else ""
        return f"redis://{password}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.CELERY_BROKER_REDIS_DATABASE}"

    @property
    def CELERY_RESULT_BACKEND(self) -> str:
        password = f":{self.REDIS_PASSWORD}" if self.REDIS_PASSWORD else ""
        return f"redis://{password}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.CELERY_BACKEND_REDIS_DATABASE}"
    
    @property
    def DB_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:5432/{self.POSTGRES_DB}"
    
    @property
    def ASYNC_DB_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:5432/{self.POSTGRES_DB}"
    
    # Configuration for environment variable analysis
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
