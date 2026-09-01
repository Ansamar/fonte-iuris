import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {getCliClient} from 'sanity/cli'
import {client as readClient} from '../import-cic/client'
import {canonicalTextToPortableText,normalizeCanonicalText} from '../import-cic/portableText'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/mitis-iudex/history')
const commitMode=process.argv.includes('--commit')
const client=commitMode?getCliClient({apiVersion:'2026-03-25'}):readClient
const id=(s:string)=>s.replace(/[^A-Za-z0-9_.-]/g,'-')

async function main(){
 console.log(`\nMITIS IUDEX — ${commitMode?'IMPORT':'DRY RUN'} TEMPORAL HISTORY`)
 const d=JSON.parse(await readFile(join(ROOT,'mitis-iudex-canonical-history.json'),'utf8'))
 let creates=0,updates=0
 for(const row of d.canons){
  const canon=await client.fetch(`*[_type=="canon" && canonicalId==$id][0]{_id}`,{id:`cic-1983-can-${row.canonNumber}`})
  if(!canon)throw new Error(`Can. ${row.canonNumber}: documento canon non trovato`)
  console.log(`\nCan. ${row.canonNumber}`)
  for(const v of row.versions){
   const existing=await client.fetch(`*[_type=="canonVersion" && versionId==$id][0]{_id}`,{id:v.versionId})
   const documentId=existing?._id??id(`version-${v.versionId}`)
   const fields={canon:{_type:'reference',_ref:canon._id},versionId:v.versionId,versionLabel:v.versionLabel,status:v.status,validFrom:v.validFrom,validUntil:v.validUntil??undefined,language:v.language,fullText:canonicalTextToPortableText(normalizeCanonicalText(v.fullText))}
   if(existing){updates++;console.log(`  UPDATE ${v.versionId}`)}else{creates++;console.log(`  CREATE ${v.versionId}`)}
   console.log(`    ${v.language} · ${v.validFrom} → ${v.validUntil??'∞'} · ${v.status}`)
   if(commitMode){
    let tx=client.transaction()
    if(!existing)tx=tx.createIfNotExists({_id:documentId,_type:'canonVersion',...fields})
    tx=tx.patch(documentId,{set:fields,unset:v.validUntil==null?['validUntil']:[]})
    await tx.commit({autoGenerateArrayKeys:true})
   }
  }
 }
 if(creates+updates!==42)throw new Error(`attese 42 operazioni, trovate ${creates+updates}`)
 console.log(`\n✔ 42/42 versioni risolte`)
 console.log(`✔ CREATE: ${creates} · UPDATE: ${updates}`)
 console.log(commitMode?'✔ IMPORT COMPLETATO':'✔ DRY RUN COMPLETATO — nessuna scrittura effettuata')
}
main().catch(e=>{console.error(`\n✖ ${commitMode?'IMPORT':'DRY RUN'} FALLITO`);console.error(e instanceof Error?e.message:e);process.exit(1)})
