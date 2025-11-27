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
from sqlalchemy.orm import Session
from langchain_core.prompts import ChatPromptTemplate
from langchain_deepseek import ChatDeepSeek
from langgraph.graph import StateGraph, END
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_core.output_parsers import StrOutputParser
from pydantic import SecretStr

# Imports depuis notre module `veille`, corrigés
from app.schemas import veille as veille_schema
from app.crud import crud_veille
from app.core.config import settings

# Initialisation du LLM en utilisant la configuration centrale
llm = ChatDeepSeek(api_key=SecretStr(settings.DEEPSEEK_API_KEY), model="deepseek-chat", temperature=0)

# --- Fonctions de Scraping et Registre ---
class FoundArticle(TypedDict):
    title: str
    url: str
    source: str

DOMAINES_A_IGNORER = ['bloomberg.com', 'wsj.com', 'nytimes.com', 'reuters.com', 'ft.com', 'theinformation.com', 'axios.com', 't.co', 'ad.doubleclick.net']

# RETAINED AND CORRECTED scrape_techmeme (removed the duplicate)
async def scrape_techmeme(soup: BeautifulSoup, base_url: str) -> List[FoundArticle]:
    articles: List[FoundArticle] = []
    for link in soup.select('strong > a'):
        if not isinstance(link, Tag):
            continue
        href_attr = link.get('href')
        title = link.get_text(strip=True)
        
        # Correction Pylance: S'assurer que href est une chaîne de caractères
        if href_attr and isinstance(href_attr, str) and title and not any(d in href_attr for d in DOMAINES_A_IGNORER):
            articles.append({
                "title": title,
                "url": urljoin(base_url, href_attr),
                "source": "Techmeme"
            })
        if len(articles) >= 30:
            break
    return articles

async def scrape_techcabal(soup: BeautifulSoup, base_url: str) -> List[FoundArticle]:
    articles: List[FoundArticle] = []
    for link in soup.select("article.article-list-item a.article-list-title"):
        if not isinstance(link, Tag):
            continue
        title = link.get_text(strip=True)
        href_attr = link.get('href')
        
        # Correction Pylance: S'assurer que href est une chaîne de caractères
        if title and href_attr and isinstance(href_attr, str):
            articles.append({
                "title": title,
                "url": urljoin(base_url, href_attr),
                "source": "TechCabal"
            })
        if len(articles) >= 30:
            break
    return articles

async def scrape_techpoint_africa(soup: BeautifulSoup, base_url: str) -> List[FoundArticle]:
    articles: List[FoundArticle] = []
    for link in soup.select("div.gb-query-loop-item .value a"):
        if not isinstance(link, Tag):
            continue
        href_attr = link.get('href')
        title = link.get_text(strip=True)
        
        # Correction Pylance: S'assurer que href est une chaîne de caractères
        if href_attr and isinstance(href_attr, str) and title:
            articles.append({
                "title": title,
                "url": urljoin(base_url, href_attr),
                "source": "TechPoint Africa"
            })
        if len(articles) >= 30:
            break
    return articles

async def scrape_disruptafrica(soup: BeautifulSoup, base_url: str) -> List[FoundArticle]:
    articles: List[FoundArticle] = []
    for link in soup.select(".post-title a"):
        if not isinstance(link, Tag):
            continue
        href_attr = link.get('href')
        title = link.get_text(strip=True)
        
        # Correction Pylance: S'assurer que href est une chaîne de caractères
        if href_attr and isinstance(href_attr, str) and title:
            articles.append({
                "title": title,
                "url": urljoin(base_url, href_attr),
                "source": "Disrupt Africa"
            })
        if len(articles) >= 30:
            break
    return articles

async def scrape_weetracker(soup: BeautifulSoup, base_url: str) -> List[FoundArticle]:
    articles: List[FoundArticle] = []
    for link in soup.select("h5.f-title a"):
        if not isinstance(link, Tag):
            continue
        href_attr = link.get('href')
        title = link.get_text(strip=True)
        
        # Correction Pylance: S'assurer que href est une chaîne de caractères
        if href_attr and isinstance(href_attr, str) and title:
            articles.append({
                "title": title,
                "url": urljoin(base_url, href_attr),
                "source": "WeeTracker"
            })
        if len(articles) >= 30:
            break
    return articles

SCRAPER_REGISTRY = {
    "https://www.techmeme.com/": scrape_techmeme,
    "https://techcabal.com/": scrape_techcabal,
    "https://techpoint.africa/": scrape_techpoint_africa,
    "https://disruptafrica.com/": scrape_disruptafrica,
    "https://weetracker.com/": scrape_weetracker,
}

