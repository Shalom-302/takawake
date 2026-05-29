# PROJECT_MAP — backend kaapi

> Carte d'architecture générée automatiquement par `codemap` (étape 3). Destinée à donner à un agent IA une compréhension rapide du backend sans rescanner tout le dépôt.

## Vue d'ensemble

- **490** fichiers Python · **99721** LOC
- **830** classes · **1263** méthodes · **1000** fonctions
- **346** endpoints HTTP
- **32** plugins métier

Stack : **FastAPI** (HTTP) · **SQLAlchemy** (ORM) · **Celery/Redis** (tâches async) · **Qdrant** + **sentence-transformers** (recherche vectorielle) · architecture **modulaire à plugins**.

## Couches architecturales

### `entrypoint` — 3 fichiers, 891 LOC

Bootstrap FastAPI : montage de l'app, middlewares, chargement des plugins, WebSocket, métriques.

### `api` — 88 fichiers, 19035 LOC

Points d'entrée HTTP (routers FastAPI). Valident l'I/O via les schémas, délèguent aux services/CRUD.

### `service` — 71 fichiers, 29629 LOC

Logique métier réutilisable (embeddings, Qdrant, clustering, LLM, paiement, sécurité...).

### `crud` — 8 fichiers, 1912 LOC

Accès aux données : opérations Create/Read/Update/Delete sur les modèles SQLAlchemy.

### `model` — 56 fichiers, 5442 LOC

Entités persistées (SQLAlchemy ORM). Base de la pyramide de dépendances.

### `schema` — 42 fichiers, 5801 LOC

Contrats d'I/O (Pydantic) : validation requêtes/réponses, sérialisation.

### `task` — 12 fichiers, 1479 LOC

Jobs asynchrones Celery (traitements longs, planifiés).

### `core` — 25 fichiers, 3762 LOC

Transverse : configuration, session DB, Celery, sécurité, rate-limiting, utilitaires.

### `command` — 8 fichiers, 1551 LOC

Commandes CLI / scripts d'initialisation (auth, storage, migrations).

### `util` — 52 fichiers, 12310 LOC

Fonctions utilitaires spécifiques à un module/plugin.

### `plugin` — 109 fichiers, 13987 LOC

Code d'un plugin non rattaché à une sous-couche standard (manifest, manager, glue).

### `test` — 13 fichiers, 3625 LOC

Tests automatisés.

### `other` — 3 fichiers, 297 LOC

Divers (i18n, ressources).

## Modules core (transverses)

| Fichier | Rôle (docstring) |
|---------|------------------|
| `app/__init__.py` |  |
| `app/casbin_enforcer.py` |  |
| `app/casbin_setup.py` |  |
| `app/codegen.py` |  |
| `app/core/__init__.py` |  |
| `app/core/celery.py` |  |
| `app/core/cli.py` | CLI utilities for database migrations and management. |
| `app/core/config.py` |  |
| `app/core/db.py` |  |
| `app/core/plugins/__init__.py` | Module pour la gestion des plugins de l'application. |
| `app/core/rate_limit.py` | Rate limiting functionality. |
| `app/core/security.py` |  |
| `app/core/utils.py` | Core utility functions for the application. |
| `app/crud_base.py` |  |
| `app/logger.py` |  |

## Points d'entrée

- `app/main.py` — 
- `app/metrics_server.py` — 
- `app/ws_server.py` — WebSocket server module for simple_kaapi

## Plugins métier

Chaque plugin réplique une mini-architecture (routes / models / services / schemas / utils) et s'enregistre auprès de l'app via son `*_router`.

| Plugin | Fichiers | Couches présentes |
|--------|---------:|-------------------|
| **advanced_audit** | 12 | model, plugin, schema, task |
| **advanced_auth** | 34 | api, core, model, plugin, schema, service, util |
| **advanced_i18n** | 6 | core, crud, model, plugin, schema, util |
| **advanced_logging** | 5 | plugin, schema |
| **advanced_scheduler** | 6 | model, plugin, schema, task |
| **ai_integration** | 18 | api, model, plugin, schema, test, util |
| **api_gateway** | 23 | api, core, model, plugin, schema, util |
| **api_versioning** | 18 | api, core, crud, model, plugin, schema, util |
| **business_alerts** | 20 | api, model, plugin, schema, service, task, util |
| **data_exchange** | 17 | api, model, plugin, schema, util |
| **digital_signature** | 13 | api, model, plugin, schema, service, util |
| **file_storage** | 17 | api, model, plugin, schema, service, test, util |
| **kyc** | 21 | api, model, plugin, schema, util |
| **matomo_integration** | 12 | api, model, plugin, schema, service |
| **messaging** | 7 | plugin, service |
| **messaging_service** | 23 | api, model, plugin, schema, service, task, test, util |
| **monitoring** | 5 | plugin |
| **offline_sync** | 15 | api, model, plugin, schema, util |
| **payment** | 31 | api, core, model, plugin, service, test, util |
| **plugin_manager.py** | 1 | plugin |
| **privacy_compliance** | 6 | model, plugin, schema, test |
| **push_notifications** | 22 | api, core, model, plugin, schema, service |
| **pwa_support** | 7 | model, plugin, schema, service, test |
| **recommendation** | 25 | api, model, plugin, schema, service, task, util |
| **security** | 18 | core, model, plugin, schema, service |
| **social_subscriptions** | 13 | api, core, model, plugin, schema, service |
| **streamlit** | 1 | other |
| **user_analytics** | 11 | api, model, plugin, schema, service |
| **utils** | 1 | util |
| **webhooks** | 6 | model, plugin, schema, task |
| **workflow** | 16 | api, model, plugin, schema, test, util |

## Services principaux

