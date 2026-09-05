export function buildIndiVeraPassport(product){
  return {
    module:'IndiVera Passport',
    passport:{
      productId:product.productIdentifier||product.id,productName:product.name,manufacturer:product.manufacturerName,originCountry:product.originCountry,
      composition:product.composition,productionBatch:product.productionBatch||null,
      evidence:{composition:product.compositionEvidence,reach:product.reachEvidence,certificate:product.certificateVerified,quality:product.qualityEvidence},
      status:'IndiVera Product Traceability Record — not a legal certification or final textile Digital Product Passport.'
    }
  };
}
