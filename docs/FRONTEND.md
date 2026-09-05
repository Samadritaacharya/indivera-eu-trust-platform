# IndiVera immersive frontend

IndiVera keeps the product application dependency-free while adding a high-motion brand and product experience on top of the existing functional UI.

## Architecture

- `styles-core.css` — original functional application styles.
- `immersive-base.css` — brand, layout, depth, glass surfaces and responsive enhancement.
- `immersive-motion.css` — progressive motion and reduced-motion overrides.
- `app-core.js` — original functional Ready / Verified / Match / Passport / Trade application logic.
- `immersive.js` — scroll progress, Canvas ambient network, story layer, navigation state, pointer interactions and motion controls.
- `app.js` — tiny loader that keeps product logic and presentation enhancement separated.

The result is fully owned source code with no animation SaaS, external runtime scripts, UI kits, hosted fonts or paid visual dependencies.

## Accessibility

The runtime honors `prefers-reduced-motion`, adds an explicit Motion/Still control, disables tilt/magnetic interactions on coarse pointers, and leaves normal anchor navigation as the fallback when motion APIs are unavailable.

## Security

The immersive layer does not render API data as HTML strings. Existing API-rendered data continues to use DOM node creation and `textContent`, preserving the repository's CSP-compatible evidence-first model.
