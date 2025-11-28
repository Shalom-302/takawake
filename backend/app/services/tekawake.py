import os
from typing import List, Dict, TypedDict, Optional, Any
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup, Tag
import trafilatura
import asyncio
import re
import json

import datetime
# from sqlalchemy.orm import Session # Plus utilisé directement ici
from langchain_core.prompts import ChatPromptTemplate
from langchain_deepseek import ChatDeepSeek
from langgraph.graph import StateGraph, END
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_core.output_parsers import StrOutputParser
from pydantic import SecretStr
from langchain_core.runnables import Runnable # Correction Pylance pour LangGraph

# Imports depuis notre module `veille`, corrigés
from app.schemas import veille as veille_schema
# Importez les CRUDs spécifiques
from app.crud.crud_veille import crud_veille as crud_session_veille
from app.crud.crud_article import crud_article
from app.crud.crud_cluster import crud_cluster
from app.models.veille import ArticleStatus, VeilleStatus # NOUVEAUX IMPORTS

from app.core.config import settings

# Initialisation du LLM en utilisant la configuration centrale
llm = ChatDeepSeek(api_key=SecretStr(settings.DEEPSEEK_API_KEY), model="deepseek-chat", temperature=0)

# --- Fonctions de Scraping et Registre (Inchangé, supposé être défini ailleurs ou complet) ---
class FoundArticle(TypedDict):
    title: str; url: str; source: str

DOMAINES_A_IGNORER = ['bloomberg.com', 'wsj.com', 'nytimes.com', 'reuters.com', 'ft.com', 'theinformation.com', 'axios.com', 't.co', 'ad.doubleclick.net']

async def scrape_techmeme(soup: BeautifulSoup, base_url: str) -> List[FoundArticle]:
    articles: List[FoundArticle] = []
    for link in soup.select('strong > a'):
        if not isinstance(link, Tag):
            continue
        href_attr = link.get('href')
        title = link.get_text(strip=True)
        if href_attr and isinstance(href_attr, str) and title and not any(d in href_attr for d in DOMAINES_A_IGNORER):
            articles.append({
                "title": title,
                "url": urljoin(base_url, href_attr),
                "source": "Techmeme"
            })
        if len(articles) >= 20:
            break
    return articles

async def scrape_techcabal(soup: BeautifulSoup, base_url: str) -> List[FoundArticle]:
    articles: List[FoundArticle] = []
    for link in soup.select("article.article-list-item a.article-list-title"):
        if not isinstance(link, Tag):
            continue
        title = link.get_text(strip=True)
        href_attr = link.get('href')
        if title and href_attr and isinstance(href_attr, str):
            articles.append({
                "title": title,
                "url": urljoin(base_url, href_attr),
                "source": "TechCabal"
            })
        if len(articles) >= 20:
            break
    return articles

async def scrape_techpoint_africa(soup: BeautifulSoup, base_url: str) -> List[FoundArticle]:
    articles: List[FoundArticle] = []
    for link in soup.select("div.gb-query-loop-item .value a"):
        if not isinstance(link, Tag):
            continue
        href_attr = link.get('href')
        title = link.get_text(strip=True)
        if href_attr and isinstance(href_attr, str) and title:
            articles.append({
                "title": title,
                "url": urljoin(base_url, href_attr),
                "source": "TechPoint Africa"
            })
        if len(articles) >= 20:
            break
    return articles

async def scrape_disruptafrica(soup: BeautifulSoup, base_url: str) -> List[FoundArticle]:
    articles: List[FoundArticle] = []
    for link in soup.select(".post-title a"):
        if not isinstance(link, Tag):
            continue
        href_attr = link.get('href')
        title = link.get_text(strip=True)
        if href_attr and isinstance(href_attr, str) and title:
            articles.append({
                "title": title,
                "url": urljoin(base_url, href_attr),
                "source": "Disrupt Africa"
            })
        if len(articles) >= 20:
            break
    return articles

async def scrape_weetracker(soup: BeautifulSoup, base_url: str) -> List[FoundArticle]:
    articles: List[FoundArticle] = []
    for link in soup.select("h5.f-title a"):
        if not isinstance(link, Tag):
            continue
        href_attr = link.get('href')
        title = link.get_text(strip=True)
        if href_attr and isinstance(href_attr, str) and title:
            articles.append({
                "title": title,
                "url": urljoin(base_url, href_attr),
                "source": "WeeTracker"
            })
        if len(articles) >= 20:
            break
    return articles

