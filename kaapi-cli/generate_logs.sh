#!/bin/bash

echo 'Generating test logs for the Advanced Logging dashboard...'


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "INFO", "message": "INFO log message from api during read operation", "labels": {"source": "api", "operation": "read"}}'

sleep 0.5


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "INFO", "message": "INFO log message from api during write operation", "labels": {"source": "api", "operation": "write"}}'

sleep 0.5


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "INFO", "message": "INFO log message from database during read operation", "labels": {"source": "database", "operation": "read"}}'

sleep 0.5


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "INFO", "message": "INFO log message from database during write operation", "labels": {"source": "database", "operation": "write"}}'

sleep 0.5


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "WARNING", "message": "WARNING log message from api during read operation", "labels": {"source": "api", "operation": "read"}}'

sleep 0.5


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "WARNING", "message": "WARNING log message from api during write operation", "labels": {"source": "api", "operation": "write"}}'

sleep 0.5


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "WARNING", "message": "WARNING log message from database during read operation", "labels": {"source": "database", "operation": "read"}}'

sleep 0.5


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "WARNING", "message": "WARNING log message from database during write operation", "labels": {"source": "database", "operation": "write"}}'

sleep 0.5


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "ERROR", "message": "ERROR log message from api during read operation", "labels": {"source": "api", "operation": "read"}}'

sleep 0.5


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "ERROR", "message": "ERROR log message from api during write operation", "labels": {"source": "api", "operation": "write"}}'

sleep 0.5


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "ERROR", "message": "ERROR log message from database during read operation", "labels": {"source": "database", "operation": "read"}}'

sleep 0.5


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "ERROR", "message": "ERROR log message from database during write operation", "labels": {"source": "database", "operation": "write"}}'

sleep 0.5


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "DEBUG", "message": "DEBUG log message from api during read operation", "labels": {"source": "api", "operation": "read"}}'

sleep 0.5


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "DEBUG", "message": "DEBUG log message from api during write operation", "labels": {"source": "api", "operation": "write"}}'

sleep 0.5


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "DEBUG", "message": "DEBUG log message from database during read operation", "labels": {"source": "database", "operation": "read"}}'

sleep 0.5


docker exec kaapi-api curl -s -X POST http://localhost:8000/plugins/advanced_logging/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "DEBUG", "message": "DEBUG log message from database during write operation", "labels": {"source": "database", "operation": "write"}}'

sleep 0.5

echo 'Done generating test logs.'
