# Test strategy

This repository uses layered, isolated tests. CI must never connect to the production Cloudflare D1 database or use production secrets.

## Run locally

```bash
cd tests
npm install --no-audit --no-fund --ignore-scripts
cd ..
python tests/schema.test.py
node tests/static.test.mjs
node tests/behavior.test.mjs
node tests/crypto.test.mjs
node tests/csv.test.mjs
```

## CI quality gates

`.github/workflows/tests.yml` runs on pull requests to `main`, pushes to `main` and feature/CI branches, a weekly schedule, and manual dispatch. It tests Node.js 20 and 22 and includes:

- JavaScript syntax checks
- Canonical SQLite schema/idempotency and constraint regression tests
- Static repository/API-path/security-pattern checks
- API authentication, authorization and per-user isolation tests
- AES-GCM encryption/decryption, IV uniqueness, wrong-password and tamper tests
- CSV formula-injection regression tests
- npm dependency vulnerability audit (high severity and above)
- CodeQL analysis for JavaScript/TypeScript and Python

A green CI run is evidence that these automated checks passed, not proof that the whole application is secure. Browser/device smoke tests, WebAuthn/passkey flows, recovery email delivery, Cloudflare D1 migrations and production deployment must be validated separately in a staging environment. Never put real contact data, recovery secrets, API tokens, or production credentials in tests or logs.