SCRAPER_REGISTRY = {
    "https://www.techmeme.com/": scrape_techmeme,
    "https://techcabal.com/": scrape_techcabal,
    "https://techpoint.africa/": scrape_techpoint_africa,
    "https://disruptafrica.com/": scrape_disruptafrica,
    "https://weetracker.com/": scrape_weetracker,
}

# --- Fonctions d'extraction (inchangées) ---
def extract_main_images(soup: BeautifulSoup, metadata=None, base_url: str = "") -> List[str]:
    candidates = {}
    def add_candidate(url: Optional[str], score: int):
        if not url or not isinstance(url, str) or not url.startswith('http'):
            return
        if url not in candidates or score > candidates[url]:
            candidates[url] = score

    if metadata and getattr(metadata, "image", None):
        add_candidate(getattr(metadata, "image"), 100)
    for prop in ["og:image", "twitter:image", "og:image:secure_url"]:
        tag = soup.find("meta", property=prop)
        if isinstance(tag, Tag):
            content = tag.get("content")
            if content and isinstance(content, str):
                add_candidate(urljoin(base_url, content), 95)

    main_content_selectors = ["article", "main", ".post-content", ".entry-content"]
    main_content = soup.find(main_content_selectors)
    if not main_content:
        main_content = soup.body

    if main_content and isinstance(main_content, Tag):
        for img in main_content.find_all("img"):
            if not isinstance(img, Tag):
                continue

            src_attr = img.get("src")
            if not src_attr or not isinstance(src_attr, str):
                continue

            if src_attr.startswith('data:image'):
                continue

            score = 50
            img_class_attr = img.get("class")
            img_class = img_class_attr if img_class_attr is not None else []
            if isinstance(img_class, list) and any(cls in img_class for cls in ["featured", "main-image", "wp-post-image"]):
                score += 30
            try:
                width = int(str(img.get("width", "0")))
                height = int(str(img.get("height", "0")))
                if width > 300 and height > 200:
                    score += 15
            except (ValueError, TypeError):
                pass
            add_candidate(urljoin(base_url, src_attr), score)

    sorted_candidates = sorted(candidates.items(), key=lambda item: item[1], reverse=True)
    return [url for url, score in sorted_candidates[:5]]

def extract_publication_date(soup: BeautifulSoup, metadata=None) -> Optional[datetime.datetime]:
    possible_dates = []

    if metadata and getattr(metadata, "date", None):
        possible_dates.append(metadata.date)

    for meta_prop in ["article:published_time", "og:published_time", "pubdate", "date", "dc.date", "last-modified"]:
        tag = soup.find("meta", property=meta_prop) or soup.find("meta", attrs={"name": meta_prop})
        if isinstance(tag, Tag) and tag.get("content"):
            possible_dates.append(tag.get("content"))

    for time_tag in soup.find_all(["time", "span"], attrs={"datetime": True}):
        if isinstance(time_tag, Tag):
            possible_dates.append(time_tag.get("datetime"))

    for raw_date in possible_dates:
        if not isinstance(raw_date, str):
            continue
        try:
            return datetime.datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
        except Exception:
            pass
        for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y", "%b %d, %Y", "%B %d, %Y"):
            try:
                return datetime.datetime.strptime(raw_date, fmt)
            except Exception:
                continue

    return None

# --- Logique LangGraph interne au service ---
class AgentState(TypedDict):
    db_session: AsyncSession
    veille_id: int
    query: str
    sites_to_process: List[str]
    current_site: str
    found_articles: List[FoundArticle]

# --- Nœuds du Graphe (inchangé) ---
async def plan_next_site(state: AgentState) -> dict:
    sites = state.get("sites_to_process", []).copy()
    if sites:
        return {"current_site": sites.pop(0), "sites_to_process": sites}
    else:
        return {"current_site": ""}

async def scraper_dispatcher(state: AgentState) -> dict:
    site_url = state.get("current_site")
    if not site_url:
        return {"found_articles": state.get("found_articles", [])}

    scraper_function = SCRAPER_REGISTRY.get(site_url)
    if not scraper_function:
        return {"found_articles": state.get("found_articles", [])}

    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(site_url, headers=headers, timeout=20)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        new_articles: List[FoundArticle] = await scraper_function(soup, site_url)

        cleaned_articles: List[FoundArticle] = []
        for art in new_articles:
            url = art.get("url")
            title = art.get("title")
            source = art.get("source")

            if isinstance(url, list):
                url = url[0] if url else None

            if not (url and isinstance(url, str) and title and source):
                continue

            cleaned_articles.append({
                "url": urljoin(site_url, url),
                "title": str(title),
                "source": str(source)
            })

        current_articles = state.get("found_articles", [])
        return {"found_articles": current_articles + cleaned_articles}

    except Exception as e:
        print(f"ERREUR lors du scraping de {site_url}: {e}")
        return {"found_articles": state.get("found_articles", [])}