| Service | Couche | Importé par | Rôle |
|---------|--------|------------:|------|
| `app/plugins/payment/providers/provider_factory.py` | payment | 16 | Provider factory for payment providers. |
| `app/plugins/payment/providers/base_provider.py` | payment | 11 | Base payment provider. |
| `app/services/llm_factory.py` | services | 5 | Factory LLM : retourne le ChatModel LangChain correspondant au provider demandé. |
| `app/plugins/advanced_auth/providers/base.py` | advanced_auth | 4 | Base class for authentication providers. |
| `app/plugins/file_storage/providers/__init__.py` | file_storage | 4 | File storage providers |
| `app/plugins/file_storage/providers/base.py` | file_storage | 4 | Basic interface for storage providers |
| `app/plugins/messaging_service/services/message_service.py` | messaging_service | 4 | Message Service |
| `app/plugins/push_notifications/providers/base_provider.py` | push_notifications | 4 | Base Provider for Push Notifications |
| `app/plugins/social_subscriptions/services/activity_service.py` | social_subscriptions | 4 | Activity Service |
| `app/plugins/social_subscriptions/services/subscription_service.py` | social_subscriptions | 4 | Subscription Service |
| `app/services/qdrant_service.py` | services | 4 | Service Qdrant : collection unique `articles`. |
| `app/plugins/advanced_auth/service.py` | advanced_auth | 3 | Authentication service for the advanced authentication plugin. |
| `app/plugins/messaging_service/services/conversation_service.py` | messaging_service | 3 | Conversation Service |
| `app/plugins/push_notifications/services/device_service.py` | push_notifications | 3 | Device Service for Push Notifications |
| `app/plugins/push_notifications/services/notification_service.py` | push_notifications | 3 | Notification Service for Push Notifications |
| `app/plugins/push_notifications/services/template_service.py` | push_notifications | 3 | Template Service for Push Notifications |
| `app/plugins/security/mfa_service.py` | security | 3 |  |
| `app/plugins/business_alerts/services/detector.py` | business_alerts | 2 | Alert detector service. |
| `app/plugins/digital_signature/services/document_service.py` | digital_signature | 2 | Document signing service. |
| `app/plugins/matomo_integration/services/config_service.py` | matomo_integration | 2 | Configuration service for Matomo integration. |
| `app/plugins/push_notifications/services/segment_service.py` | push_notifications | 2 | Segmentation Service for Push Notifications |
| `app/plugins/pwa_support/push_service.py` | pwa_support | 2 | Push Notification Service for PWA Support |
| `app/plugins/recommendation/services/algorithm_service.py` | recommendation | 2 | Algorithm Service |
| `app/plugins/security/services.py` | security | 2 |  |
| `app/plugins/social_subscriptions/services/feed_service.py` | social_subscriptions | 2 | Feed Service |

## Endpoints API (par module)

<details><summary><b>advanced_auth</b> — 22 endpoints</summary>

- `GET    ` → `get_public_providers` (app/plugins/advanced_auth/public_routes.py)
- `POST   /email-verification/request` → `request_email_verification` (app/plugins/advanced_auth/routes.py)
- `POST   /email-verification/verify` → `verify_email` (app/plugins/advanced_auth/routes.py)
- `POST   /login` → `login` (app/plugins/advanced_auth/routes.py)
- `POST   /logout` → `logout` (app/plugins/advanced_auth/routes.py)
- `GET    /me` → `get_current_user_info` (app/plugins/advanced_auth/routes.py)
- `PUT    /me` → `update_current_user` (app/plugins/advanced_auth/routes.py)
- `POST   /me/change-password` → `change_password` (app/plugins/advanced_auth/routes.py)
- `POST   /mfa/setup` → `setup_mfa` (app/plugins/advanced_auth/routes.py)
- `POST   /mfa/verify` → `verify_mfa` (app/plugins/advanced_auth/routes.py)
- `POST   /oauth/callback` → `oauth_callback` (app/plugins/advanced_auth/routes.py)
- `POST   /oauth/init` → `init_oauth` (app/plugins/advanced_auth/routes.py)
- `POST   /password-reset/request` → `request_password_reset` (app/plugins/advanced_auth/routes.py)
- `POST   /password-reset/verify` → `verify_password_reset` (app/plugins/advanced_auth/routes.py)
- `GET    /providers` → `get_providers` (app/plugins/advanced_auth/routes.py)
- `POST   /refresh` → `refresh_token_with_user` (app/plugins/advanced_auth/routes.py)
- `POST   /register` → `register` (app/plugins/advanced_auth/routes.py)
- `POST   /token/refresh` → `refresh_access_token` (app/plugins/advanced_auth/routes.py)
- `GET    /users` → `get_users` (app/plugins/advanced_auth/routes.py)
- `DELETE /users/{user_id}` → `delete_user` (app/plugins/advanced_auth/routes.py)
- `GET    /users/{user_id}` → `get_user` (app/plugins/advanced_auth/routes.py)
- `PUT    /users/{user_id}` → `update_user` (app/plugins/advanced_auth/routes.py)

</details>

<details><summary><b>advanced_i18n</b> — 21 endpoints</summary>

- `GET    /export` → `export_translations` (app/plugins/advanced_i18n/main.py)
- `GET    /groups` → `get_translation_groups` (app/plugins/advanced_i18n/main.py)
- `POST   /groups` → `create_translation_group` (app/plugins/advanced_i18n/main.py)
- `DELETE /groups/{group_id}` → `delete_translation_group` (app/plugins/advanced_i18n/main.py)
- `GET    /groups/{group_id}` → `get_translation_group` (app/plugins/advanced_i18n/main.py)
- `PUT    /groups/{group_id}` → `update_translation_group` (app/plugins/advanced_i18n/main.py)
- `POST   /import` → `import_translations` (app/plugins/advanced_i18n/main.py)
- `GET    /js/{language_code}` → `get_js_translations` (app/plugins/advanced_i18n/main.py)
- `GET    /languages` → `get_languages` (app/plugins/advanced_i18n/main.py)
- `POST   /languages` → `create_language` (app/plugins/advanced_i18n/main.py)
- `GET    /languages/default` → `get_default_language` (app/plugins/advanced_i18n/main.py)
- `DELETE /languages/{language_id}` → `delete_language` (app/plugins/advanced_i18n/main.py)
- `GET    /languages/{language_id}` → `get_language` (app/plugins/advanced_i18n/main.py)
- `PUT    /languages/{language_id}` → `update_language` (app/plugins/advanced_i18n/main.py)
- `GET    /stats` → `get_translation_stats` (app/plugins/advanced_i18n/main.py)
- `GET    /translations` → `get_translations` (app/plugins/advanced_i18n/main.py)
- `POST   /translations` → `create_translation` (app/plugins/advanced_i18n/main.py)
- `DELETE /translations/{translation_id}` → `delete_translation` (app/plugins/advanced_i18n/main.py)
- `GET    /translations/{translation_id}` → `get_translation` (app/plugins/advanced_i18n/main.py)
- `PUT    /translations/{translation_id}` → `update_translation` (app/plugins/advanced_i18n/main.py)
- `GET    /translations/{translation_id}/history` → `get_translation_history` (app/plugins/advanced_i18n/main.py)

