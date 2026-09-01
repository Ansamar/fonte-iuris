import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {client} from '../import-cic/client'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/mitis-iudex/history')

async function main(){
 console.log('\nMITIS IUDEX — DRY RUN TEMPORAL HISTORY')
 const d=JSON.parse(await readFile(join(ROOT,'mitis-iudex-canonical-history.json'),'utf8'))
 let creates=0,updates=0
 for(const row of d.canons){
  const canon=await client.fetch(`*[_type=="canon" && canonicalId==$id][0]{_id}`,{id:`cic-1983-can-${row.canonNumber}`})
  if(!canon)throw new Error(`Can. ${row.canonNumber}: documento canon non trovato`)
  console.log(`\nCan. ${row.canonNumber}`)
  for(const v of row.versions){
   const existing=await client.fetch(`*[_type=="canonVersion" && versionId==$id][0]{_id,versionId,language,validFrom,validUntil,status}`,{id:v.versionId})
   if(existing){updates++;console.log(`  UPDATE ${v.versionId}`)}
   else{creates++;console.log(`  CREATE ${v.versionId}`)}
   console.log(`    ${v.language} · ${v.validFrom} → ${v.validUntil??'∞'} · ${v.status}`)
  }
 }
 if(creates+updates!==42)throw new Error(`attese 42 operazioni, trovate ${creates+updates}`)
 console.log(`\n✔ 42/42 versioni risolte`)
 console.log(`✔ CREATE: ${creates} · UPDATE: ${updates}`)
 console.log('✔ DRY RUN COMPLETATO — nessuna scrittura effettuata')
}
main().catch(e=>{console.error('\n✖ DRY RUN FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