# --- NŒUD CRITIQUE : extract_analyze_and_save (MIS À JOUR) ---
async def extract_analyze_and_save(state: AgentState) -> dict:
    print("\n--- NŒUD FINAL : Extraction, Analyse et Sauvegarde ---")
    all_found_articles = state.get("found_articles", [])
    veille_id = state["veille_id"]
    db = state["db_session"]

    if not all_found_articles:
        print("Aucun article trouvé pour traitement.")
        return {}

    unique_articles_list = list({article['url']: article for article in all_found_articles}.values())
    print(f"Traitement de {len(unique_articles_list)} articles uniques.")

    analysis_prompt_template = """Vous êtes un analyste technologique mondial doublé d'un stratège pour l'Afrique. Pour l'article fourni, effectuez une analyse complète en deux temps : une analyse globale et neutre, puis une analyse stratégique spécifique à l'Afrique.

**Partie 1 : Analyse Globale (Neutre)**
1.  **Résumé Neutre :** Rédigez un résumé factuel et dense de l'article, de style journalistique (type agence de presse), strictement compris entre 700 et 800 caractères.
2.  **Problématique Générale :** Identifiez la problématique principale ou universelle soulevée.

**Partie 2 : Analyse Stratégique pour l'Afrique**
3.  **Impact sur l'Afrique :** Quel est l'impact direct ou indirect pour le continent ?
4.  **Problématique Spécifique à l'Afrique :** Quelle dépendance ou faiblesse cela révèle-t-il pour l'Afrique ?
5.  **Éveil de Conscience :** Quelle est la leçon critique pour les acteurs de la tech africaine ?
6.  **Piste d'Opportunité :** Quelle opportunité concrète cela crée-t-il ?
7.  **Score de Pertinence :** Attribuez un score de 1 à 10 sur l'importance de cette nouvelle pour l'Afrique.
    
Article à analyser : <article_text>{content}</article_text>"""

    analysis_prompt = ChatPromptTemplate.from_template(analysis_prompt_template)
    analysis_chain = analysis_prompt | llm.with_structured_output(veille_schema.ArticleAnalysis)

    processed_articles_count = 0
    for article_found in unique_articles_list:
        # Initialiser les données pour le CRUD d'article avec les champs du nouveau modèle
        article_data_for_crud = {
            "veille_id": veille_id,
            "source_url": article_found['url'],
            "source_name": article_found['source'],
            "title": article_found['title'],
            "status": ArticleStatus.PENDING, # Initialement en attente de traitement
            "status_message": None,          # Aucun message d'erreur initial
            "publication_date": None,
            "image_urls": [],
            "content": None,
            "analysis": None,
            "pertinence_cluster": None,
            "cluster_id": None
        }
        
        try:
            downloaded = trafilatura.fetch_url(article_found['url'])
            if not downloaded:
                article_data_for_crud["status"] = ArticleStatus.FAILED
                article_data_for_crud["status_message"] = "Téléchargement échoué"
            else:
                content = trafilatura.extract(downloaded, favor_recall=True)
                metadata = trafilatura.extract_metadata(downloaded)
                soup = BeautifulSoup(downloaded, 'html.parser')

                publication_date = extract_publication_date(soup, metadata)
                if publication_date is None:
                    print(f"AVERTISSEMENT: Aucune date de publication trouvée pour {article_found['url']}. Utilisation de la date de scraping.")
                    publication_date = datetime.datetime.utcnow()

                image_urls = extract_main_images(soup, metadata, base_url=article_found["url"])

                article_data_for_crud.update({
                    "publication_date": publication_date,
                    "image_urls": image_urls,
                    "content": content
                })

                if content and len(content) > 250:
                    try:
                        analysis_result_raw = await analysis_chain.ainvoke({"content": content[:8000]})
                        # Assurez-vous que l'objet est bien validé par Pydantic ArticleAnalysis
                        analysis_result_obj = veille_schema.ArticleAnalysis.model_validate(analysis_result_raw)
                        
                        article_data_for_crud["analysis"] = analysis_result_obj.model_dump()
                        article_data_for_crud["pertinence_cluster"] = analysis_result_obj.pertinence_cluster
                        # `score_pertinence` est maintenant dans `analysis_result_obj.model_dump()` et non un champ direct.

                        article_data_for_crud["status"] = ArticleStatus.PROCESSED # Marquer comme traité si tout s'est bien passé
                        processed_articles_count += 1

                    except Exception as llm_error:
                        article_data_for_crud["status"] = ArticleStatus.FAILED
                        article_data_for_crud["status_message"] = f"Erreur du LLM: {llm_error}"
                else:
                    article_data_for_crud["status"] = ArticleStatus.FAILED
                    article_data_for_crud["status_message"] = "Contenu insuffisant"

        except Exception as e:
            article_data_for_crud["status"] = ArticleStatus.FAILED
            article_data_for_crud["status_message"] = f"Erreur d'extraction ou inattendue: {e}"
        
        # Sauvegarde en base via le nouveau crud_article
        await crud_article.create_or_update(db=db, article_data=article_data_for_crud)

    print(f"Traitement et sauvegarde terminés pour {processed_articles_count}/{len(unique_articles_list)} articles.")
    return {"status": "SUCCESS", "processed_articles": processed_articles_count}