</details>

<details><summary><b>ai_integration</b> — 22 endpoints</summary>

- `DELETE ` → `clear_recommendations` (app/plugins/ai_integration/routes/recommendations.py)
- `DELETE ` → `clear_usage_records` (app/plugins/ai_integration/routes/usage.py)
- `GET    ` → `get_ai_models` (app/plugins/ai_integration/routes/models.py)
- `GET    ` → `get_ai_providers` (app/plugins/ai_integration/routes/providers.py)
- `GET    ` → `get_usage_records` (app/plugins/ai_integration/routes/usage.py)
- `POST   ` → `generate_content` (app/plugins/ai_integration/routes/content_generation.py)
- `POST   ` → `create_ai_model` (app/plugins/ai_integration/routes/models.py)
- `POST   ` → `create_ai_provider` (app/plugins/ai_integration/routes/providers.py)
- `POST   ` → `get_recommendations` (app/plugins/ai_integration/routes/recommendations.py)
- `POST   ` → `analyze_text` (app/plugins/ai_integration/routes/text_analysis.py)
- `POST   /chat` → `chat_response` (app/plugins/ai_integration/routes/content_generation.py)
- `POST   /completion` → `complete_text` (app/plugins/ai_integration/routes/content_generation.py)
- `GET    /statistics` → `get_usage_statistics` (app/plugins/ai_integration/routes/usage.py)
- `POST   /{content_id}/feedback` → `provide_recommendation_feedback` (app/plugins/ai_integration/routes/recommendations.py)
- `DELETE /{entity_type}/{entity_id}` → `delete_entity_analysis` (app/plugins/ai_integration/routes/text_analysis.py)
- `GET    /{entity_type}/{entity_id}` → `get_entity_analysis` (app/plugins/ai_integration/routes/text_analysis.py)
- `DELETE /{model_id}` → `delete_ai_model` (app/plugins/ai_integration/routes/models.py)
- `GET    /{model_id}` → `get_ai_model` (app/plugins/ai_integration/routes/models.py)
- `PUT    /{model_id}` → `update_ai_model` (app/plugins/ai_integration/routes/models.py)
- `DELETE /{provider_id}` → `delete_ai_provider` (app/plugins/ai_integration/routes/providers.py)
- `GET    /{provider_id}` → `get_ai_provider` (app/plugins/ai_integration/routes/providers.py)
- `PUT    /{provider_id}` → `update_ai_provider` (app/plugins/ai_integration/routes/providers.py)

</details>

<details><summary><b>api</b> — 4 endpoints</summary>

- `GET    /status` → `get_push_subscription_status` (app/api/push/routes.py)
- `POST   /subscribe` → `subscribe_to_push` (app/api/push/routes.py)
- `POST   /unsubscribe` → `unsubscribe_from_push` (app/api/push/routes.py)
- `GET    /vapid-public-key` → `get_vapid_public_key` (app/api/push/routes.py)

</details>

<details><summary><b>api_gateway</b> — 14 endpoints</summary>

- `POST   /` → `create_payment` (app/plugins/api_gateway/examples/payment_api.py)
- `GET    /audit-logs` → `list_audit_logs` (app/plugins/api_gateway/routes/endpoints.py)
- `GET    /keys` → `list_api_keys` (app/plugins/api_gateway/routes/endpoints.py)
- `POST   /keys` → `create_api_key` (app/plugins/api_gateway/routes/endpoints.py)
- `DELETE /keys/{key_id}` → `delete_api_key` (app/plugins/api_gateway/routes/endpoints.py)
- `GET    /keys/{key_id}` → `get_api_key` (app/plugins/api_gateway/routes/endpoints.py)
- `GET    /keys/{key_id}/permissions` → `get_api_key_permissions` (app/plugins/api_gateway/routes/endpoints.py)
- `PATCH  /keys/{key_id}/revoke` → `revoke_api_key` (app/plugins/api_gateway/routes/endpoints.py)
- `GET    /methods` → `get_payment_methods` (app/plugins/api_gateway/examples/payment_api.py)
- `GET    /namespaces` → `list_api_namespaces` (app/plugins/api_gateway/routes/endpoints.py)
- `POST   /refund` → `create_refund` (app/plugins/api_gateway/examples/payment_api.py)
- `GET    /refunds/{refund_id}` → `get_refund` (app/plugins/api_gateway/examples/payment_api.py)
- `GET    /registry` → `list_api_endpoints` (app/plugins/api_gateway/routes/endpoints.py)
- `GET    /{payment_id}` → `get_payment` (app/plugins/api_gateway/examples/payment_api.py)

</details>

<details><summary><b>api_versioning</b> — 26 endpoints</summary>

