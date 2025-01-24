

```bash
kaapi-cli/
├── kaapi_cli/
│   ├── __init__.py
│   ├── cli.py
│   └── templates/
│       ├── backend/
│       │   ├── app/
│       │   │   └── main.py      (Minimal FastAPI example)
│       │   └── requirements.txt (Basic dependencies)
│       └── frontend/
│           └── package.json     (Placeholder for Next.js - minimal example)
├── pyproject.toml
└── README.md
```


```bash
sqlite3 dev.db
INSERT INTO users (username, hashed_password) VALUES ("admin", "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"); 
```
decrypted value == password