# --- Logique de Routage et Construction (inchangé) ---
async def should_continue(state: AgentState) -> str:
    return "continue_scraping" if state.get("current_site") else "end_scraping"

def create_langgraph_app() -> Runnable[AgentState, Dict[str, Any]]: # <-- AJOUTÉ L'ANNOTATION
    workflow = StateGraph(AgentState)
    workflow.add_node("planner", plan_next_site)
    workflow.add_node("dispatcher", scraper_dispatcher)
    workflow.add_node("analyze_and_save", extract_analyze_and_save)
    workflow.set_entry_point("planner")
    workflow.add_conditional_edges("planner", should_continue, {"continue_scraping": "dispatcher", "end_scraping": "analyze_and_save"})
    workflow.add_edge("dispatcher", "planner")
    workflow.add_edge("analyze_and_save", END)
    return workflow.compile()

langgraph_app: Runnable[AgentState, Dict[str, Any]] = create_langgraph_app() # <-- AJOUTÉ L'ANNOTATION

# --- Fonction principale du Service (MIS À JOUR) ---
async def run_veille_workflow(db: AsyncSession, query: str, veille_id: int):
    # Le statut PENDING est défini avant d'appeler ce service (dans la tâche Celery/routeur)

    initial_state = AgentState(
        db_session=db,
        veille_id=veille_id,
        query=query,
        sites_to_process=list(SCRAPER_REGISTRY.keys()),
        current_site="",
        found_articles=[],
    )
    
    print(f"Lancement du workflow de veille pour la requête : '{query}' (Veille ID: {veille_id})")
    try:
        result = await langgraph_app.ainvoke(initial_state, recursion_limit=15)
        
        # Mettre à jour le statut de la veille à SUCCESS
        veille_update_data = veille_schema.VeilleUpdate(status=VeilleStatus.SUCCESS)
        await crud_session_veille.update(db, veille_id=veille_id, veille_in=veille_update_data)
        
        print(f"Workflow de veille terminé pour ID {veille_id}. Statut mis à jour à SUCCESS.")
        return result
    except Exception as e:
        # Mettre à jour le statut de la veille à FAILED en cas d'erreur
        error_message = f"Échec du workflow de veille : {e}"
        print(f"--- ERREUR dans le workflow de veille (ID: {veille_id}) : {error_message} ---")
        veille_update_data = veille_schema.VeilleUpdate(status=VeilleStatus.FAILED, status_message=error_message)
        await crud_session_veille.update(db, veille_id=veille_id, veille_in=veille_update_data)
        raise # Relaisser l'exception pour que Celery la capture aussi

# --- NOUVEAU : Orchestrateur de Backfill (MIS À JOUR) ---
async def run_full_backfill_service(db: AsyncSession): # Plus besoin de 'steps', on fait tout d'un coup
    """
    Orchestre l'exécution de toutes les étapes du backfill (clustering et pertinence).
    """
    print(f"--- Démarrage du service de backfill complet orchestré ---")
    
    try:
        print("Étape 1: Exécution du backfill des clusters.")
        await backfill_clusters_service(db)
        print("Étape 1: Backfill des clusters terminé.")
        
        print("Étape 2: Exécution du backfill de la pertinence.")
        await backfill_pertinence_service(db)
        print("Étape 2: Backfill de la pertinence terminé.")
        
        print(f"--- Fin du service de backfill complet orchestré. ---")
        return {"status": "SUCCESS", "message": "Backfill complet terminé."}
    except Exception as e:
        error_message = f"Le backfill complet a échoué: {e}"
        print(f"--- ERREUR dans le service de backfill complet : {error_message} ---")
        raise # Relaisser l'exception pour que Celery la capture