- `GET    /` → `get_api_changes` (app/plugins/api_versioning/routes/changes.py)
- `GET    /` → `get_api_endpoints` (app/plugins/api_versioning/routes/endpoints.py)
- `GET    /` → `get_api_versions` (app/plugins/api_versioning/routes/versions.py)
- `POST   /` → `create_api_change` (app/plugins/api_versioning/routes/changes.py)
- `POST   /` → `create_api_endpoint` (app/plugins/api_versioning/routes/endpoints.py)
- `POST   /` → `create_api_version` (app/plugins/api_versioning/routes/versions.py)
- `GET    /between-versions/{from_version}/{to_version}` → `get_changes_between_versions` (app/plugins/api_versioning/routes/changes.py)
- `GET    /by-name/{version_name}` → `get_api_version_by_name` (app/plugins/api_versioning/routes/versions.py)
- `GET    /changelog/{from_version}/{to_version}` → `get_version_changelog` (app/plugins/api_versioning/routes/docs.py)
- `GET    /endpoints/{version}` → `get_all_endpoints_for_version` (app/plugins/api_versioning/routes/docs.py)
- `GET    /info` → `get_api_info` (app/plugins/api_versioning/routes/docs.py)
- `GET    /version/{version_name}` → `get_endpoints_for_version` (app/plugins/api_versioning/routes/endpoints.py)
- `GET    /versions/{version}/openapi.json` → `get_openapi_schema` (app/plugins/api_versioning/routes/docs.py)
- `DELETE /{change_id}` → `delete_api_change` (app/plugins/api_versioning/routes/changes.py)
- `GET    /{change_id}` → `get_api_change` (app/plugins/api_versioning/routes/changes.py)
- `DELETE /{endpoint_id}` → `delete_api_endpoint` (app/plugins/api_versioning/routes/endpoints.py)
- `GET    /{endpoint_id}` → `get_api_endpoint` (app/plugins/api_versioning/routes/endpoints.py)
- `PUT    /{endpoint_id}` → `update_api_endpoint` (app/plugins/api_versioning/routes/endpoints.py)
- `POST   /{endpoint_id}/activate` → `activate_api_endpoint` (app/plugins/api_versioning/routes/endpoints.py)
- `POST   /{endpoint_id}/deactivate` → `deactivate_api_endpoint` (app/plugins/api_versioning/routes/endpoints.py)
- `DELETE /{version_id}` → `delete_api_version` (app/plugins/api_versioning/routes/versions.py)
- `GET    /{version_id}` → `get_api_version` (app/plugins/api_versioning/routes/versions.py)
- `PUT    /{version_id}` → `update_api_version` (app/plugins/api_versioning/routes/versions.py)
- `POST   /{version_id}/activate` → `activate_api_version` (app/plugins/api_versioning/routes/versions.py)
- `POST   /{version_id}/deactivate` → `deactivate_api_version` (app/plugins/api_versioning/routes/versions.py)
- `POST   /{version_id}/deprecate` → `deprecate_api_version` (app/plugins/api_versioning/routes/versions.py)

</details>

<details><summary><b>data_exchange</b> — 33 endpoints</summary>

- `GET    /` → `get_schedules` (app/plugins/data_exchange/routes/schedules.py)
- `GET    /` → `get_templates` (app/plugins/data_exchange/routes/templates.py)
- `POST   /` → `export_data` (app/plugins/data_exchange/routes/exports.py)
- `POST   /` → `import_data` (app/plugins/data_exchange/routes/imports.py)
- `POST   /` → `create_schedule` (app/plugins/data_exchange/routes/schedules.py)
- `POST   /` → `create_template` (app/plugins/data_exchange/routes/templates.py)
- `GET    /download/{job_id}` → `download_export_file` (app/plugins/data_exchange/routes/exports.py)
- `POST   /duplicate/{template_id}` → `duplicate_template` (app/plugins/data_exchange/routes/templates.py)
- `GET    /entities` → `get_exportable_entities` (app/plugins/data_exchange/routes/exports.py)
- `GET    /jobs` → `get_export_jobs` (app/plugins/data_exchange/routes/exports.py)
- `GET    /jobs` → `get_import_jobs` (app/plugins/data_exchange/routes/imports.py)
- `DELETE /jobs/{job_id}` → `delete_export_job` (app/plugins/data_exchange/routes/exports.py)
- `DELETE /jobs/{job_id}` → `delete_import_job` (app/plugins/data_exchange/routes/imports.py)
- `GET    /jobs/{job_id}` → `get_export_job` (app/plugins/data_exchange/routes/exports.py)
- `GET    /jobs/{job_id}` → `get_import_job` (app/plugins/data_exchange/routes/imports.py)
- `POST   /preview` → `preview_import` (app/plugins/data_exchange/routes/imports.py)
- `GET    /rule-types` → `get_rule_types` (app/plugins/data_exchange/routes/validation.py)
- `GET    /rules` → `get_validation_rules` (app/plugins/data_exchange/routes/validation.py)
- `POST   /rules` → `create_validation_rule` (app/plugins/data_exchange/routes/validation.py)
- `DELETE /rules/{rule_id}` → `delete_validation_rule` (app/plugins/data_exchange/routes/validation.py)
- `GET    /rules/{rule_id}` → `get_validation_rule` (app/plugins/data_exchange/routes/validation.py)
- `PUT    /rules/{rule_id}` → `update_validation_rule` (app/plugins/data_exchange/routes/validation.py)
- `GET    /shared` → `get_shared_templates` (app/plugins/data_exchange/routes/templates.py)
- `POST   /validate` → `validate_data_sample` (app/plugins/data_exchange/routes/validation.py)
- `DELETE /{schedule_id}` → `delete_schedule` (app/plugins/data_exchange/routes/schedules.py)
- `GET    /{schedule_id}` → `get_schedule` (app/plugins/data_exchange/routes/schedules.py)
- `PUT    /{schedule_id}` → `update_schedule_route` (app/plugins/data_exchange/routes/schedules.py)
- `POST   /{schedule_id}/activate` → `activate_schedule` (app/plugins/data_exchange/routes/schedules.py)
- `POST   /{schedule_id}/deactivate` → `deactivate_schedule` (app/plugins/data_exchange/routes/schedules.py)
- `GET    /{schedule_id}/jobs` → `get_schedule_jobs` (app/plugins/data_exchange/routes/schedules.py)
- `DELETE /{template_id}` → `delete_template` (app/plugins/data_exchange/routes/templates.py)
- `GET    /{template_id}` → `get_template` (app/plugins/data_exchange/routes/templates.py)
- `PUT    /{template_id}` → `update_template` (app/plugins/data_exchange/routes/templates.py)