# --- Logique LangGraph interne au service ---
class AgentState(TypedDict):
    db_session: AsyncSession
    query: str
    sites_to_process: List[str]
    current_site: str
    found_articles: List[FoundArticle]

# --- Nœuds du Graphe ---
# Correction Pylance: Accepter AgentState comme type pour l'état
async def plan_next_site(state: AgentState) -> dict:
    sites = state.get("sites_to_process", []).copy()
    if sites:
        return {"current_site": sites.pop(0), "sites_to_process": sites}
    else:
        return {"current_site": ""}

# Correction Pylance: Accepter AgentState comme type pour l'état
async def scraper_dispatcher(state: AgentState) -> dict:
    """
    Dispatcher pour lancer le scraper correspondant à l'URL actuelle.
    Assure la sécurité des types pour Pylance.
    """
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

        # Appel du scraper spécifique au site
        new_articles: List[FoundArticle] = await scraper_function(soup, site_url)

        # Vérification et nettoyage des types
        cleaned_articles: List[FoundArticle] = []
        for art in new_articles:
            url = art.get("url")
            title = art.get("title")
            source = art.get("source")

            # Assurez-vous que l'URL est une chaîne de caractères valide avant urljoin
            if isinstance(url, list): # rare but possible if parsing errors
                url = url[0] if url else None

            if not (url and isinstance(url, str) and title and source):
                continue

            # urljoin pour s'assurer d'une URL complète
            # urljoin peut accepter None, mais nous avons déjà vérifié qu'il s'agit d'une chaîne
            cleaned_articles.append({
                "url": urljoin(site_url, url), # url est garantie str ici
                "title": str(title),
                "source": str(source)
            })

        current_articles = state.get("found_articles", [])
        return {"found_articles": current_articles + cleaned_articles}

    except Exception as e:
        print(f"ERREUR lors du scraping de {site_url}: {e}")
        return {"found_articles": state.get("found_articles", [])}

def extract_main_images(soup: BeautifulSoup, metadata=None, base_url: str = "") -> List[str]:
    """
    Extrait, score et retourne une liste des 5 meilleures URLs d'images d'un article.
    """
    candidates = {}

    def add_candidate(url: Optional[str], score: int):
        if not url or not isinstance(url, str) or not url.startswith('http'):
            return
        # On ne veut pas ajouter une image déjà présente avec un score plus bas
        if url not in candidates or score > candidates[url]:
            candidates[url] = score

    # 1. Métadonnées (Trafilatura, OpenGraph, Twitter) - Score le plus élevé
    if metadata and getattr(metadata, "image", None):
        add_candidate(getattr(metadata, "image"), 100)
    for prop in ["og:image", "twitter:image", "og:image:secure_url"]:
        tag = soup.find("meta", property=prop)
        if isinstance(tag, Tag):
            content = tag.get("content")
            # Correction Pylance: S'assurer que content est une chaîne de caractères
            if content and isinstance(content, str):
                add_candidate(urljoin(base_url, content), 95)

    # 2. Images dans le contenu principal avec des classes/attributs spécifiques
    main_content_selectors = ["article", "main", ".post-content", ".entry-content"]
    main_content = soup.find(main_content_selectors)
    if not main_content:
        main_content = soup.body

    if main_content and isinstance(main_content, Tag):
        for img in main_content.find_all("img"):
            if not isinstance(img, Tag):
                continue

            src_attr = img.get("src")
            # Correction Pylance: S'assurer que src_attr est une chaîne de caractères
            if not src_attr or not isinstance(src_attr, str):
                continue

            # Ignorer les images encodées en base64 ou les placeholders
            if src_attr.startswith('data:image'):
                continue

            score = 50  # Score de base pour une image dans le contenu
            # Bonus pour les classes communes d'images principales
            img_class_attr = img.get("class")
            img_class = img_class_attr if img_class_attr is not None else []
            if isinstance(img_class, list) and any(cls in img_class for cls in ["featured", "main-image", "wp-post-image"]):
                score += 30
            # Bonus pour les images de bonne taille (si spécifié)
            try:
                width = int(str(img.get("width", "0")))
                height = int(str(img.get("height", "0")))
                if width > 300 and height > 200:
                    score += 15
            except (ValueError, TypeError):
                pass
            
            add_candidate(urljoin(base_url, src_attr), score) # src_attr est garantie str ici

    # 3. Trier par score et retourner les 5 meilleures URLs
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