# --- backfill_clusters_service (MIS À JOUR) ---
async def backfill_clusters_service(db: AsyncSession):
    """
    Service de backfill pour générer et assigner des clusters de manière non supervisée.
    """
    print("--- Démarrage du service de backfill des clusters (non supervisé) ---")

    # 1. Récupérer tous les articles sans cluster via crud_article
    articles_to_process = await crud_article.get_articles_without_cluster(db)
    if not articles_to_process:
        print("Aucun article à traiter pour le clustering. Fin du backfill.")
        return

    print(f"Trouvé {len(articles_to_process)} articles à traiter pour le clustering.")

    # 2. Préparer les données pour le prompt
    articles_data_for_prompt = []
    for article_db_obj in articles_to_process:
        # S'assurer que analysis est un dict et contient la problématique
        if article_db_obj.analysis and "problematique_africaine" in article_db_obj.analysis:
            articles_data_for_prompt.append({
                "id": article_db_obj.id,
                "problematique": article_db_obj.analysis["problematique_africaine"]
            })

    # Si après filtrage il n'y a plus d'articles avec une problématique, sortir
    if not articles_data_for_prompt:
        print("Aucun article avec problématique africaine à clusteriser. Fin du backfill.")
        return

    articles_str = "\n".join([f"ID: {a['id']}, Problématique: {a['problematique']}" for a in articles_data_for_prompt])

    cluster_prompt_template = """
    Tu es un expert en stratégie numérique africaine.
    Ta mission est d'analyser la liste de problématiques suivante et de les regrouper en clusters pertinents.

    **Instructions :**
    1.  Analyse l'ensemble des problématiques ci-dessous.
    2.  Identifie des thèmes communs et crée des clusters pour regrouper les articles.
    3.  **Contrainte importante :** Chaque cluster ne doit pas contenir plus de 10 articles.
    4.  Le nom de chaque cluster doit être une question qui synthétise la problématique sous-jacente et pousse à la réflexion (ex: "Comment l'Afrique peut-elle bâtir sa souveraineté technologique face aux géants étrangers ?", "Quelle régulation pour une finance inclusive et innovante en Afrique ?", "Comment réduire la fracture numérique dans les zones rurales ?").
    5.  Ta réponse doit être **uniquement un objet JSON valide**.
    6.  L'objet JSON doit avoir pour clés les questions des clusters que tu as créées, et pour valeurs une liste des IDs des articles appartenant à ce cluster.

    **Exemple de format de sortie :**
    {{
      "Quelle régulation pour une finance inclusive et innovante en Afrique ?": [15, 22, 43],
      "Comment l'Afrique peut-elle bâtir sa souveraineté technologique face aux géants étrangers ?": [12, 34, 56, 89]
    }}

    **Liste des problématiques à analyser :**
    {articles_to_cluster}
    """
    cluster_prompt = ChatPromptTemplate.from_template(cluster_prompt_template)
    cluster_chain = cluster_prompt | llm | StrOutputParser()

    print("Appel au LLM pour la clusterisation...")
    llm_response_str = await cluster_chain.ainvoke({"articles_to_cluster": articles_str})
    print("Réponse du LLM reçue.")

    updated_count = 0
    try:
        json_match = re.search(r"\{.*\}", llm_response_str, re.DOTALL)

        if not json_match:
            raise json.JSONDecodeError("Aucun objet JSON trouvé dans la réponse du LLM.", llm_response_str, 0)

        json_str = json_match.group(0)
        cluster_results: Dict[str, List[int]] = json.loads(json_str)

        for cluster_title, article_ids in cluster_results.items():
            db_cluster = await crud_cluster.get_by_title(db, cluster_title)
            if not db_cluster:
                new_cluster_data = veille_schema.ClusterCreate(title=cluster_title)
                db_cluster = await crud_cluster.create(db, new_cluster_data)
                print(f"Nouveau cluster créé: '{cluster_title}' (ID: {db_cluster.id})")
            
            for article_id in article_ids:
                article_update_data = veille_schema.ArticleUpdate(cluster_id=db_cluster.id)
                updated_article = await crud_article.update(db, article_id=article_id, article_in=article_update_data)
                
                if updated_article:
                    updated_count += 1
                    print(f"Article {article_id} → Cluster assigné: '{cluster_title}' (ID: {db_cluster.id})")
                else:
                    print(f"[WARNING] Article ID {article_id} retourné par le LLM mais non trouvé dans la liste initiale lors de l'assignation du cluster.")

    except json.JSONDecodeError:
        print(f"[ERREUR] La réponse du LLM n'est pas un JSON valide (après nettoyage) : {llm_response_str}")
    except Exception as e:
        print(f"[ERREUR] Une erreur est survenue lors de la mise à jour des articles : {e}")

    print(f"--- Backfill terminé : {updated_count} articles mis à jour avec des clusters. ---")


