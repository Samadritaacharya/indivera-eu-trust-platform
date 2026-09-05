import { documentContainsPromptInjection, validateDocument } from './validation.mjs';

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const CERTIFICATE = /(?:certificate|cert(?:ificate)?\s*(?:no\.?|number)?)[\s:#-]*([A-Z0-9][A-Z0-9/_-]{4,})/i;
const DATE = /\b(20\d{2}[-/.](?:0?[1-9]|1[0-2])[-/.](?:0?[1-9]|[12]\d|3[01])|(?:0?[1-9]|[12]\d|3[01])[-/.](?:0?[1-9]|1[0-2])[-/.]20\d{2})\b/;
const MATERIAL = /\b(cotton|organic cotton|linen|silk|wool|polyester|viscose|rayon|jute|hemp)\b/i;

export function extractIndiVeraEvidence(raw) {
  const doc = validateDocument(raw);
  const injectionDetected = documentContainsPromptInjection(doc.text);
  const normalized = doc.text.replace(/\s+/g, ' ');
  const email = normalized.match(EMAIL)?.[0] || null;
  const certificateNumber = normalized.match(CERTIFICATE)?.[1] || null;
  const date = normalized.match(DATE)?.[1] || doc.expiresOn || null;
  const material = normalized.match(MATERIAL)?.[1] || null;
  const claims100 = /\b100\s*%\s*(cotton|linen|silk|wool|polyester|viscose|rayon|jute|hemp)\b/i.exec(normalized);

  return {
    title: doc.title,
    type: doc.type,
    status: injectionDetected ? 'quarantined' : 'processed',
    promptInjectionDetected: injectionDetected,
    extracted: injectionDetected ? {} : {
      email,
      certificateNumber,
      date,
      material,
      compositionClaim: claims100 ? `100% ${claims100[1]}` : null
    },
    warnings: [
      ...(injectionDetected ? ['Potential prompt-injection content detected. Document was not passed to any AI model.'] : []),
      'Extracted values are unverified claims until supported by an authoritative document review or independent verification.'
    ]
  };
}
