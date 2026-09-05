import {getCliClient} from 'sanity/cli'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

const refId=(value:any)=>value?._ref

async function main(){
 const client=getCliClient({apiVersion:'2026-03-25'}).withConfig({dataset:'production',useCdn:false})
 const input=process.argv.find((arg)=>arg.endsWith('.json'))
 const dryRun=process.argv.includes('--dry-run')
 if(!input)throw new Error('File JSON mancante')
 const docs=JSON.parse(readFileSync(resolve(process.cwd(),input),'utf8'))
 if(!Array.isArray(docs)||!docs.length)throw new Error('Il file canonico deve contenere un array non vuoto')
 const ids=new Set<string>()
 const sourceIds=new Set<string>()
 const decisionIds=new Set<string>()
 for(const [i,d] of docs.entries()){
  if(!d._id||!d._type)throw new Error(`Documento ${i+1}: _id/_type mancanti`)
  if(ids.has(d._id))throw new Error(`ID duplicato nel batch: ${d._id}`)
  ids.add(d._id)
  if(d._type==='sourceDocument'){
   if(!d.documentId||!d.title||!d.issuer||!d.officialUrl)throw new Error(`${d._id}: fonte documentale incompleta`)
   sourceIds.add(d._id)
  }else if(d._type==='jurisprudentialDecision'){
   if(!d.decisionId||!d.title||!d.tribunal||!d.decisionDate||!refId(d.sourceDocument))throw new Error(`${d._id}: decisione incompleta`)
   decisionIds.add(d._id)
  }else throw new Error(`${d._id}: tipo non ammesso nel corpus giurisprudenziale: ${d._type}`)
 }
 for(const d of docs.filter((x:any)=>x._type==='jurisprudentialDecision')){
  const source=refId(d.sourceDocument)
  if(!sourceIds.has(source)){
   const exists=await client.fetch(`defined(*[_id==$id][0]._id)`,{id:source})
   if(!exists)throw new Error(`${d._id}: fonte documentale inesistente ${source}`)
  }
  for(const r of d.relatedCanons??[]){
   const requested=refId(r)
   if(!requested)throw new Error(`${d._id}: riferimento canone non valido`)
   const canon=await client.fetch(`*[_type=='canon' && (_id==$id || canonicalId==$id)][0]{_id,canonicalId,number}`,{id:requested})
   if(!canon)throw new Error(`${d._id}: canone inesistente ${requested}`)
   r._ref=canon._id
  }
  for(const holding of d.holdings??[]){
   for(const r of holding.relatedCanons??[]){
    const requested=refId(r)
    if(!requested)throw new Error(`${d._id}: riferimento canone non valido in holding`)
    const canon=await client.fetch(`*[_type=='canon' && (_id==$id || canonicalId==$id)][0]{_id,canonicalId,number}`,{id:requested})
    if(!canon)throw new Error(`${d._id}: canone inesistente ${requested} in holding`)
    r._ref=canon._id
   }
  }
 }
 console.log(`VALIDAZIONE OK · ${sourceIds.size} fonti · ${decisionIds.size} decisioni · ${dryRun?'DRY RUN':'IMPORT'}`)
 if(dryRun)return
 let tx=client.transaction()
 for(const d of docs)tx=tx.createOrReplace(d)
 const result=await tx.commit({visibility:'sync'})
 const readback=await client.fetch(`*[_id in $ids]{_id,_type}`,{ids:[...ids]})
 if(readback.length!==docs.length)throw new Error(`Read-back incompleto: ${readback.length}/${docs.length}`)
 const decisions=readback.filter((d:any)=>d._type==='jurisprudentialDecision').length
 const sources=readback.filter((d:any)=>d._type==='sourceDocument').length
 if(decisions!==decisionIds.size||sources!==sourceIds.size)throw new Error(`Read-back tipi incoerente: ${sources} fonti, ${decisions} decisioni`)
 console.log(`IMPORT OK · transaction ${result.transactionId} · read-back ${readback.length}/${docs.length}`)
}

main().catch((error)=>{console.error(error);process.exit(1)})