</details>

<details><summary><b>entrypoint</b> — 7 endpoints</summary>

- `GET    /` → `read_root` (app/main.py)
- `GET    /debug/env` → `debug_env` (app/main.py)
- `GET    /docs` → `get_docs` (app/main.py)
- `GET    /metrics` → `read_metrics` (app/main.py)
- `GET    /metrics` → `metrics` (app/metrics_server.py)
- `GET    /openapi.json` → `get_open_api_endpoint` (app/main.py)
- `GET    /redoc` → `get_redoc` (app/main.py)

</details>

<details><summary><b>file_storage</b> — 9 endpoints</summary>

- `GET    ` → `list_folders` (app/plugins/file_storage/routes/folders.py)
- `POST   ` → `create_folder` (app/plugins/file_storage/routes/folders.py)
- `POST   /optimize` → `optimize_image` (app/plugins/file_storage/routes/images.py)
- `POST   /transform` → `transform_image` (app/plugins/file_storage/routes/images.py)
- `GET    /{file_id}/info` → `get_image_info` (app/plugins/file_storage/routes/images.py)
- `POST   /{file_id}/thumbnails` → `generate_thumbnails` (app/plugins/file_storage/routes/images.py)
- `DELETE /{folder_id}` → `delete_folder` (app/plugins/file_storage/routes/folders.py)
- `GET    /{folder_id}` → `get_folder_details` (app/plugins/file_storage/routes/folders.py)
- `PUT    /{folder_id}` → `update_folder` (app/plugins/file_storage/routes/folders.py)

</details>

<details><summary><b>matomo_integration</b> — 11 endpoints</summary>

- `GET    /` → `get_matomo_config` (app/plugins/matomo_integration/routes/config.py)
- `POST   /` → `update_matomo_config` (app/plugins/matomo_integration/routes/config.py)
- `POST   /dashboard` → `get_dashboard_embed_url` (app/plugins/matomo_integration/routes/embed.py)
- `GET    /dashboards` → `get_available_dashboards` (app/plugins/matomo_integration/routes/embed.py)
- `POST   /login-matomo` → `login_to_matomo` (app/plugins/matomo_integration/routes/auth.py)
- `POST   /report` → `get_report_embed_url` (app/plugins/matomo_integration/routes/embed.py)
- `GET    /reports` → `get_available_reports` (app/plugins/matomo_integration/routes/embed.py)
- `POST   /site-settings` → `update_site_settings` (app/plugins/matomo_integration/routes/config.py)
- `GET    /sync-all-users` → `sync_all_users` (app/plugins/matomo_integration/routes/auth.py)
- `POST   /sync-user` → `sync_user_to_matomo` (app/plugins/matomo_integration/routes/auth.py)
- `GET    /tracking-code` → `get_tracking_code` (app/plugins/matomo_integration/routes/config.py)

</details>

<details><summary><b>messaging_service</b> — 26 endpoints</summary>

- `GET    /blocks` → `get_blocked_users` (app/plugins/messaging_service/routes/conversation_routes.py)
- `POST   /blocks` → `block_user` (app/plugins/messaging_service/routes/conversation_routes.py)
- `DELETE /blocks/{blocked_id}` → `unblock_user` (app/plugins/messaging_service/routes/conversation_routes.py)
- `GET    /conversations` → `get_conversations` (app/plugins/messaging_service/routes/conversation_routes.py)
- `POST   /conversations/direct` → `create_direct_conversation` (app/plugins/messaging_service/routes/conversation_routes.py)
- `POST   /conversations/group` → `create_group_conversation` (app/plugins/messaging_service/routes/conversation_routes.py)
- `PATCH  /conversations/group/{conversation_id}` → `update_group_conversation` (app/plugins/messaging_service/routes/conversation_routes.py)
- `DELETE /conversations/{conversation_id}` → `leave_or_delete_conversation` (app/plugins/messaging_service/routes/conversation_routes.py)
- `GET    /conversations/{conversation_id}` → `get_conversation` (app/plugins/messaging_service/routes/conversation_routes.py)
- `PATCH  /conversations/{conversation_id}` → `update_conversation` (app/plugins/messaging_service/routes/conversation_routes.py)
- `POST   /conversations/{conversation_id}/mark-read` → `mark_conversation_as_read` (app/plugins/messaging_service/routes/message_routes.py)
- `POST   /conversations/{conversation_id}/members` → `add_conversation_member` (app/plugins/messaging_service/routes/conversation_routes.py)
- `DELETE /conversations/{conversation_id}/members/{member_id}` → `remove_conversation_member` (app/plugins/messaging_service/routes/conversation_routes.py)
- `POST   /conversations/{conversation_id}/read` → `mark_conversation_as_read` (app/plugins/messaging_service/routes/conversation_routes.py)
- `PATCH  /conversations/{conversation_id}/settings` → `update_conversation_settings` (app/plugins/messaging_service/routes/conversation_routes.py)
- `POST   /messages` → `create_message` (app/plugins/messaging_service/routes/message_routes.py)
- `POST   /messages/bulk` → `get_messages` (app/plugins/messaging_service/routes/message_routes.py)
- `POST   /messages/delete-bulk` → `delete_messages_bulk` (app/plugins/messaging_service/routes/message_routes.py)
- `POST   /messages/forward` → `forward_message` (app/plugins/messaging_service/routes/message_routes.py)
- `POST   /messages/search` → `search_messages` (app/plugins/messaging_service/routes/message_routes.py)
- `POST   /messages/status` → `update_message_status` (app/plugins/messaging_service/routes/message_routes.py)
- `GET    /messages/typing/{conversation_id}` → `send_typing_notification` (app/plugins/messaging_service/routes/message_routes.py)
- `POST   /messages/with-attachment` → `create_message_with_attachment` (app/plugins/messaging_service/routes/message_routes.py)
- `GET    /messages/{message_id}` → `get_message` (app/plugins/messaging_service/routes/message_routes.py)
- `PATCH  /messages/{message_id}` → `update_message` (app/plugins/messaging_service/routes/message_routes.py)
- `GET    /users/search` → `search_chat_users` (app/plugins/messaging_service/routes/conversation_routes.py)

