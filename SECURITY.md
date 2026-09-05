# IndiVera security policy

## Current controls

This MVP has **zero runtime npm dependencies**, reducing supply-chain exposure and keeping core security logic inspectable.

Implemented:

- CSP, frame denial, MIME sniffing protection, referrer/permissions policies;
- no third-party scripts, fonts or trackers;
- JSON-only mutations and 256 KiB body ceiling;
- strict text/range/enum validation + Unicode normalization;
- per-IP/per-route rate limiting;
- prompt-injection detection/quarantine for evidence text;
- no dynamic code execution or dynamic HTML injection;
- generic 5xx responses without stack traces;
- write APIs fail closed outside demo mode unless `APP_API_TOKEN` is configured;
- same-origin validation for authenticated mutations;
- atomic persistence writes with restrictive local permissions;
- SHA-256 chained audit events;
- least-privilege GitHub Actions permissions.

## Naming/trust security

Because the product includes **IndiVera Verified**, the UI must explicitly distinguish platform evidence review from official certification. Never issue an “EU approved” badge or government-like seal.

## Commercial boundary

Before real supplier PII/confidential documents or paid customer data are onboarded, migrate to managed EU-region storage, implement real auth/RBAC, encrypted object storage, key rotation, backups, retention/deletion, DPA records, malware scanning, centralized rate limiting/WAF, monitoring and incident response.
