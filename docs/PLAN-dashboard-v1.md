# Plan v1 — Dashboard « Veille → Clusters → Contenu »

> But : sur le dashboard, ne plus afficher les clusters en vrac. On veut **chaque veille puis ses clusters**, pouvoir **clusteriser** une veille vide, puis **générer le contenu** (résumé + slides) d'un cluster — le tout depuis le front, sans repasser par le backend à la main.
>
> Statut : cadrage validé. La majorité de la plomberie existe déjà côté code, il reste à l'assembler.
> Repos : `tekawake-plateform` (backend) + `tekawake-client` (front Next.js).

---

## 1. Le problème aujourd'hui

- L'écran `/dashboard/topics` liste **tous les clusters à plat** (composant `AllTopics`, sidebar `topics/layout.tsx`). On ne sait pas **quel cluster vient de quelle veille** → les sujets se mélangent.
- Les actions de production de contenu existent **dans le code mais ne sont branchées nulle part** dans l'UI :
  - `runBackfill()` → `POST /api/clusters/backfill-assign` (`veille.service.ts:259`)
  - `generateClusterContent(id)` → `POST /api/clusters/{id}/generate-content` (`veille.service.ts:263`)
- Il n'existe **aucune page « Labs »**.

## 2. L'architecture du lien veille ↔ cluster (tranché)

Vérifié dans le code : la fonction `cluster_articles_for_veille` (`backend/app/services/clustering.py:204`) clusterise **les articles d'une seule veille à la fois** (`get_clusterable_articles(db, veille_id)`, ligne 233 ; création des clusters ligne 291-296). 👉 **Un cluster appartient toujours à exactement une veille — jamais de mélange inter-veilles.**

