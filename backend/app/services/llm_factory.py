"""
Factory LLM : retourne le ChatModel LangChain correspondant au provider demandé.

3 providers supportés pour comparer la qualité de veille — chacun via son
SDK natif pour avoir des erreurs claires et exploiter les helpers spécifiques :
  - "deepseek"  → langchain_deepseek.ChatDeepSeek    (deepseek-chat)
  - "openai"    → langchain_openai.ChatOpenAI        (gpt-4o-mini)
  - "anthropic" → langchain_anthropic.ChatAnthropic  (claude-sonnet-4-6)

Imports faits à la demande (lazy) pour éviter qu'un package manquant ne casse
le démarrage de l'app — on ne paie l'import que pour le provider effectivement
utilisé dans la requête.
"""

from __future__ import annotations

from typing import Any
from pydantic import SecretStr

from app.core.config import settings


SUPPORTED_PROVIDERS = ("deepseek", "openai", "anthropic")


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


_BUILDERS = {
    "deepseek": _build_deepseek,
    "openai": _build_openai,
    "anthropic": _build_anthropic,
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
