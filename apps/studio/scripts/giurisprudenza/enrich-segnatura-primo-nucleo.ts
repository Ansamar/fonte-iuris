import {getCliClient} from 'sanity/cli'

const dryRun=process.argv.includes('--dry-run')
const client=getCliClient({apiVersion:'2026-03-25'}).withConfig({dataset:'production',useCdn:false})
const canonRef=(id:string)=>({_type:'reference',_ref:id})

async function canon(id:string){const c=await client.fetch(`*[_type=='canon' && canonicalId==$id][0]{_id}`,{id});if(!c)throw new Error(`Canone inesistente: ${id}`);return canonRef(c._id)}

async function main(){
 const c1097=await canon('cic-1983-can-1097'),c1098=await canon('cic-1983-can-1098'),c1644=await canon('cic-1983-can-1644'),c1598=await canon('cic-1983-can-1598'),c1620=await canon('cic-1983-can-1620'),c1626=await canon('cic-1983-can-1626'),c1448=await canon('cic-1983-can-1448')
 const oldSource='source-segnatura-43924-01-cg-2011-02-02',oldDecision='juris-segnatura-43924-01-cg-2011-02-02'
 const newSource='source-segnatura-43924-10-cg-2011-02-02',newDecision='juris-segnatura-43924-10-cg-2011-02-02'
 const sourceOld=await client.getDocument(oldSource);const decisionOld=await client.getDocument(oldDecision)
 if(!sourceOld||!decisionOld)throw new Error('Scheda 43924 legacy non trovata')
 const patches=[
  {id:'juris-segnatura-38025-06-cg-2006-09-27',set:{officialRepertorySummary:'Il repertorio ufficiale registra la concessione della nuova proposizione della causa e rileva che la confusione tra l’argomentazione diretta a provare il dolo e quella diretta a provare l’errore del can. 1097 §2 è assimilabile a un errore di diritto.',publicationReferences:[{_key:'pub',kind:'decision',citation:'Apollinaris 83 (2010), 390–392',language:'la'},{_key:'trad',kind:'translation',citation:'Apollinaris 83 (2010), 392–394',language:'it'},{_key:'comm',kind:'commentary',citation:'C. Begus, Adnotationes, Apollinaris 83 (2010)',language:'it'}],holdings:[{_key:'h1',proposition:'La confusione, negli atti e nella decisione, tra la prova del dolo e la prova dell’errore di cui al can. 1097 §2 è assimilabile a un errore di diritto.',holdingType:'distinction',basis:'officialRepertory',relatedCanons:[c1097,c1098],editorialStatus:'verified'}],relatedCanons:[c1097,c1098,c1644],sourceResearch:{status:'juridical-verified',checkedAt:new Date().toISOString(),note:'Metadati, pubblicazioni, esito e proposizione verificati sul Conspectus decisionum ufficiale, n. 41.'}}},
  {id:'juris-segnatura-39298-06-cg-2007-04-28',set:{caseLabel:'X–Y',ponens:'Vallini',officialRepertorySummary:'Il repertorio ufficiale attesta che consta della nullità della decisione impugnata.',publicationReferences:[{_key:'pub',kind:'decision',citation:'Apollinaris 91 (2018), 12–15',language:'la'},{_key:'trad',kind:'translation',citation:'Apollinaris 91 (2018), 16–19',language:'it'},{_key:'comm',kind:'commentary',citation:'Adnotationes in Sententiam, Apollinaris 91 (2018), 21–29',language:'it'}],proceduralOutcome:'Consta della nullità della decisione',relatedCanons:[c1598,c1620,c1626],sourceResearch:{status:'juridical-verified',checkedAt:new Date().toISOString(),note:'Metadati, ponens, pubblicazioni, esito e canoni verificati sul Conspectus decisionum ufficiale, n. 43. Nessun holding analitico aggiunto oltre ciò che il repertorio supporta.'}}}
 ]
 console.log(`VALIDAZIONE OK · 2 arricchimenti · 1 correzione identificativa · ${dryRun?'DRY RUN':'IMPORT'}`)
 if(dryRun)return
 let tx=client.transaction()
 for(const p of patches)tx=tx.patch(p.id,x=>x.set(p.set))
 const correctedSource={...sourceOld,_id:newSource,documentId:'segnatura-43924-10-cg-2011-02-02',title:'Segnatura Apostolica — Decretum, prot. n. 43924/10 CG, 2 febbraio 2011',shortTitle:'STSA 43924/10 CG',officialCitation:'Prot. n. 43924/10 CG — Decretum, 02-02-2011'} as any;delete correctedSource._rev;delete correctedSource._createdAt;delete correctedSource._updatedAt
 const correctedDecision={...decisionOld,_id:newDecision,decisionId:'stsa-43924-10-cg-2011-02-02',protocolNumber:'43924/10 CG',officialCitation:'Decretum, prot. n. 43924/10 CG, 2 febbraio 2011',sourceDocument:{_type:'reference',_ref:newSource},officialRepertorySummary:'Il repertorio ufficiale registra il rigetto dell’eccezione di sospetto proposta contro il Ponens.',publicationReferences:[{_key:'pub',kind:'decision',citation:'Monitor Ecclesiasticus 129 (2014), 21–23',language:'la'},{_key:'trad',kind:'translation',citation:'Monitor Ecclesiasticus 129 (2014), 23–26',language:'en'},{_key:'comm',kind:'commentary',citation:'P. Moneta, Commento / Note – Decretum n. 43924/2010 CG, Monitor Ecclesiasticus 129 (2014), 27–30',language:'it'}],proceduralOutcome:'Eccezione respinta',relatedCanons:[c1448],sourceResearch:{status:'juridical-verified',checkedAt:new Date().toISOString(),note:'Corretto il protocollo da 43924/01 CG a 43924/10 CG; dati verificati sul Conspectus decisionum ufficiale, n. 51.'}} as any;delete correctedDecision._rev;delete correctedDecision._createdAt;delete correctedDecision._updatedAt
 tx=tx.createOrReplace(correctedSource).createOrReplace(correctedDecision).delete(oldDecision).delete(oldSource)
 const result=await tx.commit({visibility:'sync'})
 const check=await client.fetch(`{"old":count(*[_id in $old]),"new":count(*[_id in $new]),"enriched":count(*[_id in $enriched && sourceResearch.status=='juridical-verified'])}`,{old:[oldSource,oldDecision],new:[newSource,newDecision],enriched:patches.map(p=>p.id)})
 if(check.old!==0||check.new!==2||check.enriched!==2)throw new Error(`Read-back incoerente: ${JSON.stringify(check)}`)
 console.log(`IMPORT OK · transaction ${result.transactionId} · legacy ${check.old}/2 · corretti ${check.new}/2 · arricchiti ${check.enriched}/2`)
}
main().catch(e=>{console.error(e);process.exit(1)})
