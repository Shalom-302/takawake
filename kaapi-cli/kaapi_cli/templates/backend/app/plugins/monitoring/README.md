# Monitoring Plugin

This plugin provides comprehensive monitoring capabilities for your FastAPI application.

## Features

* **Prometheus Integration**: Exports metrics in Prometheus format
* **Performance Metrics**: Tracks request duration, database query time, and more
* **Health Checks**: Includes endpoints for checking system health
* **Customizable Dashboard**: Pre-configured Grafana dashboard for visualization
* **Low Overhead**: Minimal impact on application performance

## Installation

The monitoring plugin is pre-installed with Kaapi. No additional installation steps are required.

## Usage

### Prometheus Metrics

The plugin automatically collects metrics for each endpoint. Access the metrics at:

```bash
curl [http://localhost:8000/metrics](http://localhost:8000/metrics)
```

### Health Check

```bash
curl [http://localhost:8000/health](http://localhost:8000/health)
```

Response:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": "10h 30m 5s"
}
```

### Grafana Integration

1. Access Grafana at [http://localhost:3001](http://localhost:3001)
2. Log in with the default credentials (admin/admin)
3. Navigate to Dashboards > Browse
4. Select the "Application Monitoring" dashboard

### Generate Database Load

To test the monitoring dashboard with simulated database load, you need to use Docker to run the script inside the API container:

```bash
# Access the API container shell
docker exec -it kaapi-api bash

# Navigate to the monitoring plugin directory
cd app/app/plugins/monitoring

# Generate database load
python generate_db_load.py --duration 60
```

Options:

* `--db-url`: PostgreSQL database URL (default: "postgresql://postgres:postgres@localhost:5432/kaapi")
* `--duration`: Duration in seconds to generate load (default: 60)
* `--queries-per-second`: Number of queries per second to execute (default: 10)
* `--query-types`: Types of queries to execute (options: select, insert, update, delete, all)

### Generate HTTP Traffic

To test the monitoring dashboard with simulated HTTP traffic, use Docker to run the script inside the API container:

```bash
# Access the API container shell
docker exec -it kaapi-api bash

# Navigate to the monitoring plugin directory
cd app/app/plugins/monitoring

# Generate HTTP traffic
python generate_http_traffic.py --duration 60 --requests-per-second 10
```

Options:

* `--base-url`: Base URL for the API (default: "[http://localhost:8000](http://localhost:8000)")
* `--duration`: Duration in seconds to generate traffic (default: 60)
* `--requests-per-second`: Number of requests per second (default: 10)
* `--endpoints`: Comma-separated list of endpoints to target (default: all available endpoints)

### Verifying Dashboard Data

After running both scripts:

1. Open Grafana at [http://localhost:3001](http://localhost:3001)
2. Navigate to the "Application Monitoring" dashboard
3. You should see data populating various panels

## Configuration

Configure the plugin via environment variables:

```bash
PROMETHEUS_MULTIPROC_DIR=/tmp  # Required for multi-process setups
METRICS_PREFIX=app_            # Prefix for all metrics
ENABLE_DATABASE_METRICS=true   # Track database performance
ENABLE_REQUEST_METRICS=true    # Track HTTP request performance
```

## Troubleshooting

### No Data in Grafana

If you don't see data in Grafana:

* Verify Prometheus is running (`docker ps`)
* Check that metrics are being exposed (`curl [http://localhost:8000/metrics](http://localhost:8000/metrics)`)
* Ensure Prometheus is scraping your application (`curl [http://localhost:9090/targets](http://localhost:9090/targets)`)
* Check Grafana data source configuration

### Common Issues

* Missing data: Increase the frequency of metrics collection
* High cardinality warnings: Reduce the number of unique label combinations
* Performance impact: Adjust collection frequency or disable high-overhead metrics
