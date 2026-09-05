# IndiVera AI governance

IndiVera uses a **rules-before-model** architecture. Regulatory/readiness findings are produced by deterministic, versioned logic mapped to named sources. AI is optional and bounded to extraction, normalization, translation and plain-language explanation.

## Module boundary

- **IndiVera Ready** owns deterministic readiness findings.
- **IndiVera Verified** may extract claims/evidence from supplier documents, but extraction never equals verification.
- **IndiVera Match** ranks declared/reviewed structured data and explains its reasons.
- **IndiVera Passport** renders structured traceability data; it does not invent missing provenance.
- **IndiVera Trade** orchestrates RFQ state; it cannot autonomously create binding contracts or submit regulatory filings.

## Prohibited AI authority

AI must never:

- mark a product legally compliant;
- claim EU certification or government approval;
- override a deterministic blocker;
- convert supplier self-attestation into independently reviewed evidence;
- guess customs classification/tariff as a legal conclusion;
- silently infer missing safety/certification facts;
- expose system/developer prompts, credentials or private supplier evidence.

## Untrusted documents

Uploaded supplier content is data, never instructions. Prompt-injection patterns trigger quarantine before any future model handoff. Production document AI must add malware scanning, MIME validation, sandboxing and explicit model-provider/data-location controls.

## Human review triggers

Human review is required for certificate authenticity disputes, safety incidents, customs/tariff disputes, evidence overrides and any output that could create legal/conformity-assessment liability.
