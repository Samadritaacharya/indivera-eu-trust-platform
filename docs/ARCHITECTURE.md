# IndiVera architecture

```text
Browser
  │
  ├── IndiVera Ready ───── deterministic rule engine ── official-source registry
  │
  ├── IndiVera Verified ── evidence extraction ─────── verification score
  │                              │
  │                              └── prompt-injection quarantine
  │
  ├── IndiVera Match ───── RFQ constraints + explainable ranking
  │
  ├── IndiVera Passport ── structured traceability record
  │
  └── IndiVera Trade ───── RFQ persistence + matching + audit
                                 │
                                 └── SHA-256 tamper-evident chain
```

## Trust boundaries

1. Browser input is untrusted.
2. Supplier document text is additionally treated as prompt-adversarial.
3. Deterministic rules are the authoritative software layer for readiness findings.
4. AI output is advisory text/structured extraction only.
5. A platform verification score is not a legal conformity assessment.
6. The pilot JSON store is a controlled-demo boundary, not a commercial multi-tenant database.

## Deployment evolution

The standalone project can run as a Node service with static assets. A commercial version should split frontend/API, use EU-region managed SQL/object storage, add real auth/RBAC, centralized audit/observability and provider-specific document/AI controls.