</details>

<details><summary><b>payment</b> — 27 endpoints</summary>

- `GET    /` → `list_payments` (app/plugins/payment/routes/payment_routes.py)
- `GET    /` → `list_subscriptions` (app/plugins/payment/routes/subscription_routes.py)
- `POST   /` → `create_payment` (app/plugins/payment/routes/payment_routes.py)
- `POST   /` → `create_subscription` (app/plugins/payment/routes/subscription_routes.py)
- `GET    /methods` → `list_payment_methods` (app/plugins/payment/routes/payment_routes.py)
- `GET    /providers` → `list_providers` (app/plugins/payment/routes/payment_routes.py)
- `GET    /{payment_id}` → `get_payment` (app/plugins/payment/routes/payment_routes.py)
- `GET    /{payment_id}` → `get_refunds_for_payment_route` (app/plugins/payment/routes/refund_routes.py)
- `POST   /{payment_id}` → `create_refund_route` (app/plugins/payment/routes/refund_routes.py)
- `PUT    /{payment_id}` → `update_payment` (app/plugins/payment/routes/payment_routes.py)
- `POST   /{payment_id}/approve` → `approve_payment` (app/plugins/payment/routes/payment_routes.py)
- `POST   /{payment_id}/cancel` → `cancel_payment` (app/plugins/payment/routes/payment_routes.py)
- `POST   /{payment_id}/process` → `process_payment` (app/plugins/payment/routes/payment_routes.py)
- `POST   /{payment_id}/reject` → `reject_payment` (app/plugins/payment/routes/payment_routes.py)
- `GET    /{payment_id}/{refund_id}` → `get_refund_route` (app/plugins/payment/routes/refund_routes.py)
- `POST   /{payment_id}/{refund_id}/cancel` → `cancel_refund_route` (app/plugins/payment/routes/refund_routes.py)
- `POST   /{payment_id}/{refund_id}/process` → `process_refund_route` (app/plugins/payment/routes/refund_routes.py)
- `GET    /{payment_id}/{refund_id}/verify` → `verify_refund_status_route` (app/plugins/payment/routes/refund_routes.py)
- `POST   /{provider}` → `payment_webhook` (app/plugins/payment/routes/webhook_routes.py)
- `GET    /{subscription_id}` → `get_subscription` (app/plugins/payment/routes/subscription_routes.py)
- `PUT    /{subscription_id}` → `update_subscription` (app/plugins/payment/routes/subscription_routes.py)
- `POST   /{subscription_id}/activate` → `activate_subscription` (app/plugins/payment/routes/subscription_routes.py)
- `POST   /{subscription_id}/cancel` → `cancel_subscription` (app/plugins/payment/routes/subscription_routes.py)
- `POST   /{subscription_id}/invoice` → `create_invoice` (app/plugins/payment/routes/subscription_routes.py)
- `POST   /{subscription_id}/pause` → `pause_subscription` (app/plugins/payment/routes/subscription_routes.py)
- `POST   /{subscription_id}/resume` → `resume_subscription` (app/plugins/payment/routes/subscription_routes.py)
- `POST   /{subscription_id}/verify` → `verify_subscription` (app/plugins/payment/routes/subscription_routes.py)

</details>

<details><summary><b>plugin_manager.py</b> — 1 endpoints</summary>

- `GET    /admin/plugins` → `list_plugins` (app/plugins/plugin_manager.py)

</details>

<details><summary><b>privacy_compliance</b> — 3 endpoints</summary>

- `GET    /` → `root` (app/plugins/privacy_compliance/test.py)
- `GET    /privacy/cookie-consent/config` → `mock_cookie_consent_config` (app/plugins/privacy_compliance/test.py)
- `POST   /privacy/cookie-consent/record` → `mock_cookie_consent_record` (app/plugins/privacy_compliance/test.py)

</details>

<details><summary><b>push_notifications</b> — 16 endpoints</summary>

- `GET    /categories` → `get_categories` (app/plugins/push_notifications/routes.py)
- `POST   /categories` → `create_category` (app/plugins/push_notifications/routes.py)
- `DELETE /categories/{category_id}` → `delete_category` (app/plugins/push_notifications/routes.py)
- `PUT    /categories/{category_id}` → `update_category` (app/plugins/push_notifications/routes.py)
- `GET    /devices` → `get_user_devices` (app/plugins/push_notifications/routes.py)
- `POST   /devices` → `register_device` (app/plugins/push_notifications/routes.py)
- `DELETE /devices/{device_id}` → `deactivate_device` (app/plugins/push_notifications/routes.py)
- `PUT    /devices/{device_id}` → `update_device` (app/plugins/push_notifications/routes.py)
- `POST   /notifications` → `send_notification` (app/plugins/push_notifications/routes.py)
- `GET    /notifications/history` → `get_notification_history` (app/plugins/push_notifications/routes.py)
- `POST   /notifications/template` → `send_template_notification` (app/plugins/push_notifications/routes.py)
- `GET    /templates` → `get_templates` (app/plugins/push_notifications/routes.py)
- `POST   /templates` → `create_template` (app/plugins/push_notifications/routes.py)
- `DELETE /templates/{template_id}` → `delete_template` (app/plugins/push_notifications/routes.py)
- `PUT    /templates/{template_id}` → `update_template` (app/plugins/push_notifications/routes.py)
- `GET    /web-push/vapid-public-key` → `get_vapid_public_key` (app/plugins/push_notifications/routes.py)

</details>

<details><summary><b>recommendation</b> — 10 endpoints</summary>

