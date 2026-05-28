"""
Factory LLM : retourne le ChatModel LangChain correspondant au provider demandé.

4 providers supportés pour comparer la qualité de veille — chacun via son
SDK natif pour avoir des erreurs claires et exploiter les helpers spécifiques :
  - "deepseek"  → langchain_deepseek.ChatDeepSeek    (deepseek-chat)
  - "openai"    → langchain_openai.ChatOpenAI        (gpt-4o-mini)
  - "anthropic" → langchain_anthropic.ChatAnthropic  (claude-sonnet-4-6)
  - "ollama"    → langchain_ollama.ChatOllama        (endpoint distant /api/chat,
                                                       modèle dynamique : qwen3:8b,
                                                       mistral:7b, gemma3:4b,
                                                       llama3.1:8b…)

Imports faits à la demande (lazy) pour éviter qu'un package manquant ne casse
le démarrage de l'app — on ne paie l'import que pour le provider effectivement
utilisé dans la requête.
"""

from __future__ import annotations

from contextvars import ContextVar
from typing import Any, Literal, Optional
from pydantic import SecretStr

from app.core.config import settings


SUPPORTED_PROVIDERS = ("deepseek", "openai", "anthropic", "ollama")

# Modèles Ollama exposés en dropdown sur les routes — alignés avec ce qui est
# pull côté serveur https://ollama.traaf.app.
OllamaModel = Literal["qwen3:8b", "mistral:7b", "gemma3:4b", "llama3.1:8b"]

# Override request-scoped du modèle Ollama : posé par la task Celery au début
# de l'exécution (depuis le param `ollama_model` de la route), lu par
# `_build_ollama()` au moment où la chain construit son LLM. Propagé
# automatiquement à travers tout le call stack asyncio (ContextVar safe avec
# asyncio.run et asyncio.create_task). Reste à None si non précisé → on
# retombe sur settings.OLLAMA_LLM_MODEL.
OLLAMA_MODEL_OVERRIDE: ContextVar[Optional[str]] = ContextVar(
    "OLLAMA_MODEL_OVERRIDE", default=None
)


def _build_deepseek() -> Any:
    from langchain_deepseek import ChatDeepSeek
    if not settings.DEEPSEEK_API_KEY:
        raise RuntimeError("DEEPSEEK_API_KEY n'est pas configuré.")
    return ChatDeepSeek(
        api_key=SecretStr(settings.DEEPSEEK_API_KEY),
        model=settings.DEEPSEEK_LLM_MODEL,
        temperature=0,
    )


def _build_openai() -> Any:
    from langchain_openai import ChatOpenAI
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY n'est pas configuré.")
    return ChatOpenAI(
        api_key=SecretStr(settings.OPENAI_API_KEY),
        model=settings.OPENAI_LLM_MODEL,
        temperature=0,
    )


def _build_anthropic() -> Any:
    from langchain_anthropic import ChatAnthropic
    if not settings.ANTHROPIC_API_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY n'est pas configuré.")
    return ChatAnthropic(
        api_key=SecretStr(settings.ANTHROPIC_API_KEY),
        model_name=settings.ANTHROPIC_LLM_MODEL,
        temperature=0,
        timeout=None,
        stop=None,
    )


def _build_ollama() -> Any:
    # ChatOllama tape `/api/chat` sur `base_url` en httpx async sous le capot,
    # gère timeout/erreurs réseau via httpx et expose la même interface
    # LangChain (`with_structured_output`, `.ainvoke`, pipe `|`) que les autres
    # providers — donc compat directe avec les chains existantes.
    #
    # Subtilité : les call sites hardcodent `method="function_calling"` (commun
    # aux 3 providers commerciaux), mais les modèles Ollama locaux 7-8B sont
    # peu fiables sur le tool-calling. Le serveur Ollama supporte nativement
    # la contrainte JSON-schema via le param `format` de /api/chat — beaucoup
    # plus robuste, indépendant de la capacité tool-calling du modèle.
    # On encapsule donc le switch dans une sous-classe locale plutôt que de
    # polluer les chains avec un dispatch par provider.
    from langchain_ollama import ChatOllama
    if not settings.OLLAMA_BASE_URL:
        raise RuntimeError("OLLAMA_BASE_URL n'est pas configuré.")

    class _OllamaJsonSchema(ChatOllama):
        def with_structured_output(self, schema, *, method=None, **kwargs):  # type: ignore[override]
            return super().with_structured_output(
                schema, method="json_schema", **kwargs
            )

    model = OLLAMA_MODEL_OVERRIDE.get() or settings.OLLAMA_LLM_MODEL
    return _OllamaJsonSchema(
        base_url=settings.OLLAMA_BASE_URL,
        model=model,
        temperature=0,
    )


_BUILDERS = {
    "deepseek": _build_deepseek,
    "openai": _build_openai,
    "anthropic": _build_anthropic,
    "ollama": _build_ollama,
}


def get_llm(provider: str = "deepseek") -> Any:
    """
    Retourne un ChatModel LangChain prêt à l'emploi pour le provider demandé.

    Lève ValueError si le provider est inconnu, RuntimeError si la clé
    correspondante manque. Pas de cache : construire un ChatModel est cheap
    (juste un wrapper de config), et on évite tout problème de réutilisation
    cross-requête.
    """
    key = (provider or "deepseek").lower().strip()
    builder = _BUILDERS.get(key)
    if builder is None:
        raise ValueError(
            f"llm_provider '{provider}' inconnu. Valeurs supportées : {SUPPORTED_PROVIDERS}"
        )
    return builder()