# Correction Pylance: Accepter AgentState comme type pour l'état
async def extract_analyze_and_save(state: AgentState) -> dict:
    print("\n--- NŒUD FINAL : Extraction, Analyse et Sauvegarde ---")
    all_found_articles = state.get("found_articles", [])
    if not all_found_articles:
        return {}

    # Déduplication des articles par URL
    unique_articles_list = list({article['url']: article for article in all_found_articles}.values())
    print(f"Traitement de {len(unique_articles_list)} articles uniques.")

    # Prompt pour le LLM
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

    db = state["db_session"]

    for article in unique_articles_list:
        article_data_for_crud = {**article}
        try:
            downloaded = trafilatura.fetch_url(article['url'])
            if not downloaded:
                article_data_for_crud["error"] = "Téléchargement échoué"
            else:
                content = trafilatura.extract(downloaded, favor_recall=True)
                metadata = trafilatura.extract_metadata(downloaded)
                # Création du soup
                soup = BeautifulSoup(downloaded, 'html.parser')

                # --- Extraction robuste de la date de publication ---
                publication_date = extract_publication_date(soup, metadata)
                if publication_date is None:
                    print(f"AVERTISSEMENT: Aucune date de publication trouvée pour {article['url']}. Utilisation de la date de scraping.")
                    publication_date = datetime.datetime.utcnow()

                print(f"DEBUG: Date de publication utilisée: {publication_date}")

                # Calcul de la catégorie de jour
                now = datetime.datetime.utcnow()
                today = now.date()
                publication_day = publication_date.date()

                day_category = "En semaine"
                if publication_day == today:
                    day_category = "Aujourd'hui"
                elif publication_day == today - datetime.timedelta(days=1):
                    day_category = "Hier"
                elif now - publication_date < datetime.timedelta(weeks=1):
                    day_category = "Cette semaine"

                # Extraction de l'URL de l'image
                image_urls = extract_main_images(soup, metadata, base_url=article["url"])


                article_data_for_crud.update({
                    "date": str(metadata.date) if metadata and metadata.date else "N/A", # Conserver l'ancien champ 'date' pour compatibilité si nécessaire
                    "publication_date": publication_date,
                    "day_category": day_category,
                    "source": article["source"],
                    "image_urls": image_urls,
                    "content": content
                })

                if content and len(content) > 250:
                    try:
                        # Appel LLM
                        analysis_result_obj = analysis_chain.invoke({"content": content[:8000]})

                        # S'assurer que c'est bien un Pydantic Model avant model_dump
                        if isinstance(analysis_result_obj, veille_schema.ArticleAnalysis):
                            analysis_dict = analysis_result_obj.model_dump()
                        else:
                            analysis_dict = dict(analysis_result_obj)

                        article_data_for_crud["analysis"] = analysis_dict
                        article_data_for_crud["score_pertinence"] = analysis_dict.get("score_pertinence", 0)
                    except Exception as llm_error:
                        article_data_for_crud["error"] = f"Erreur du LLM: {llm_error}"
                else:
                    article_data_for_crud["error"] = "Contenu insuffisant"
        except Exception as e:
            article_data_for_crud["error"] = f"Erreur d'extraction: {e}"

        # Sauvegarde en base
        await crud_veille.create_or_update_article(db=db, article_data=article_data_for_crud)

    print(f"Traitement et sauvegarde terminés pour {len(unique_articles_list)} articles.")
    return {"status": "SUCCESS", "processed_articles": len(unique_articles_list)}


# --- Logique de Routage et Construction ---
async def should_continue(state: AgentState) -> str:
    return "continue_scraping" if state.get("current_site") else "end_scraping"

def create_langgraph_app():
    workflow = StateGraph(AgentState)
    workflow.add_node("planner", plan_next_site)
    # Correction Pylance: Le type de scraper_dispatcher est maintenant compatible avec AgentState
    workflow.add_node("dispatcher", scraper_dispatcher) 
    workflow.add_node("analyze_and_save", extract_analyze_and_save)
    workflow.set_entry_point("planner")
    workflow.add_conditional_edges("planner", should_continue, {"continue_scraping": "dispatcher", "end_scraping": "analyze_and_save"})
    workflow.add_edge("dispatcher", "planner")
    workflow.add_edge("analyze_and_save", END)
    return workflow.compile()

langgraph_app = create_langgraph_app()

# --- Fonction principale du Service ---
async def run_veille_workflow(db: AsyncSession, query: str):
    initial_state = AgentState(
        db_session=db,
        query=query,
        sites_to_process=list(SCRAPER_REGISTRY.keys()),
        current_site="",
        found_articles=[],
    )
    
    print(f"Lancement du workflow de veille pour la requête : '{query}'")
    result = await langgraph_app.ainvoke(initial_state, recursion_limit=15)
    print("Workflow de veille terminé.")
    return result