- `POST   /batch` → `batch_feedback` (app/plugins/recommendation/routes/feedback.py)
- `POST   /items` → `recommend_items` (app/plugins/recommendation/routes/recommend.py)
- `POST   /preferences` → `update_preferences` (app/plugins/recommendation/routes/feedback.py)
- `DELETE /purge_old_data` → `purge_old_data` (app/plugins/recommendation/routes/admin.py)
- `POST   /record` → `record_feedback` (app/plugins/recommendation/routes/feedback.py)
- `POST   /reset_recommendations` → `reset_recommendations` (app/plugins/recommendation/routes/admin.py)
- `POST   /similar` → `similar_items` (app/plugins/recommendation/routes/recommend.py)
- `GET    /status` → `get_system_status` (app/plugins/recommendation/routes/admin.py)
- `POST   /train` → `train_models` (app/plugins/recommendation/routes/admin.py)
- `GET    /trending` → `trending_items` (app/plugins/recommendation/routes/recommend.py)

</details>

<details><summary><b>routers</b> — 34 endpoints</summary>

- `GET    /` → `get_articles_list` (app/routers/article.py)
- `GET    /` → `get_all_categories` (app/routers/category.py)
- `GET    /` → `get_all_clusters` (app/routers/cluster.py)
- `GET    /` → `get_all_veilles` (app/routers/veille.py)
- `POST   /` → `create_new_category` (app/routers/category.py)
- `DELETE /all` → `delete_all_articles_endpoint` (app/routers/article.py)
- `GET    /all-with-pertinences` → `get_all_clusters_with_pertinences` (app/routers/cluster.py)
- `POST   /apply` → `apply_migrations` (app/routers/migrations.py)
- `POST   /backfill-assign` → `run_full_backfill_endpoint` (app/routers/cluster.py)
- `GET    /changes` → `get_pending_migrations` (app/routers/migrations.py)
- `GET    /collections` → `list_qdrant_collections` (app/routers/qdrant.py)
- `GET    /collections/{collection}` → `qdrant_collection_detail` (app/routers/qdrant.py)
- `GET    /count` → `count_articles` (app/routers/article.py)
- `GET    /count` → `count_clusters` (app/routers/cluster.py)
- `GET    /count` → `count_veilles` (app/routers/veille.py)
- `POST   /run` → `run_new_veille` (app/routers/veille.py)
- `DELETE /{article_id}` → `delete_single_article` (app/routers/article.py)
- `GET    /{article_id}` → `get_single_article` (app/routers/article.py)
- `PATCH  /{article_id}` → `update_article_partial` (app/routers/article.py)
- `DELETE /{category_id}` → `delete_single_category` (app/routers/category.py)
- `GET    /{category_id}` → `get_single_category` (app/routers/category.py)
- `PATCH  /{category_id}` → `update_category_partial` (app/routers/category.py)
- `DELETE /{cluster_id}` → `delete_single_cluster` (app/routers/cluster.py)
- `GET    /{cluster_id}` → `get_single_cluster` (app/routers/cluster.py)
- `PATCH  /{cluster_id}` → `update_cluster_partial` (app/routers/cluster.py)
- `POST   /{cluster_id}/generate-content` → `generate_cluster_full_content_endpoint` (app/routers/cluster.py)
- `GET    /{cluster_id}/image` → `get_cluster_best_image_urls` (app/routers/cluster.py)
- `GET    /{cluster_id}/images` → `get_cluster_relevant_images` (app/routers/cluster.py)
- `DELETE /{cluster_id}/slides` → `clear_cluster_slides_endpoint` (app/routers/cluster.py)
- `GET    /{cluster_id}/slides` → `get_cluster_slides_content` (app/routers/cluster.py)
- `DELETE /{cluster_id}/summary` → `clear_cluster_summary_endpoint` (app/routers/cluster.py)
- `GET    /{cluster_id}/summary` → `get_cluster_summary_content` (app/routers/cluster.py)
- `DELETE /{veille_id}` → `delete_veille` (app/routers/veille.py)
- `GET    /{veille_id}` → `get_single_veille` (app/routers/veille.py)

</details>

<details><summary><b>social_subscriptions</b> — 20 endpoints</summary>

- `POST   /activities` → `create_activity` (app/plugins/social_subscriptions/routes/feed.py)
- `GET    /feed` → `get_activity_feed` (app/plugins/social_subscriptions/routes/feed.py)
- `POST   /feed/read-all` → `mark_all_feed_items_as_read` (app/plugins/social_subscriptions/routes/feed.py)
- `POST   /feed/{feed_item_id}/hide` → `hide_feed_item` (app/plugins/social_subscriptions/routes/feed.py)
- `POST   /feed/{feed_item_id}/read` → `mark_feed_item_as_read` (app/plugins/social_subscriptions/routes/feed.py)
- `GET    /preferences` → `get_user_preferences` (app/plugins/social_subscriptions/routes/preferences.py)
- `POST   /preferences` → `create_user_preferences` (app/plugins/social_subscriptions/routes/preferences.py)
- `PUT    /preferences` → `update_user_preferences` (app/plugins/social_subscriptions/routes/preferences.py)
- `POST   /preferences/categories` → `set_enabled_categories` (app/plugins/social_subscriptions/routes/preferences.py)
- `POST   /preferences/feed` → `set_feed_preferences` (app/plugins/social_subscriptions/routes/preferences.py)
- `POST   /preferences/quiet-hours` → `set_quiet_hours` (app/plugins/social_subscriptions/routes/preferences.py)
- `GET    /subscribers` → `get_my_subscribers` (app/plugins/social_subscriptions/routes/subscription.py)
- `GET    /subscribers/count` → `get_subscriber_count` (app/plugins/social_subscriptions/routes/subscription.py)
- `GET    /subscriptions` → `get_my_subscriptions` (app/plugins/social_subscriptions/routes/subscription.py)
- `GET    /subscriptions/count` → `get_subscription_count` (app/plugins/social_subscriptions/routes/subscription.py)
- `GET    /subscriptions/mutual` → `get_mutual_subscriptions` (app/plugins/social_subscriptions/routes/subscription.py)
- `DELETE /subscriptions/{publisher_id}` → `unsubscribe_from_user` (app/plugins/social_subscriptions/routes/subscription.py)
- `GET    /subscriptions/{publisher_id}` → `get_subscription` (app/plugins/social_subscriptions/routes/subscription.py)
- `POST   /subscriptions/{publisher_id}` → `subscribe_to_user` (app/plugins/social_subscriptions/routes/subscription.py)
- `PUT    /subscriptions/{publisher_id}` → `update_subscription` (app/plugins/social_subscriptions/routes/subscription.py)

