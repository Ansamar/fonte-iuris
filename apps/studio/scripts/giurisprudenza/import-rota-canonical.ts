import {getCliClient} from 'sanity/cli'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

const refId=(v:any)=>v?._ref
const robust=new Set(['fullTextOfficial','fullTextSecondaryVerified','substantialExtractsVerified'])

async function main(){
 const client=getCliClient({apiVersion:'2026-03-25'}).withConfig({dataset:'production',useCdn:false})
 const input=process.argv.find(a=>a.endsWith('.json'))
 const dryRun=process.argv.includes('--dry-run')
 if(!input)throw new Error('File JSON mancante')
 const docs=JSON.parse(readFileSync(resolve(process.cwd(),input),'utf8'))
 if(!Array.isArray(docs)||!docs.length)throw new Error('Batch Rota vuoto')
 const ids=new Set<string>(),sourceIds=new Set<string>(),decisionIds=new Set<string>()
 for(const [i,d] of docs.entries()){
  if(!d._id||!d._type)throw new Error(`Documento ${i+1}: _id/_type mancanti`)
  if(ids.has(d._id))throw new Error(`ID duplicato: ${d._id}`);ids.add(d._id)
  if(d._type==='sourceDocument'){
   if(!d.documentId||!d.title||!d.issuer||!d.officialUrl)throw new Error(`${d._id}: fonte incompleta`)
   sourceIds.add(d._id);continue
  }
  if(d._type!=='jurisprudentialDecision')throw new Error(`${d._id}: tipo non ammesso`)
  decisionIds.add(d._id)
  if(d.tribunalLevel!=='romanRota')throw new Error(`${d._id}: tribunalLevel deve essere romanRota`)
  if(!d.decisionId||!d.title||!d.decisionDate||!d.ponens||!refId(d.sourceDocument))throw new Error(`${d._id}: identità rotale incompleta`)
  if(!d.documentaryLevel)throw new Error(`${d._id}: documentaryLevel mancante`)
  if(!d.rotalPublication?.volume||!d.rotalPublication?.year)throw new Error(`${d._id}: collocazione RRDec incompleta`)
  if(!Array.isArray(d.rotalGrounds)||!d.rotalGrounds.length)throw new Error(`${d._id}: nessun caput strutturato`)
  if(robust.has(d.documentaryLevel)){
   if(!d.proceduralOutcome)throw new Error(`${d._id}: livello ${d.documentaryLevel} richiede esito verificato`)
   if(!d.rotalGrounds.every((g:any)=>g.canon&&g.label))throw new Error(`${d._id}: capita incompleti`)
  }
  for(const h of d.holdings??[]){if(h.editorialStatus==='verified'&&!h.basis)throw new Error(`${d._id}: holding verificato senza basis`)}
 }
 for(const d of docs.filter((x:any)=>x._type==='jurisprudentialDecision')){
  const source=refId(d.sourceDocument)
  if(!sourceIds.has(source)&&!(await client.fetch(`defined(*[_id==$id][0]._id)`,{id:source})))throw new Error(`${d._id}: fonte inesistente ${source}`)
  const refs=[...(d.relatedCanons??[]),...(d.holdings??[]).flatMap((h:any)=>h.relatedCanons??[])]
  for(const r of refs){const requested=refId(r);if(!requested)throw new Error(`${d._id}: riferimento canone invalido`);const canon=await client.fetch(`*[_type=='canon' && (_id==$id || canonicalId==$id)][0]{_id}`,{id:requested});if(!canon)throw new Error(`${d._id}: canone inesistente ${requested}`);r._ref=canon._id}
 }
 console.log(`VALIDAZIONE ROTA OK · ${sourceIds.size} fonti · ${decisionIds.size} decisioni · ${dryRun?'DRY RUN':'IMPORT'}`)
 if(dryRun)return
 let tx=client.transaction();for(const d of docs)tx=tx.createOrReplace(d);const result=await tx.commit({visibility:'sync'})
 const rb=await client.fetch(`*[_id in $ids]{_id}`,{ids:[...ids]});if(rb.length!==docs.length)throw new Error(`Read-back incompleto ${rb.length}/${docs.length}`)
 console.log(`IMPORT ROTA OK · transaction ${result.transactionId} · read-back ${rb.length}/${docs.length}`)
}
main().catch(e=>{console.error(e);process.exit(1)})
