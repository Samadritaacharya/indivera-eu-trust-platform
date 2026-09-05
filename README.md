# IndiVera

**Indian supply. European confidence.**

IndiVera is an evidence-first India→Europe trust platform for textile and lifestyle SMEs. It helps Indian suppliers understand what stands between a product and a European buyer, while giving buyers structured supplier evidence instead of unverified marketplace claims.

> **IndiVera Ready — Evidence before export.**

## Product architecture

| Module | Purpose | Current beta capability |
|---|---|---|
| **IndiVera Ready** | Market readiness & compliance gaps | deterministic source-linked checks, evidence gaps, market signal |
| **IndiVera Verified** | Supplier/evidence verification | supplier evidence score, safe document extraction, review semantics |
| **IndiVera Match** | Buyer ↔ supplier matching | explainable RFQ ranking across price, MOQ, lead time and evidence |
| **IndiVera Passport** | Product traceability | structured origin/manufacturer/batch/evidence record |
| **IndiVera Trade** | RFQ + procurement workflow | create/store RFQs, match candidates, audit workflow |

The platform **does not** claim that a supplier or product is “EU certified,” legally compliant, customs-approved or guaranteed safe. `IndiVera Verified` is a platform evidence-review status, not a conformity assessment.

## Why this exists

A capable Indian manufacturer may know its product, MOQ and price but still face fragmented European requirements across product data, textile labelling, GPSR, REACH evidence, buyer expectations and traceability. European buyers face the inverse problem: they can find suppliers, but assessing readiness and evidence is expensive.

IndiVera turns that friction into a workflow:

```text
Supplier declaration
        ↓
IndiVera Ready
        ↓
Evidence gaps + source-linked rules
        ↓
IndiVera Verified
        ↓
Supplier evidence profile
        ↓
IndiVera Match
        ↓
Buyer RFQ fit
        ↓
IndiVera Passport
        ↓
Traceability record
        ↓
IndiVera Trade
        ↓
RFQ / review / introduction workflow
```

## Security and AI design

- zero runtime npm dependencies;
- strict CSP and browser security headers;
- JSON-only API writes with a 256 KiB request ceiling;
- strict input validation and Unicode normalization;
- route/IP rate limiting;
- prompt-injection quarantine for supplier documents;
- no dynamic `eval`, `new Function` or dynamic `innerHTML` assignment;
- protected production writes with bearer token + same-origin validation;
- atomic JSON writes for the controlled pilot store;
- tamper-evident SHA-256 audit chain;
- rules-before-model AI architecture;
- source IDs attached to regulatory findings;
- supplier claims, uploaded evidence and reviewed evidence are kept semantically distinct.

Read [`SECURITY.md`](SECURITY.md), [`AI_GOVERNANCE.md`](AI_GOVERNANCE.md), and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Run locally

Requirements: Node.js 22+

```bash
npm start
```

Open `http://127.0.0.1:8787`.

Run all checks:

```bash
npm run check
```

No `npm install` is required because the MVP deliberately has no runtime dependencies.

## API

```text
GET  /api/indivera/health
GET  /api/indivera/sources
GET  /api/indivera/ready/rules
POST /api/indivera/ready/analyze
GET  /api/indivera/ready/products
POST /api/indivera/ready/products
GET  /api/indivera/verified/suppliers
POST /api/indivera/verified/suppliers
POST /api/indivera/verified/documents/extract
POST /api/indivera/match
GET  /api/indivera/passport/:productId
GET  /api/indivera/trade/rfqs
POST /api/indivera/trade/rfqs
GET  /api/indivera/audit
```

## Production boundary

This repository is a production-oriented **portfolio/pilot MVP**, not yet a multi-tenant commercial marketplace. Before onboarding real confidential supplier evidence, add managed EU-region persistence, identity/RBAC, encrypted object storage, retention/deletion controls, certificate authority integrations, monitoring, WAF/distributed rate limiting, backups and an incident-response process.

## Brand

**Corporate brand:** IndiVera  
**Tagline:** *Indian supply. European confidence.*  
**Ready tagline:** *Evidence before export.*

The visual language deliberately avoids stereotypical India-marketplace imagery. Identity is expressed through product provenance, maker stories and material evidence rather than flags, monuments or decorative clichés.

## License

MIT for the source code. Regulatory content and external source material remain subject to their respective owners/authorities.
