import { validateRfq } from './validation.mjs';
function evidenceScore(product,key){ if(key==='composition')return product.compositionEvidence?1:0;if(key==='reach')return product.reachEvidence?1:0;if(key==='certificate')return product.certificateVerified?1:0;if(key==='quality')return product.qualityEvidence?1:0;if(key==='business')return product.businessVerified?1:0;return 0; }
export function runIndiVeraMatch(rawRfq,suppliers=[],products=[]){
  const rfq=validateRfq(rawRfq);
  const results=products.filter((p)=>p.category===rfq.category).map((product)=>{
    const supplier=suppliers.find((s)=>s.id===product.supplierId);let score=55;const reasons=[];
    if(product.destination===rfq.destination||product.destination==='DE'){score+=8;reasons.push('destination fit');}
    if(!rfq.maxMoq||(product.moq&&product.moq<=rfq.maxMoq)){score+=8;reasons.push('MOQ fit');}else score-=12;
    if(!rfq.maxFobPriceEur||(product.fobPriceEur!=null&&product.fobPriceEur<=rfq.maxFobPriceEur)){score+=10;reasons.push('price fit');}else score-=15;
    if(!rfq.maxLeadTimeDays||(product.leadTimeDays!=null&&product.leadTimeDays<=rfq.maxLeadTimeDays)){score+=6;reasons.push('lead-time fit');}else score-=8;
    const hits=rfq.requiredEvidence.reduce((sum,key)=>sum+evidenceScore(product,key),0);score+=Math.min(12,hits*4);
    if(supplier?.businessVerified){score+=5;reasons.push('supplier identity reviewed');}
    return {supplierId:supplier?.id||product.supplierId,supplierName:supplier?.name||'Unknown supplier',productId:product.id,productName:product.name,score:Math.max(0,Math.min(100,Math.round(score))),reasons};
  }).sort((a,b)=>b.score-a.score);
  return {module:'IndiVera Match',rfq,results,disclaimer:'IndiVera Match is decision support based on declared and reviewed platform data. Buyers remain responsible for supplier due diligence and contract decisions.'};
}
