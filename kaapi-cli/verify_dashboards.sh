#!/bin/bash

echo "Vérification des métriques et des tableaux de bord..."

# Vérifier les métriques Prometheus
echo "✅ Vérification des métriques Prometheus de l'API"
curl -s http://localhost:8000/metrics | grep -E "kaapi_http_requests_total|kaapi_system_cpu_usage_percent" | head -5

# Générer du trafic pour les dashboards
echo -e "\n✅ Génération de trafic HTTP pour les dashboards"
for i in {1..5}; do 
  curl -s http://localhost:8000/ > /dev/null
  curl -s http://localhost:8000/docs > /dev/null
  # Générer quelques erreurs 404 pour le dashboard HTTP Status
  curl -s http://localhost:8000/chemin-inexistant-$i > /dev/null 2>&1
  # Créer quelques logs
  curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
    -H "Content-Type: application/json" \
    -d "{\"level\": \"INFO\", \"message\": \"Test log message $i\", \"labels\": {\"source\": \"test\"}}" > /dev/null
  echo "."
  sleep 1
done

echo -e "\n✅ URLs des tableaux de bord Grafana"
echo "1. API Performance:   http://localhost:3000/d/api-performance"
echo "2. HTTP Status Codes: http://localhost:3000/d/http-status"
echo "3. System Health:     http://localhost:3000/d/system-health"
echo "4. Advanced Logging:  http://localhost:3000/d/advanced-logging"
echo "5. Advanced Audit:    http://localhost:3000/d/advanced-audit"