async def backfill_clusters_service(db: AsyncSession):
    """
    Service de backfill pour générer et assigner des clusters de manière non supervisée.
    """
    print("--- Démarrage du service de backfill des clusters (non supervisé) ---")

    # 1. Récupérer tous les articles sans cluster
    articles_to_process = await crud_veille.get_articles_without_cluster(db)
    if not articles_to_process:
        print("Aucun article à traiter. Fin du backfill.")
        return

    print(f"Trouvé {len(articles_to_process)} articles à traiter pour le backfill.")

    # 2. Préparer les données pour le prompt
    articles_data_for_prompt = []
    for article in articles_to_process:
        if article.analysis and "problematique_africaine" in article.analysis:
            articles_data_for_prompt.append({
                "id": article.id,
                "problematique": article.analysis["problematique_africaine"]
            })

    # Formater en chaîne de caractères pour le prompt
    articles_str = "\n".join([f"ID: {a['id']}, Problématique: {a['problematique']}" for a in articles_data_for_prompt])

    # 3. Nouveau prompt pour la clusterisation non supervisée
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

    # 4. Appel au LLM
    print("Appel au LLM pour la clusterisation...")
    llm_response_str = await cluster_chain.ainvoke({"articles_to_cluster": articles_str})
    print("Réponse du LLM reçue.")

    updated_count = 0
    try:
        # 5. Utiliser une expression régulière pour extraire de manière fiable le contenu JSON

        json_match = re.search(r"\{.*\}", llm_response_str, re.DOTALL)

        if not json_match:
            raise json.JSONDecodeError("Aucun objet JSON trouvé dans la réponse du LLM.", llm_response_str, 0)

        json_str = json_match.group(0)
        cluster_results = json.loads(json_str)

        for cluster_name, article_ids in cluster_results.items():
            for article_id in article_ids:
                # Trouver l'URL correspondante à l'ID pour la mise à jour
                article_to_update = next((a for a in articles_to_process if a.id == article_id), None)
                if article_to_update:
                    await crud_veille.create_or_update_article(
                        db,
                        {"url": article_to_update.url, "sujet_cluster": cluster_name}
                    )
                    updated_count += 1
                    print(f"Article {article_id} → Cluster assigné: {cluster_name}")
                else:
                    print(f"[WARNING] Article ID {article_id} retourné par le LLM mais non trouvé dans la liste initiale.")

    except json.JSONDecodeError:
        print(f"[ERREUR] La réponse du LLM n'est pas un JSON valide (après nettoyage) : {llm_response_str}")
    except Exception as e:
        print(f"[ERREUR] Une erreur est survenue lors de la mise à jour des articles : {e}")


    print(f"--- Backfill terminé : {updated_count} articles mis à jour. ---")


async def backfill_pertinence_service(db: AsyncSession):
    """
    Service de backfill pour générer la justification de pertinence pour chaque article.
    Étape 2 : Assigner `pertinence_cluster` de manière individuelle.
    """
    print("--- Démarrage du service de backfill de pertinence (Étape 2 : Justification) ---")

    # 1. Récupérer les articles qui ont un cluster mais pas de justification
    articles_to_process = await crud_veille.get_articles_needing_pertinence(db)
    if not articles_to_process:
        print("Aucun article à traiter pour la justification. Fin.")
        return

    print(f"Trouvé {len(articles_to_process)} articles nécessitant une justification de pertinence.")

    # 2. Préparer le prompt et la chaîne LLM
    pertinence_prompt_template = """
    Analyse la situation suivante :
    - **Thématique du Cluster :** "{sujet_cluster}"
    - **Contenu de l'article :** "{contenu_article}"

    Ta mission : Rédige une seule phrase concise qui explique pourquoi cet article spécifique appartient à cette thématique.
    Commence ta phrase par "Cet article traite de..." ou une formulation similaire.

    **Exemple :**
    Cet article traite de la levée de fonds d'une startup de paiement, illustrant directement les défis de la régulation financière en Afrique.
    """
    pertinence_prompt = ChatPromptTemplate.from_template(pertinence_prompt_template)
    pertinence_chain = pertinence_prompt | llm | StrOutputParser()

    updated_count = 0
    for article in articles_to_process:
        if not article.content or not article.sujet_cluster:
            continue

        try:
            # 3. Appel au LLM pour chaque article
            justification = await pertinence_chain.ainvoke({
                "sujet_cluster": article.sujet_cluster,
                "contenu_article": article.content[:4000]  # Limiter la taille du contenu
            })

            # 4. Mise à jour de l'article avec la justification
            if justification:
                await crud_veille.create_or_update_article(
                    db, {"url": article.url, "pertinence_cluster": justification.strip()}
                )
                updated_count += 1
                print(f"Article {article.id} → Pertinence générée.")
        except Exception as e:
            print(f"[ERREUR] Impossible de générer la pertinence pour l'article {article.id}: {e}")

    print(f"--- Fin du backfill de pertinence. {updated_count} articles mis à jour. ---")


