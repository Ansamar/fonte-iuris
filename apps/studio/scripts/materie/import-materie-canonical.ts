import {getCliClient} from 'sanity/cli'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

async function main(){
 const client=getCliClient({apiVersion:'2026-03-25'}).withConfig({dataset:'production',useCdn:false})
 const input=process.argv.find((arg)=>arg.endsWith('.json'))
 const dryRun=process.argv.includes('--dry-run')
 if(!input)throw new Error('File JSON mancante')
 const file=resolve(process.cwd(),input)
 const docs=JSON.parse(readFileSync(file,'utf8'))
 if(!Array.isArray(docs)||!docs.length)throw new Error('Il file canonico deve contenere un array non vuoto')
 const ids=new Set<string>()
 for(const [i,d] of docs.entries()){
  if(!d._id||d._type!=='legalConcept'||!d.label||!d.slug?.current||!d.definition)throw new Error(`Documento ${i+1}: campi obbligatori mancanti`)
  if(ids.has(d._id))throw new Error(`ID duplicato nel batch: ${d._id}`)
  ids.add(d._id)
  if(d.broaderConcept?._ref===d._id)throw new Error(`${d._id}: broaderConcept autoreferenziale`)
 }
 console.log(`VALIDAZIONE OK · ${docs.length} materie · ${dryRun?'DRY RUN':'IMPORT'}`)
 if(dryRun)return
 let tx=client.transaction()
 for(const d of docs)tx=tx.createOrReplace(d)
 const result=await tx.commit({visibility:'sync'})
 const readback=await client.fetch(`*[_type=='legalConcept' && _id in $ids]{_id,label,slug,definition}`,{ids:[...ids]})
 if(readback.length!==docs.length)throw new Error(`Read-back incompleto: ${readback.length}/${docs.length}`)
 console.log(`IMPORT OK · transaction ${result.transactionId} · read-back ${readback.length}/${docs.length}`)
}

main().catch((error)=>{
 console.error(error)
 process.exit(1)
})
