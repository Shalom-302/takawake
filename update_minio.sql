UPDATE file_storage_providers SET config = config || '{"public_endpoint_url": "http://localhost:9000"}' WHERE provider_type = 'minio' AND is_default = true;
