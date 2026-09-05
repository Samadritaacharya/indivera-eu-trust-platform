function pct(hit,total){ return total?Math.round(hit/total*100):0; }

export function assessIndiVeraVerified(supplier, products=[]){
  const owned=products.filter((p)=>p.supplierId===supplier.id);
  const dimensions={
    identity:supplier.businessVerified?100:35,
    productData:pct(owned.filter((p)=>p.productIdentifier&&p.manufacturerName&&p.composition?.length).length,owned.length),
    certification:pct(owned.filter((p)=>p.certificateVerified).length,owned.length),
    quality:pct(owned.filter((p)=>p.qualityEvidence).length,owned.length),
    euEvidence:pct(owned.filter((p)=>p.compositionEvidence&&p.packagingSpecification).length,owned.length)
  };
  const score=Math.round(dimensions.identity*.30+dimensions.productData*.20+dimensions.certification*.15+dimensions.quality*.20+dimensions.euEvidence*.15);
  const level=score>=85?'evidence-strong':score>=60?'review-in-progress':'evidence-light';
  return {
    module:'IndiVera Verified',supplierId:supplier.id,supplierName:supplier.name,score,level,dimensions,productsReviewed:owned.length,
    meaning:'IndiVera Verified is an evidence-review status inside the platform. It is not EU certification, conformity assessment, customs approval or a legal guarantee.'
  };
}
