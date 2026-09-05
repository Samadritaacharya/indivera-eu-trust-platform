# Regulatory model and source discipline

This project is a decision-support prototype, not a legal certification service.

The initial Germany-first textile model uses official or government-backed sources for rules and market context:

- EU textile fibre labelling: Your Europe / Regulation (EU) 1007/2011.
- General Product Safety Regulation: Regulation (EU) 2023/988, including distance-sale information and EU responsible-person requirements where applicable.
- REACH importer context: European Chemicals Agency.
- Import/tariff/product-requirement lookup: European Commission Access2Markets.
- Digital Product Passport: European Commission DPP Registry and textile-apparel timeline.
- Market context: CBI (Dutch Ministry of Foreign Affairs) home-decoration/home-textile demand research.

Each source in code includes a `checked` date. Rules must be reviewed before that date becomes stale or when legislation changes.

## Important distinctions

- **Mandatory**: directly grounded in a binding/current requirement relevant to the modeled context.
- **Buyer evidence**: information likely to be needed by an importer/buyer to conduct its own compliance review; not itself a platform certification.
- **Platform evidence**: identity/quality checks performed by the platform or its partners.
- **Future readiness**: data collected in preparation for rules still being developed. Textile DPP details remain under development; the platform must not claim final textile-DPP compliance prematurely.
