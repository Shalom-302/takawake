

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


## RBAC typically uses:

Users: The people (or service accounts) accessing your system.
Roles: Named sets of permissions (e.g. Admin, Editor, Reader).
Permissions: Granular actions (e.g. create_item, edit_item, delete_item).
Assignments: Each user has one or more roles, and each role has certain permissions.
In a simpler setup, you might do:

Admin: Full access to create, read, update, delete any resource.
Editor: Can create/edit items in certain resources but not others.
Reader: Can only read items.



```bash
sqlite3 dev.db
-- Example: assume role_id=1 corresponds to the “Admin” role.
INSERT INTO role (id, name)
VALUES (1, "Admin");

INSERT INTO role (id, name)
VALUES (2, "Editor");

INSERT INTO user (id, username, hashed_password, role_id)
VALUES (1, "admin", "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", 1);

INSERT INTO user (id, username, hashed_password, role_id)
VALUES (2, "editor", "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", 2);

```
decrypted value == password