# Rapport d'analyse AST — backend kaapi

> Généré par `codemap/scripts/analyze_ast.py` (étape 1).

## Totaux

- Fichiers analysés : **490**
- Erreurs de parsing : **0**
- Classes : **830**
- Méthodes : **1263**
- Fonctions (top-level) : **1000**
- Endpoints (routes HTTP) : **346**

## Répartition par couche

| Couche | Fichiers | LOC |
|--------|---------:|----:|
| plugin | 109 | 13987 |
| api | 88 | 19035 |
| service | 71 | 29629 |
| model | 56 | 5442 |
| util | 52 | 12310 |
| schema | 42 | 5801 |
| core | 25 | 3762 |
| test | 13 | 3625 |
| task | 12 | 1479 |
| command | 8 | 1551 |
| crud | 8 | 1912 |
| other | 3 | 297 |
| entrypoint | 3 | 891 |

## Répartition par module (top 40)

| Module | Fichiers | Couches |
|--------|---------:|---------|
| advanced_auth | 34 | api, core, model, plugin, schema, service, util |
| payment | 31 | api, core, model, plugin, service, test, util |
| recommendation | 25 | api, model, plugin, schema, service, task, util |
| api_gateway | 23 | api, core, model, plugin, schema, util |
| messaging_service | 23 | api, model, plugin, schema, service, task, test, util |
| push_notifications | 22 | api, core, model, plugin, schema, service |
| kyc | 21 | api, model, plugin, schema, util |
| business_alerts | 20 | api, model, plugin, schema, service, task, util |
| ai_integration | 18 | api, model, plugin, schema, test, util |
| api_versioning | 18 | api, core, crud, model, plugin, schema, util |
| security | 18 | core, model, plugin, schema, service |
| data_exchange | 17 | api, model, plugin, schema, util |
| file_storage | 17 | api, model, plugin, schema, service, test, util |
| workflow | 16 | api, model, plugin, schema, test, util |
| offline_sync | 15 | api, model, plugin, schema, util |
| digital_signature | 13 | api, model, plugin, schema, service, util |
| social_subscriptions | 13 | api, core, model, plugin, schema, service |
| advanced_audit | 12 | model, plugin, schema, task |
| matomo_integration | 12 | api, model, plugin, schema, service |
| user_analytics | 11 | api, model, plugin, schema, service |
| core | 9 | core |
| commands | 8 | command |
| routers | 8 | api, test |
| messaging | 7 | plugin, service |
| pwa_support | 7 | model, plugin, schema, service, test |
| app | 6 | core, crud |
| advanced_i18n | 6 | core, crud, model, plugin, schema, util |
| advanced_scheduler | 6 | model, plugin, schema, task |
| privacy_compliance | 6 | model, plugin, schema, test |
| webhooks | 6 | model, plugin, schema, task |
| services | 6 | service |
| crud | 5 | crud |
| advanced_logging | 5 | plugin, schema |
| monitoring | 5 | plugin |
| schemas | 4 | schema, test |
| api | 3 | api |
| entrypoint | 3 | entrypoint |
| models | 3 | model, test |
| lang | 2 | other |
| tasks | 2 | task |