async def generate_article_by_cluster_belong(db: AsyncSession, cluster_id: int):
    """
    Génère un article de synthèse basé sur les résumés neutres de tous les articles d'un cluster.
    """
    print(f"--- Démarrage de la génération d'article de synthèse pour le cluster : '{cluster_id}' ---")

    # 1. Récupérer la concaténation des résumés neutres pour le cluster
    summaries = await crud_veille.get_neutral_summaries_by_cluster(db, cluster_id)
    if not summaries:
        print(f"Aucun résumé trouvé pour le cluster '{cluster_name}'. Fin du processus.")
        return

    print(f"Nombre de caractères des résumés concaténés : {len(summaries)}")

    # 2. Préparer le prompt pour la génération de l'article de synthèse
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
        # 3. Appel au LLM pour générer l'article
        print("Appel au LLM pour la génération de l'article de synthèse...")
        synthesized_article = await synthesis_chain.ainvoke({"summaries": summaries})
        print("Article de synthèse généré.")

        # 4. Sauvegarde de l'article généré
        if synthesized_article:
            # On crée un "pseudo-article" pour stocker la synthèse.
            # L'URL est unique et identifie cet article comme une synthèse de cluster.
            from urllib.parse import quote_plus
            url_slug = quote_plus(cluster_name.lower().replace(' ', '-'))
            internal_url = f"internal://summary/{url_slug}"

            article_data = {
                "url": internal_url,
                "title": f"Synthèse : {cluster_name}",
                "source": "Kaapi AI",
                "summary_article": synthesized_article,
                "sujet_cluster": cluster_name, # On le rattache au cluster
                "published": True # On le publie directement
            }
            await crud_veille.create_or_update_article(db, article_data)
            print(f"Article de synthèse pour le cluster '{cluster_name}' sauvegardé avec succès.")
        else:
            print("[AVERTISSEMENT] Le LLM a retourné un contenu vide pour l'article de synthèse.")

    except Exception as e:
        print(f"[ERREUR] Impossible de générer l'article de synthèse pour le cluster '{cluster_name}': {e}")

    print(f"--- Fin de la génération pour le cluster : '{cluster_name}' ---")


async def generate_slides_for_summary_article(db: AsyncSession, cluster_id: int):
    """
    Génère un carrousel de 10 slides à partir de l'article de synthèse d'un cluster.
    """
    print(f"--- Démarrage de la génération de slides pour le cluster : '{cluster_id}' ---")

    # 1. Récupérer l'article de synthèse
    summary_article = await crud_veille.get_summary_article_by_cluster(db, cluster_id)
    if not summary_article or not summary_article.summary_article:
        print(f"Aucun article de synthèse trouvé ou contenu vide pour le cluster '{cluster_id}'. Fin.")
        return

    # 2. Préparer le prompt pour la génération des slides
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
    # On attend une sortie JSON structurée selon notre schéma Pydantic
    slides_chain = slides_prompt | llm | StrOutputParser()

    llm_response_str = ""
    try:
        # 3. Appel au LLM
        print("Appel au LLM pour la génération des slides...")
        llm_response_str = await slides_chain.ainvoke({"summary_article": summary_article.summary_article})
        
        # Nettoyage pour extraire uniquement le JSON
        json_match = re.search(r"\[.*\]", llm_response_str, re.DOTALL)
        if not json_match:
            raise json.JSONDecodeError("Aucune liste JSON trouvée dans la réponse du LLM.", llm_response_str, 0)
        
        slides_data = json.loads(json_match.group(0))
        print("Slides générés et parsés avec succès.")

        # 4. Sauvegarde des slides
        await crud_veille.update_slides_for_article(db, article_id=summary_article.id, slides=slides_data)
        print(f"Slides pour le cluster '{cluster_name}' sauvegardés avec succès.")

    except json.JSONDecodeError as e:
        print(f"[ERREUR] La réponse du LLM n'est pas un JSON valide : {e.msg}\nRéponse brute: {llm_response_str}")
    except Exception as e:
        print(f"[ERREUR] Impossible de générer les slides pour le cluster '{cluster_name}': {e}")

    print(f"--- Fin de la génération de slides pour le cluster : '{cluster_name}' ---")