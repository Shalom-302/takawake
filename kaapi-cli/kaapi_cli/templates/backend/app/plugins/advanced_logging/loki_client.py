# app/plugins/advanced_logging/loki_client.py
# A simple Loki HTTP client
import requests
import time
from typing import Dict

class LokiClient:
    def __init__(self, loki_url: str):
        """
        :param loki_url: base url for loki push, e.g. http://loki:3100
        """
        self.loki_url = loki_url.rstrip("/")

    def push_log(self, level: str, message: str, labels: Dict[str, str] = None):
        """
        Minimal example of pushing a single log line to Loki's /loki/api/v1/push
        """
        if labels is None:
            labels = {}
        # Some default labels
        labels.setdefault("job", "kaapi_advanced_logging")
        labels.setdefault("level", level)

        # Loki expects a timeseries payload with entries
        # https://grafana.com/docs/loki/latest/api/#post-lokiapiv1push
        timestamp_ns = int(time.time() * 1e9)

        streams = [
            {
                "stream": labels,
                "values": [
                    [
                        str(timestamp_ns),
                        message
                    ]
                ]
            }
        ]
        payload = {"streams": streams}

        url = f"{self.loki_url}/loki/api/v1/push"
        try:
            resp = requests.post(url, json=payload, timeout=5)
            resp.raise_for_status()
        except requests.RequestException as e:
            print(f"Error pushing log to Loki: {e}")