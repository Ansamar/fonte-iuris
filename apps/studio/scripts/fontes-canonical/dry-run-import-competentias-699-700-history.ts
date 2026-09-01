import {getCliClient} from 'sanity/cli'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=getCliClient({apiVersion:'2026-03-25'})
const DATA=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere/history-699-700/history-canonical.json')

async function main(){
  console.log('\nDRY RUN IMPORT HISTORY — COMPETENTIAS CAN. 699–700 — PRODUCTION — NESSUNA SCRITTURA')
  const data=JSON.parse(await readFile(DATA,'utf8'))
  let errors=0

  for(const entry of data.canons??[]){
    console.log(`\nCan. ${entry.canon}`)
    for(const action of entry.actions??[]){
      if(action.action==='patch-existing'){
        const v:any=await client.fetch('*[_id==$id&&_type=="canonVersion"][0]{_id,versionId,status,language,validFrom,validUntil}',{id:action.versionRef})
        if(!v||v.versionId!==action.versionId){console.log(`✖ PATCH ${action.versionId}: versione non risolta`);errors++;continue}
        console.log(`✔ PATCH ${action.versionId}: ${v.validFrom??'∅'}→${v.validUntil??'∅'}  ⇒  ${action.validFrom}→${action.validUntil}`)
        continue
      }
      if(action.action==='create'){
        const collisions:any[]=await client.fetch('*[_type=="canonVersion"&&(_id==$id||versionId==$versionId)]{_id,versionId}',{id:action.versionDocumentId,versionId:action.versionId})
        if(collisions.length>1){console.log(`✖ CREATE ${action.versionId}: collisioni=${collisions.length}`);errors++;continue}
        console.log(`✔ ${collisions.length?'UPSERT':'CREATE'} ${action.versionId}: ${action.validFrom}→${action.validUntil??'∅'} status=${action.status} language=${action.language}`)
        console.log(`  segmenti previsti=${action.segments?.length??0}`)
        continue
      }
      if(action.action==='retire-incorrect-version'){
        const v:any=await client.fetch('*[_id==$id&&_type=="canonVersion"][0]{_id,versionId,status,language,validFrom,validUntil}',{id:action.versionRef})
        if(!v||v.versionId!==action.versionId){console.log(`✖ RETIRE ${action.versionId}: versione non risolta`);errors++;continue}
        const inbound:number=await client.fetch('count(*[references($id)])',{id:v._id})
        console.log(`✔ RETIRE ${action.versionId}: status=${v.status} valid=${v.validFrom??'∅'}→${v.validUntil??'∅'} references-inbound=${inbound}`)
        console.log(`  motivo: ${action.reason}`)
        continue
      }
      if(action.action==='keep-existing-current'){
        const v:any=await client.fetch('*[_id==$id&&_type=="canonVersion"][0]{_id,versionId,status,language,validFrom,validUntil}',{id:action.versionRef})
        if(!v||v.versionId!==action.versionId){console.log(`✖ KEEP ${action.versionId}: versione non risolta`);errors++;continue}
        if(v.status!=='current'||v.language!==action.language||v.validFrom!==action.validFrom||v.validUntil){console.log(`✖ KEEP ${action.versionId}: stato/intervallo production non conforme`);errors++;continue}
        console.log(`✔ KEEP ${action.versionId}: current ${v.language} dal ${v.validFrom}`)
        continue
      }
      console.log(`✖ azione sconosciuta: ${action.action}`);errors++
    }
  }

  const c699:any=await client.fetch('*[_type=="canon"&&number==699][0]{_id}')
  const c700:any=await client.fetch('*[_type=="canon"&&number==700][0]{_id}')
  for(const [n,c] of [[699,c699],[700,c700]] as any[]){
    const versions:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id]{versionId,status,language,validFrom,validUntil}|order(validFrom asc)',{id:c?._id})
    console.log(`\nProduction attuale Can. ${n}:`)
    for(const v of versions)console.log(`  - ${v.versionId} | ${v.status} | ${v.language} | ${v.validFrom??'∅'}→${v.validUntil??'∅'}`)
  }

  console.log(`\nErrori bloccanti: ${errors}`)
  console.log('0 scritture eseguite su production.')
  if(errors){console.log('✖ DRY RUN HISTORY 699–700 NON SUPERATO');process.exitCode=1}
  else console.log('✔ DRY RUN HISTORY 699–700 SUPERATO — piano di mutazione coerente')
}

main().catch(e=>{console.error('\n✖ DRY RUN HISTORY 699–700 FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
