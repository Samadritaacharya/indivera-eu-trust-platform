const MAX_TEXT = 4000;
const MAX_DOC_TEXT = 25000;
const ISO_COUNTRIES = new Set(['DE', 'AT', 'NL', 'FR', 'BE', 'IT', 'ES', 'SE', 'DK', 'FI', 'IE', 'PL', 'CZ']);
const CHANNELS = new Set(['B2B', 'B2C']);
const CATEGORIES = new Set(['table-linen', 'bed-linen', 'cushion-cover', 'fabric', 'bag', 'apparel', 'other-textile']);

export class ValidationError extends Error {
  constructor(message, field = 'request') {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.status = 400;
  }
}

export function cleanText(value, field, max = MAX_TEXT, required = false) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new ValidationError(`${field} is required`, field);
    return '';
  }
  if (typeof value !== 'string') throw new ValidationError(`${field} must be text`, field);
  const normalized = value.normalize('NFKC').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  if (normalized.length > max) throw new ValidationError(`${field} exceeds ${max} characters`, field);
  return normalized;
}

export function numberInRange(value, field, min, max, required = false) {
  if ((value === undefined || value === null || value === '') && !required) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw new ValidationError(`${field} must be between ${min} and ${max}`, field);
  return n;
}

export function validateProduct(input = {}) {
  const destination = cleanText(input.destination || 'DE', 'destination', 2, true).toUpperCase();
  if (!ISO_COUNTRIES.has(destination)) throw new ValidationError('destination is not supported in this beta', 'destination');
  const channel = cleanText(input.channel || 'B2B', 'channel', 3, true).toUpperCase();
  if (!CHANNELS.has(channel)) throw new ValidationError('channel must be B2B or B2C', 'channel');
  const category = cleanText(input.category || 'other-textile', 'category', 40, true);
  if (!CATEGORIES.has(category)) throw new ValidationError('unsupported category', 'category');
  const composition = Array.isArray(input.composition)
    ? input.composition.slice(0, 8).map((part, index) => ({
        fibre: cleanText(part?.fibre, `composition[${index}].fibre`, 80, true),
        percentage: numberInRange(part?.percentage, `composition[${index}].percentage`, 0, 100, true)
      }))
    : [];

  return {
    id: cleanText(input.id || '', 'id', 80),
    name: cleanText(input.name, 'name', 160, true),
    category,
    destination,
    channel,
    originCountry: cleanText(input.originCountry || 'IN', 'originCountry', 2, true).toUpperCase(),
    manufacturerName: cleanText(input.manufacturerName, 'manufacturerName', 180),
    manufacturerPostalAddress: cleanText(input.manufacturerPostalAddress, 'manufacturerPostalAddress', 300),
    manufacturerEmail: cleanText(input.manufacturerEmail, 'manufacturerEmail', 180),
    euResponsiblePersonName: cleanText(input.euResponsiblePersonName, 'euResponsiblePersonName', 180),
    euResponsiblePersonPostalAddress: cleanText(input.euResponsiblePersonPostalAddress, 'euResponsiblePersonPostalAddress', 300),
    euResponsiblePersonEmail: cleanText(input.euResponsiblePersonEmail, 'euResponsiblePersonEmail', 180),
    productIdentifier: cleanText(input.productIdentifier, 'productIdentifier', 120),
    safetyInformation: cleanText(input.safetyInformation, 'safetyInformation', 1200),
    composition,
    compositionEvidence: Boolean(input.compositionEvidence),
    reachEvidence: Boolean(input.reachEvidence),
    certificateEvidence: Boolean(input.certificateEvidence),
    packagingSpecification: Boolean(input.packagingSpecification),
    productionBatch: cleanText(input.productionBatch, 'productionBatch', 120),
    productionCapacityMonthly: numberInRange(input.productionCapacityMonthly, 'productionCapacityMonthly', 0, 100000000),
    moq: numberInRange(input.moq, 'moq', 1, 10000000),
    fobPriceEur: numberInRange(input.fobPriceEur, 'fobPriceEur', 0, 1000000),
    leadTimeDays: numberInRange(input.leadTimeDays, 'leadTimeDays', 0, 1000),
    businessVerified: Boolean(input.businessVerified),
    certificateVerified: Boolean(input.certificateVerified),
    qualityEvidence: Boolean(input.qualityEvidence)
  };
}

export function validateDocument(input = {}) {
  return {
    title: cleanText(input.title, 'title', 180, true),
    text: cleanText(input.text, 'text', MAX_DOC_TEXT, true),
    type: cleanText(input.type || 'other', 'type', 60),
    expiresOn: cleanText(input.expiresOn || '', 'expiresOn', 20)
  };
}

export function validateRfq(input = {}) {
  return {
    title: cleanText(input.title, 'title', 180, true),
    destination: cleanText(input.destination || 'DE', 'destination', 2, true).toUpperCase(),
    category: cleanText(input.category || 'table-linen', 'category', 40, true),
    quantity: numberInRange(input.quantity, 'quantity', 1, 10000000, true),
    maxFobPriceEur: numberInRange(input.maxFobPriceEur, 'maxFobPriceEur', 0, 1000000),
    maxMoq: numberInRange(input.maxMoq, 'maxMoq', 1, 10000000),
    maxLeadTimeDays: numberInRange(input.maxLeadTimeDays, 'maxLeadTimeDays', 1, 1000),
    requiredEvidence: Array.isArray(input.requiredEvidence) ? input.requiredEvidence.slice(0, 12).map((x, i) => cleanText(x, `requiredEvidence[${i}]`, 80)) : []
  };
}

export function validateSupplier(input = {}) {
  return {
    id: cleanText(input.id || '', 'id', 80),
    name: cleanText(input.name, 'name', 180, true),
    city: cleanText(input.city, 'city', 120),
    region: cleanText(input.region, 'region', 120),
    country: cleanText(input.country || 'IN', 'country', 2, true).toUpperCase(),
    website: cleanText(input.website, 'website', 300),
    businessVerified: Boolean(input.businessVerified),
    capabilities: Array.isArray(input.capabilities) ? input.capabilities.slice(0, 20).map((x, i) => cleanText(x, `capabilities[${i}]`, 80)) : []
  };
}

export function documentContainsPromptInjection(text) {
  const patterns = [
    /ignore\s+(all|any|the)\s+(previous|prior|system)\s+instructions/i,
    /reveal\s+(the\s+)?(system|developer)\s+prompt/i,
    /act\s+as\s+(an?\s+)?(admin|system|developer)/i,
    /exfiltrat(e|ion)|steal\s+(secrets?|tokens?|keys?)/i,
    /<script\b|javascript:/i
  ];
  return patterns.some((pattern) => pattern.test(String(text || '')));
}
