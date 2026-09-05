export const SOURCES = Object.freeze({
  textileLabel: {
    id: 'EU-TEXTILE-LABEL',
    authority: 'European Union — Your Europe',
    title: 'Textile Label',
    url: 'https://europa.eu/youreurope/business/product-rules-compliance/textiles-and-footwear/textile-label/index_en.htm',
    checked: '2026-09-05',
    scope: 'mandatory'
  },
  gpsr: {
    id: 'EU-GPSR-2023-988',
    authority: 'EUR-Lex',
    title: 'Regulation (EU) 2023/988 — General Product Safety Regulation',
    url: 'https://eur-lex.europa.eu/legal-content/en/TXT/?uri=CELEX%3A32023R0988',
    checked: '2026-09-05',
    scope: 'mandatory'
  },
  reach: {
    id: 'ECHA-IMPORTER',
    authority: 'European Chemicals Agency',
    title: 'REACH — Importer responsibilities',
    url: 'https://echa.europa.eu/support/getting-started/importer',
    checked: '2026-09-05',
    scope: 'buyer-evidence'
  },
  access2Markets: {
    id: 'EC-ACCESS2MARKETS',
    authority: 'European Commission — Trade and Economic Security',
    title: 'Importing into the EU / Access2Markets',
    url: 'https://policy.trade.ec.europa.eu/help-exporters-and-importers/importing-eu_en',
    checked: '2026-09-05',
    scope: 'trade-data'
  },
  dppRegistry: {
    id: 'EC-DPP-REGISTRY',
    authority: 'European Commission — DG GROW',
    title: 'Digital Product Passport Registry',
    url: 'https://single-market-economy.ec.europa.eu/news/digital-product-passport-registry-now-live-2026-07-20_en',
    checked: '2026-09-05',
    scope: 'future-readiness'
  },
  textileDpp: {
    id: 'EC-DPP-TEXTILE',
    authority: 'European Commission — DG GROW',
    title: 'Textile apparel DPP indicative timeline',
    url: 'https://single-market-economy.ec.europa.eu/single-market/digital-product-passport/textile-apparel_en',
    checked: '2026-09-05',
    scope: 'future-readiness'
  },
  cbiDemand: {
    id: 'CBI-HDHT-DEMAND',
    authority: 'CBI / Dutch Ministry of Foreign Affairs',
    title: 'European demand for home decoration and home textiles',
    url: 'https://www.cbi.eu/market-information/home-decoration-home-textiles/what-demand',
    checked: '2026-09-05',
    scope: 'market-evidence'
  }
});

export function publicSources() {
  return Object.values(SOURCES).map(({ id, authority, title, url, checked, scope }) => ({
    id, authority, title, url, checked, scope
  }));
}
