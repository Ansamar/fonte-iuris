import {getCliClient} from 'sanity/cli'

const dryRun=process.argv.includes('--dry-run')
const client=getCliClient({apiVersion:'2026-03-25'}).withConfig({dataset:'production',useCdn:false})
const ref=(n:number)=>({_type:'reference',_ref:`cic-1983-can-${n}`})

const items=[
 {id:'juris-segnatura-39298-06-cg-2007-04-28',summary:'Il repertorio ufficiale registra l’accoglimento della querela di nullità per diniego del diritto di difesa.',holdings:[{_key:'difesa',proposition:'Il diniego effettivo del diritto di difesa può determinare la nullità della pronuncia.',holdingType:'procedural',basis:'officialRepertory',relatedCanons:[ref(1598),ref(1620),ref(1626)],editorialStatus:'verified'}]},
 {id:'juris-segnatura-41767-08-cg-2009-09-05',summary:'Il repertorio ufficiale registra la concessione della restitutio in integrum per diniego del diritto di appello e la facoltà pontificia di giudicare nel merito.',holdings:[{_key:'appello',proposition:'Il diniego del diritto di appello può integrare il presupposto per la restitutio in integrum contro un provvedimento rotale.',holdingType:'procedural',basis:'officialRepertory',relatedCanons:[ref(1631),ref(1641),ref(1645),ref(1646)],editorialStatus:'verified'}]},
 {id:'juris-segnatura-44217-10-cg-2011-05-27',summary:'Il repertorio ufficiale distingue il diniego del diritto di difesa dalla mera moderazione del suo esercizio: solo il diniego comporta, nelle condizioni previste dal diritto, la nullità della pronuncia.',holdings:[{_key:'moderazione',proposition:'La mera moderazione dell’esercizio del diritto di difesa non equivale al suo diniego e non comporta automaticamente la nullità della pronuncia.',holdingType:'distinction',basis:'officialRepertory',relatedCanons:[ref(1620),ref(1622)],editorialStatus:'verified'}]},
 {id:'juris-segnatura-46207-12-cg-2012-05-11',summary:'Il repertorio ufficiale registra il rigetto della richiesta di nuovo esame per inosservanza del termine perentorio previsto dal can. 1644 §1.',holdings:[{_key:'termine',proposition:'La richiesta di nuovo esame deve rispettare il termine perentorio previsto dal can. 1644 §1; la sua violazione impedisce l’accoglimento della domanda.',holdingType:'procedural',basis:'officialRepertory',relatedCanons:[ref(1644)],editorialStatus:'verified'}]},
 {id:'juris-segnatura-35294-03-cg-2013-01-11',summary:'Il repertorio ufficiale registra il rigetto del ricorso e qualifica l’atto oggetto della controversia come esercizio di potestà amministrativa.',holdings:[{_key:'amministrativa',proposition:'La natura amministrativa dell’atto determina il regime di tutela applicabile e lo distingue dall’esercizio della potestà giudiziale.',holdingType:'distinction',basis:'officialRepertory',relatedCanons:[ref(1400)],editorialStatus:'verified'}]},
 {id:'juris-segnatura-46070-11-cg-2013-06-07',summary:'Il repertorio ufficiale registra la nullità della pronuncia per diniego del diritto di difesa.',holdings:[{_key:'nullita-difesa',proposition:'La pronuncia è nulla quando alla parte sia stato effettivamente negato il diritto di difesa.',holdingType:'procedural',basis:'officialRepertory',relatedCanons:[ref(1620)],editorialStatus:'verified'}]},
 {id:'juris-segnatura-53012-17-cg-2019-02-06',summary:'Il repertorio ufficiale registra la concessione del nuovo esame della causa per mancata considerazione della comune giurisprudenza rotale.',holdings:[{_key:'rota',proposition:'Nel valutare la domanda di nuovo esame può assumere rilievo la mancata considerazione della comune giurisprudenza rotale.',holdingType:'interpretation',basis:'officialRepertory',relatedCanons:[ref(1425),ref(1644)],editorialStatus:'verified'}]},
 {id:'juris-segnatura-53594-18-cg-2019-06-06',summary:'Il repertorio ufficiale registra il rigetto della richiesta di nuovo esame perché non erano state presentate prove o argomenti nuovi e gravi.',holdings:[{_key:'prove',proposition:'Il nuovo esame richiede prove o argomenti realmente nuovi e gravi; in loro assenza la richiesta deve essere respinta.',holdingType:'evidentiary',basis:'officialRepertory',relatedCanons:[ref(1608),ref(1639),ref(1644),ref(1680)],editorialStatus:'verified'}]},
]

async function resolveRefs(value:any):Promise<any>{
 if(Array.isArray(value))return Promise.all(value.map(resolveRefs))
 if(value&&typeof value==='object'){
  if(value._type==='reference'&&typeof value._ref==='string'&&value._ref.startsWith('cic-1983-can-')){
   const canon=await client.fetch(`*[_type=='canon' && (_id==$id || canonicalId==$id)][0]{_id}`,{id:value._ref})
   if(!canon)throw new Error(`Canone inesistente: ${value._ref}`)
   return {...value,_ref:canon._id}
  }
  const out:any={};for(const [k,v] of Object.entries(value))out[k]=await resolveRefs(v);return out
 }
 return value
}

async function main(){
 const ids=items.map(x=>x.id)
 const existing=await client.fetch(`*[_type=='jurisprudentialDecision' && _id in $ids]{_id,protocolNumber}`,{ids})
 if(existing.length!==items.length)throw new Error(`Decisioni mancanti: ${existing.length}/${items.length}`)
 const enriched=[] as any[]
 for(const item of items)enriched.push(await resolveRefs(item))
 console.log(`VALIDAZIONE OK · ${items.length} decisioni da arricchire · ${dryRun?'DRY RUN':'IMPORT'}`)
 if(dryRun)return
 let tx=client.transaction()
 for(const item of enriched)tx=tx.patch(item.id,p=>p.set({officialRepertorySummary:item.summary,holdings:item.holdings,sourceResearch:{status:'juridical-verified',checkedAt:new Date().toISOString(),note:'Sintesi e proposizioni verificate sul repertorio ufficiale Decisiones selectae / Conspectus decisionum della Segnatura Apostolica.'}}))
 const result=await tx.commit({visibility:'sync'})
 const readback=await client.fetch(`*[_type=='jurisprudentialDecision' && _id in $ids]{_id,"h":count(holdings),"status":sourceResearch.status}`,{ids})
 const ok=readback.filter((x:any)=>x.h>0&&x.status==='juridical-verified').length
 if(ok!==items.length)throw new Error(`Read-back incompleto: ${ok}/${items.length}`)
 console.log(`IMPORT OK · transaction ${result.transactionId} · arricchite ${ok}/${items.length}`)
}
main().catch(e=>{console.error(e);process.exit(1)})