# --- backfill_pertinence_service (MIS À JOUR) ---
async def backfill_pertinence_service(db: AsyncSession):
    """
    Service de backfill pour générer la justification de pertinence pour chaque article.
    """
    print("--- Démarrage du service de backfill de pertinence (Étape 2 : Justification) ---")

    articles_to_process = await crud_article.get_articles_needing_pertinence(db)
    if not articles_to_process:
        print("Aucun article à traiter pour la justification. Fin.")
        return

    print(f"Trouvé {len(articles_to_process)} articles nécessitant une justification de pertinence.")

    pertinence_prompt_template = """
    Analyse la situation suivante :
    - **Thématique du Cluster :** "{cluster_title}"
    - **Contenu de l'article :** "{contenu_article}"

    Ta mission : Rédige une seule phrase concise qui explique pourquoi cet article spécifique appartient à cette thématique.
    Commence ta phrase par "Cet article traite de..." ou une formulation similaire.

    **Exemple :**
    Cet article traite de la levée de fonds d'une startup de paiement, illustrant directement les défis de la régulation financière en Afrique.
    """
    pertinence_prompt = ChatPromptTemplate.from_template(pertinence_prompt_template)
    pertinence_chain = pertinence_prompt | llm | StrOutputParser()

    updated_count = 0
    for article_db_obj in articles_to_process:
        if not article_db_obj.cluster_id:
            print(f"[WARNING] Article {article_db_obj.id} sans cluster_id alors qu'il devrait en avoir un.")
            continue
        
        db_cluster = await crud_cluster.get(db, article_db_obj.cluster_id)
        cluster_title = db_cluster.title if db_cluster else "Cluster inconnu"

        if not article_db_obj.content or not cluster_title:
            continue

        try:
            justification = await pertinence_chain.ainvoke({
                "cluster_title": cluster_title,
                "contenu_article": article_db_obj.content[:4000]
            })

            if justification:
                article_update_data = veille_schema.ArticleUpdate(pertinence_cluster=justification.strip())
                updated_article = await crud_article.update(db, article_id=article_db_obj.id, article_in=article_update_data)
                
                if updated_article:
                    updated_count += 1
                    print(f"Article {article_db_obj.id} → Pertinence générée.")
        except Exception as e:
            print(f"[ERREUR] Impossible de générer la pertinence pour l'article {article_db_obj.id}: {e}")

    print(f"--- Fin du backfill de pertinence. {updated_count} articles mis à jour. ---")



# --- NOUVEL ORCHESTRATEUR : Génération de Contenu de Cluster ---
async def generate_cluster_content_service(db: AsyncSession, cluster_id: int):
    """
    Orchestre la génération du contenu complet pour un cluster :
    1.  Génère l'article de synthèse.
    2.  Génère les slides à partir de la synthèse.
    """
    print(f"--- Démarrage de l'orchestrateur de génération de contenu pour le cluster ID : '{cluster_id}' ---")
    
    try:
        # Étape 1 : Générer l'article de synthèse
        print(f"Étape 1 : Génération de l'article de synthèse pour le cluster ID '{cluster_id}'.")
        await generate_article_by_cluster_belong(db, cluster_id)
        print(f"Étape 1 : Article de synthèse pour le cluster ID '{cluster_id}' généré avec succès.")

        # Étape 2 : Générer les slides à partir de l'article
        print(f"Étape 2 : Génération des slides pour le cluster ID '{cluster_id}'.")
        await generate_slides_for_summary_article(db, cluster_id)
        print(f"Étape 2 : Slides pour le cluster ID '{cluster_id}' générés avec succès.")
        
        print(f"--- Fin de l'orchestrateur de génération de contenu pour le cluster ID '{cluster_id}'. ---")
        return {"status": "SUCCESS", "message": "Contenu du cluster généré."}

    except Exception as e:
        error_message = f"L'orchestrateur de génération de contenu a échoué pour le cluster ID '{cluster_id}': {e}"
        print(f"--- ERREUR dans l'orchestrateur de génération de contenu : {error_message} ---")
        # L'exception est levée par les fonctions internes et sera capturée par la tâche Celery
        raise