</details>

<details><summary><b>user_analytics</b> — 10 endpoints</summary>

- `POST   /component-heatmap/{component_name}` → `generate_component_heatmap` (app/plugins/user_analytics/routes/analytics.py)
- `GET    /dashboard/overview` → `get_analytics_overview` (app/plugins/user_analytics/routes/analytics.py)
- `POST   /event` → `record_event` (app/plugins/user_analytics/routes/events.py)
- `POST   /events/batch` → `batch_record_events` (app/plugins/user_analytics/routes/events.py)
- `POST   /heatmap` → `generate_heatmap` (app/plugins/user_analytics/routes/analytics.py)
- `POST   /session` → `create_session` (app/plugins/user_analytics/routes/sessions.py)
- `GET    /session/{session_id}` → `get_session` (app/plugins/user_analytics/routes/sessions.py)
- `POST   /session/{session_id}/anonymize` → `anonymize_session` (app/plugins/user_analytics/routes/sessions.py)
- `POST   /session/{session_id}/end` → `end_session` (app/plugins/user_analytics/routes/sessions.py)
- `POST   /user-journey` → `get_user_journey` (app/plugins/user_analytics/routes/analytics.py)

</details>

<details><summary><b>workflow</b> — 30 endpoints</summary>

- `POST   /approvals/{approval_id}/approve` → `approve_step` (app/plugins/workflow/routes/approvals.py)
- `POST   /approvals/{approval_id}/reject` → `reject_step` (app/plugins/workflow/routes/approvals.py)
- `GET    /instances` → `get_workflow_instances` (app/plugins/workflow/routes/instances.py)
- `POST   /instances` → `create_workflow_instance` (app/plugins/workflow/routes/instances.py)
- `DELETE /instances/{instance_id}` → `cancel_workflow_instance` (app/plugins/workflow/routes/instances.py)
- `GET    /instances/{instance_id}` → `get_workflow_instance` (app/plugins/workflow/routes/instances.py)
- `GET    /instances/{instance_id}/approvals` → `get_instance_approvals` (app/plugins/workflow/routes/approvals.py)
- `GET    /instances/{instance_id}/history` → `get_workflow_instance_history` (app/plugins/workflow/routes/instances.py)
- `PUT    /instances/{instance_id}/transition/{state_id}` → `transition_workflow_instance` (app/plugins/workflow/routes/instances.py)
- `DELETE /states/{state_id}` → `delete_workflow_state` (app/plugins/workflow/routes/states.py)
- `GET    /states/{state_id}` → `get_workflow_state` (app/plugins/workflow/routes/states.py)
- `PUT    /states/{state_id}` → `update_workflow_state` (app/plugins/workflow/routes/states.py)
- `DELETE /steps/{step_id}` → `delete_workflow_step` (app/plugins/workflow/routes/steps.py)
- `GET    /steps/{step_id}` → `get_workflow_step` (app/plugins/workflow/routes/steps.py)
- `PUT    /steps/{step_id}` → `update_workflow_step` (app/plugins/workflow/routes/steps.py)
- `DELETE /transitions/{transition_id}` → `delete_workflow_transition` (app/plugins/workflow/routes/transitions.py)
- `GET    /transitions/{transition_id}` → `get_workflow_transition` (app/plugins/workflow/routes/transitions.py)
- `PUT    /transitions/{transition_id}` → `update_workflow_transition` (app/plugins/workflow/routes/transitions.py)
- `GET    /users/me/pending-approvals` → `get_my_pending_approvals` (app/plugins/workflow/routes/approvals.py)
- `GET    /workflows` → `get_workflows` (app/plugins/workflow/routes/workflows.py)
- `POST   /workflows` → `create_workflow` (app/plugins/workflow/routes/workflows.py)
- `DELETE /workflows/{workflow_id}` → `delete_workflow` (app/plugins/workflow/routes/workflows.py)
- `GET    /workflows/{workflow_id}` → `get_workflow` (app/plugins/workflow/routes/workflows.py)
- `PUT    /workflows/{workflow_id}` → `update_workflow` (app/plugins/workflow/routes/workflows.py)
- `GET    /workflows/{workflow_id}/states` → `get_workflow_states` (app/plugins/workflow/routes/states.py)
- `POST   /workflows/{workflow_id}/states` → `create_workflow_state` (app/plugins/workflow/routes/states.py)
- `GET    /workflows/{workflow_id}/steps` → `get_workflow_steps` (app/plugins/workflow/routes/steps.py)
- `POST   /workflows/{workflow_id}/steps` → `create_workflow_step` (app/plugins/workflow/routes/steps.py)
- `GET    /workflows/{workflow_id}/transitions` → `get_workflow_transitions` (app/plugins/workflow/routes/transitions.py)
- `POST   /workflows/{workflow_id}/transitions` → `create_workflow_transition` (app/plugins/workflow/routes/transitions.py)

</details>

## Flux métier (déduits du graphe de dépendances)

Relations de couche les plus fréquentes (cf. `dependency_graph.md`) :

```
Client HTTP → Router (api) → Service → CRUD → Model → DB
                  │              │
               Schema         Core (config, db, sécurité)
Celery beat/worker → Task → Service/CRUD → Model
```

| Relation | # imports |
|----------|----------:|
| api → core | 127 |
| service → model | 74 |
| api → model | 73 |
| plugin → core | 69 |
| api → schema | 57 |
| plugin → api | 56 |
| api → util | 55 |
| model → core | 48 |
| util → model | 36 |
| plugin → model | 33 |
| api → service | 33 |
| service → core | 31 |
| entrypoint → plugin | 29 |
| plugin → service | 24 |
| service → schema | 22 |
