export function buildIndiVeraTradeResult(rfq,matches=[]){
  return {
    module:'IndiVera Trade',rfq,
    stage:matches.length?'MATCHED':'SOURCING',
    nextAction:matches.length?'Buyer reviews evidence and requests an introduction/sample.':'Broaden sourcing criteria or onboard additional verified suppliers.',
    matches,
    disclaimer:'IndiVera Trade currently orchestrates RFQs and sourcing evidence only. It does not process payments, act as customs broker, or create binding procurement contracts.'
  };
}