# --- generate_article_by_cluster_belong (MIS À JOUR) ---
async def generate_article_by_cluster_belong(db: AsyncSession, cluster_id: int):
    """
    Génère un article de synthèse basé sur les résumés neutres de tous les articles d'un cluster.
    """
    print(f"--- Démarrage de la génération d'article de synthèse pour le cluster ID : '{cluster_id}' ---")

    db_cluster = await crud_cluster.get(db, cluster_id)
    if not db_cluster:
        print(f"Cluster avec ID '{cluster_id}' non trouvé. Fin du processus.")
        raise ValueError(f"Cluster avec ID '{cluster_id}' non trouvé.") # Lever une erreur pour l'orchestrateur
    cluster_title = db_cluster.title

    summaries = await crud_article.get_neutral_summaries_by_cluster_id(db, cluster_id)
    if not summaries:
        print(f"Aucun résumé trouvé pour le cluster '{cluster_title}' (ID: {cluster_id}). Fin du processus.")
        raise ValueError(f"Aucun résumé d'article trouvé pour le cluster '{cluster_title}' (ID: {cluster_id}).") # Lever une erreur
    
    print(f"Nombre de caractères des résumés concaténés pour le cluster '{cluster_title}' : {len(summaries)}")

    synthesis_prompt_template = """
    Tu es un journaliste spécialisé dans la tech africaine, reconnu pour ta capacité à synthétiser des informations complexes.

    **Mission :**
    À partir de la série de résumés d'articles ci-dessous, qui traitent tous de la même thématique, rédige un article de fond unique et cohérent.

    **Instructions :**
    1.  **Analyse et Synthèse :** Lis attentivement tous les résumés pour en extraire les idées clés, les tendances, les chiffres importants et les points de vue divergents.
    2.  **Structure :** L'article doit avoir un titre percutant, une introduction qui pose le contexte, un corps de texte qui développe l'analyse, et une conclusion qui ouvre des perspectives.
    3.  **Ton :** Adopte un style journalistique, informatif et engageant. Ne te contente pas de juxtaposer les résumés, mais crée un récit fluide et logique.
    4.  **Contenu :** L'article final doit être une œuvre originale qui apporte une plus-value par rapport aux articles sources, en connectant les points et en offrant une vue d'ensemble.
    5.  **Format :** La sortie doit être un texte brut, bien formaté, prêt à être publié.

    **Résumés à synthétiser :**
    {summaries}
    """
    synthesis_prompt = ChatPromptTemplate.from_template(synthesis_prompt_template)
    synthesis_chain = synthesis_prompt | llm | StrOutputParser()

    try:
        print("Appel au LLM pour la génération de l'article de synthèse...")
        synthesized_article = await synthesis_chain.ainvoke({"summaries": summaries})
        print("Article de synthèse généré.")

        if synthesized_article:
            cluster_update_data = veille_schema.ClusterUpdate(
                summary_article=synthesized_article
                # is_published=True # La publication est maintenant déclenchée par un endpoint dédié ou après slides
            )
            await crud_cluster.update(db, cluster_id=cluster_id, cluster_in=cluster_update_data)
            print(f"Article de synthèse pour le cluster '{cluster_title}' (ID: {cluster_id}) sauvegardé avec succès.")
            return {"status": "SUCCESS", "message": "Synthèse générée"}
        else:
            print(f"[AVERTISSEMENT] Le LLM a retourné un contenu vide pour l'article de synthèse du cluster '{cluster_title}'.")
            raise ValueError("Le LLM a retourné un contenu vide pour la synthèse.")

    except Exception as e:
        print(f"[ERREUR] Impossible de générer l'article de synthèse pour le cluster '{cluster_title}' (ID: {cluster_id}): {e}")
        raise # Relaisser l'exception