➡️ **Décision : on ajoute une colonne `veille_id` (FK) sur le modèle `Cluster`.** C'est exact (pas de perte d'info, les clusters sont déjà mono-veille), plus propre et plus pro que de reconstituer le lien via les articles. On peut alors **filtrer directement** : `GET /api/clusters/?veille_id=X` (au lieu d'une route dédiée). La fonction de clustering a déjà `veille_id` en contexte au moment du `create` → renseignement immédiat.

## 3. Cible UX

```
/dashboard/topics  (refonte)
└── Veille « IA en Afrique »            [3 clusters]   ▸ déplier
      ├── Cluster #3  « LLM souverains »   [résumé ✓ | slides ✓ | publié]
      ├── Cluster #7  « Agritech »         [pas de contenu]  → [Générer le contenu]
      └── Cluster #9  « Fintech »          [résumé ✓ | slides ✗]
└── Veille « Cybersécurité »            [0 cluster]    → [Clusteriser cette veille]
└── Veille « Énergie »                  [2 clusters]   ▸ déplier
```

- **Veille sans cluster** → bouton **« Clusteriser »** (= `runBackfill(veille_id)`).
- **Cluster sans contenu** → bouton **« Générer le contenu »** (= `generateClusterContent(id)`, génère résumé **+** slides en un clic — décision v1).
- Clic sur un cluster → vue détail existante (`TopicContent` : résumé, slides, articles, publish/unpublish). On la réutilise telle quelle.

## 4. Décisions de cadrage (validées)

| Sujet | Décision |
|---|---|
| Lien veille↔cluster | ➕ **Colonne FK `veille_id` sur `Cluster`** + filtre `GET /api/clusters/?veille_id=X` |
| Résumé + slides | 🔗 Garder `/generate-content` combiné (1 bouton) pour la v1 |
| Pagination | Côté client, via `skip`/`limit` (+ `/clusters/count`) déjà exposés par l'API |
| Responsive | Mobile-first à reprendre sur les écrans dashboard |
| Page « Labs » | Page dédiée pour les opérations « power user » (backfill, génération, choisir un cluster par id) — voir Lot 4 |

---

## 5. Lots de travail

### Lot 0 — Pré-requis (déjà fait / en cours)
- [x] CORS prod corrigé (origine `tekawake.com`) + image backend rebuildée sur GHCR.
- [ ] Confirmer le redeploy Dokploy backend (image `:latest`).

### Lot 1 — Backend : FK `veille_id` sur Cluster + filtre *(repo tekawake-plateform)*
- [ ] **Modèle** : ajouter `veille_id: Mapped[int] = mapped_column(ForeignKey("veilles.id"), index=True)` sur `Cluster` (`backend/app/models/veille.py:56`) + relation inverse côté `Veille`.
- [ ] **Migration Alembic** :
  1. ajouter la colonne en `nullable=True` ;
  2. backfill : `UPDATE clusters c SET veille_id = (SELECT a.veille_id FROM articles a WHERE a.cluster_id = c.id LIMIT 1)` (un cluster = une veille, donc sûr) ;
  3. gérer les clusters orphelins éventuels (sans articles) puis passer en `NOT NULL` + index.
- [ ] **Création** : renseigner `veille_id` dans `crud_cluster.create` et au `ClusterCreate(...)` de `clustering.py:292` (le `veille_id` est déjà en scope).
- [ ] **Schémas** : `veille_id` dans `ClusterCreate` (`schemas/veille.py:181`) et `ClusterResponse` (`:197`).
- [ ] **Filtre** : param `veille_id` dans `GET /api/clusters/` + `/count` (`crud_cluster.get_multi`/`count`, `:51` & `:70`).
- **Estimation : 0,5–1 j (la migration + backfill est le vrai point d'attention).**

### Lot 2 — Front : couche service *(repo tekawake-client, `src/lib/api/veille.service.ts`)*
- [ ] Étendre `useClusters({ veille_id, skip, limit, is_published })` → `GET /clusters/?veille_id=...&skip=...&limit=...` (pas de nouvelle route, on réutilise `useClusters`).
- [ ] Ajouter `veille_id` au type `ClusterResponse` (`:99`).
- [ ] Modifier `runBackfill(veilleId?)` pour passer `?veille_id=` (le backend l'accepte déjà).
- [ ] Garder `generateClusterContent(id)` (déjà ok) + invalider le cache SWR de la veille/cluster après succès.
- **Estimation : 0,5 j.**

### Lot 3 — Front : refonte écran Topics + pagination + responsive *(repo tekawake-client)*
- [ ] `/dashboard/topics` : remplacer la liste plate par une **liste de veilles dépliables** (accordion), chaque veille chargeant ses clusters via `useClusters({ veille_id })`.
  - Fichiers : `src/app/dashboard/topics/page.tsx`, `src/components/sections/dashboard/topics/all-topics.tsx`, sidebar `src/app/dashboard/topics/layout.tsx`.
- [ ] Veille vide → bouton **« Clusteriser »** (appelle `runBackfill(veilleId)`).
- [ ] Cluster sans `summary_article`/`slides` → bouton **« Générer le contenu »**.
- [ ] **Pagination** : sur la liste des clusters d'une veille (et/ou des veilles) via `skip`/`limit` + `/count` — composant pagination réutilisable.
- [ ] **Responsive** : accordion + cartes en mobile-first (sidebar repliable < md, grille adaptative).
- [ ] États asynchrones : backfill et génération sont des tâches Celery → afficher un état « en cours » + re-fetch (polling léger ou bouton « rafraîchir »).
- **Estimation : 2–2,5 j.**

### Lot 4 — Front : page « Labs » *(repo tekawake-client, nouvelle route)*
- [ ] Nouvelle route `/dashboard/labs` (+ entrée dans `admin-layout.tsx`).
- [ ] Centralise les opérations avancées :
  - Backfill global ou par veille (`runBackfill` avec/sans `veille_id`).
  - **Choisir un cluster par id** → générer le contenu (`generateClusterContent`).
  - Visualiser l'état (résumé/slides présents ou non).
- **Estimation : 1 j.**

### Lot 5 — Finitions & démo
- [ ] Sélecteur de LLM (deepseek/openai/anthropic/ollama) sur les actions, comme pour `runVeille`.
- [ ] Gestion des erreurs + toasts.
- [ ] Recette sur l'env de prod, puis **push des deux repos** sur leurs remotes respectifs.
- **Estimation : 0,5 j.**

---

## 6. Jalons (pour le suivi boss)

| Jalon | Contenu | Démo visible |
|---|---|---|
| **J1** | Lots 1 + 2 | API : `GET /clusters/?veille_id=X` filtre par veille |
| **J2** | Lot 3 | Dashboard : veilles dépliables avec leurs clusters, bouton « Clusteriser » |
| **J3** | Lot 3 (suite) | Pagination + responsive + bouton « Générer le contenu » → résumé/slides |
| **J4** | Lot 4 | Page Labs opérationnelle |
| **J5** | Lot 5 | Recette + mise en prod |

**Effort total estimé : ~5 à 6 jours** de dev.

## 7. Risques / points d'attention

- **Migration de données** (point n°1) : le backfill du `veille_id` sur les clusters existants doit être testé sur une copie. Cas à gérer : clusters sans articles (orphelins) → ne pourront pas être rattachés, à purger ou laisser nullable.
- **Asynchrone** : `backfill-assign` et `generate-content` sont des tâches de fond (Celery). L'UI doit gérer l'attente (le résultat n'est pas immédiat) — prévoir polling ou rafraîchissement manuel.
- **Cohérence des noms** : la « veille » s'appelle *tech-monitoring* dans l'UI front, *veille* dans l'API. On garde la terminologie existante.

## 8. Après cette v1

Une fois le dashboard admin complet et fiable → décliner la vue **utilisateur standard** (lecture seule des clusters publiés, sans les actions de production).