# --- generate_slides_for_summary_article (MIS À JOUR) ---
async def generate_slides_for_summary_article(db: AsyncSession, cluster_id: int):
    """
    Génère un carrousel de 10 slides à partir de l'article de synthèse d'un cluster.
    """
    print(f"--- Démarrage de la génération de slides pour le cluster ID : '{cluster_id}' ---")

    db_cluster = await crud_cluster.get_summary_article_by_cluster(db, cluster_id)
    if not db_cluster or not db_cluster.summary_article:
        print(f"Aucun article de synthèse trouvé ou contenu vide pour le cluster ID '{cluster_id}'. Fin.")
        raise ValueError(f"Aucun article de synthèse trouvé ou contenu vide pour le cluster ID '{cluster_id}'.")

    cluster_title = db_cluster.title
    summary_article_content = db_cluster.summary_article

    slides_prompt_template = """
    **Instructions :**
    **Ta mission est de transformer l'article de fond qui te sera fourni en un carrousel de slides captivants et engageants, optimisés pour les plateformes sociales, en suivant une structure narrative claire et percutante.**

    ---

    **Instructions détaillées pour la génération des slides :**

    1.  **Analyse et Synthèse (Contenu) :**
        *   Lis attentivement l'article fourni. Ton rôle est d'en extraire les idées principales, les faits clés, les arguments et les points culminants.
        *   Chaque slide doit présenter une idée unique, claire et forte, directement tirée de l'article et s'intégrant logiquement au récit global.
        *   **Ne pas inventer d'informations :** Le contenu de chaque slide doit être basé exclusivement sur l'article fourni.

    2.  **Storytelling Captivant (Structure narrative) :**
        *   Crée un récit cohérent et dynamique à travers les slides. Chaque slide doit susciter l'envie de découvrir le suivant, comme les chapitres d'une histoire.
        *   **Début :** Commence par une accroche forte et intrigante qui capte immédiatement l'attention.
        *   **Milieu :** Développe l'intrigue, la tension, les faits clés ou les explications essentielles de l'article.
        *   **Fin :** Termine par une conclusion mémorable, une réflexion finale impactante ou un appel à l'action clair.

    3.  **Ton & Style (Engagement) :**
        *   Adopte un ton direct, percutant, engageant et parfaitement adapté aux codes des réseaux sociaux.
        *   Utilise des questions rhétoriques, des affirmations audacieuses, des faits surprenants, des statistiques clés ou des emojis pertinents pour maintenir l'intérêt et l'interaction.

    4.  **Longueur du Texte (Concise & Impact) :**
        *   Le texte de chaque slide doit être concis pour une lecture rapide et efficace.
        *   Vise une moyenne d'environ 200 caractères par slide. Cette longueur est un guide ; la flexibilité est permise pour maximiser l'impact ou la clarté, mais la concision reste primordiale.

    5.  **Nombre de Slides :** Le nombre total de slides est 10. Adapte-le pour raconter l'histoire de l'article de la manière la plus efficace et la plus complète possible, sans diluer le propos ni surcharger d'informations.

    **Exemple de format de sortie :**
        [
    {{"slide": 1, "texte": "Depuis une semaine, le Sénégal fait face à une Cyberattaque qui paralyse ses finances. "}},
    {{"slide": 2, "texte": "Une offensive informatique de grande ampleur a neutralisé les outils de gestion et de recouvrement de l'administration fiscale.. "}},
    {{"slide": 3, "texte": "Les auteurs, situés selon les premières investigations en Europe, demandent une rançon de 10 millions d'euros pour restaurer l'accès aux systèmes. Soit 6,5 milliards FCFA"}},
    ...
    {{"slide": 4, "texte": "Pour appuyer leur revendication, les pirates ont publié des fragments de données internes à la DGID, montrant qu'ils occupent déjà une position critique dans les systèmes."}},
    ...
    en terminant par un eveil de conscience au 10ème slide.
    ]

    **Article à transformer :**
    {summary_article}
    """
    slides_prompt = ChatPromptTemplate.from_template(slides_prompt_template)
    slides_chain = slides_prompt | llm | StrOutputParser()

    llm_response_str = ""
    try:
        print("Appel au LLM pour la génération des slides...")
        llm_response_str = await slides_chain.ainvoke({"summary_article": summary_article_content})
        
        json_match = re.search(r"\[.*\]", llm_response_str, re.DOTALL)
        if not json_match:
            raise json.JSONDecodeError("Aucune liste JSON trouvée dans la réponse du LLM.", llm_response_str, 0)
        
        slides_raw_data = json.loads(json_match.group(0))
        slides_data_pydantic = [veille_schema.Slide(**s) for s in slides_raw_data]
        
        print("Slides générés et parsés avec succès.")

        await crud_cluster.update_slides_for_cluster(db, cluster_id=cluster_id, slides_data=slides_data_pydantic)
        print(f"Slides pour le cluster '{cluster_title}' (ID: {cluster_id}) sauvegardés avec succès.")
        return {"status": "SUCCESS", "message": "Slides générés"}

    except json.JSONDecodeError as e:
        print(f"[ERREUR] La réponse du LLM n'est pas un JSON valide : {e.msg}\nRéponse brute: {llm_response_str}")
        raise # Relaisser l'exception
    except Exception as e:
        print(f"[ERREUR] Impossible de générer les slides pour le cluster '{cluster_title}' (ID: {cluster_id}): {e}")
        raise # Relaisser l'exception