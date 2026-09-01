import {getCliClient} from 'sanity/cli'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=getCliClient({apiVersion:'2026-03-25'})
const DATA=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere/history-missing/history-canonical.json')
const EXPECTED:any={237:2,242:2,265:0,1308:4,1310:2}

async function main(){
 console.log('\nDRY-RUN IMPORT HISTORY — COMPETENTIAS — CAN. 237, 242, 265, 1308, 1310 — NESSUNA SCRITTURA')
 const data=JSON.parse(await readFile(DATA,'utf8'))
 if(data.scope!=='competentias-history-missing'||data.effectiveFrom!=='2022-02-15')throw new Error('history-canonical non riconosciuta')
 let errors=0
 for(const c of data.canons){
  const n=c.canon
  const old=c.actions?.find((a:any)=>a.action==='create-historical')
  const cur=c.actions?.find((a:any)=>a.action==='migrate-current-to-2022')
  if(!old||!cur){console.log(`✖ Can. ${n}: piano incompleto`);errors++;continue}
  const existing:any=await client.fetch('*[_id==$id&&_type=="canonVersion"][0]{_id,versionId,status,language,validFrom,validUntil,"canonRef":canon._ref,"sourceRef":sourceDocument._ref}',{id:cur.fromVersionRef})
  if(!existing||existing.versionId!==cur.fromVersionId||existing.canonRef!==c.canonRef){console.log(`✖ Can. ${n}: versione sorgente inattesa`);errors++;continue}
  const inbound:any[]=await client.fetch('*[references($id)]{_id,_type,"versionRef":version._ref}',{id:existing._id})
  const bad=inbound.filter((r:any)=>r._type!=='canonSegment'||r.versionRef!==existing._id)
  if(inbound.length!==EXPECTED[n]||bad.length){console.log(`✖ Can. ${n}: inbound non sicuri (${inbound.length}; esterni=${bad.length})`);errors++;continue}
  for(const target of [old.versionDocumentId,cur.toVersionDocumentId]){
   const collision:any[]=await client.fetch('*[_type=="canonVersion"&&(_id==$id||versionId==$vid)]{_id,versionId,"canonRef":canon._ref}',{id:target,vid:target.replace(/^version-/,'')})
   if(collision.length){console.log(`✖ Can. ${n}: collisione target ${target}`);errors++}
  }
  console.log(`✔ Can. ${n}: eliminabili ${inbound.length} segmenti + ${existing._id}`)
  console.log(`  CREATE ${old.versionDocumentId} | historical | 1983-11-27→2022-02-14 | segmenti=${old.segments.length}`)
  console.log(`  CREATE ${cur.toVersionDocumentId} | current | 2022-02-15→∞ | segmenti=${cur.segments.length}`)
  console.log(`  sourceDocument preservato=${existing.sourceRef??'∅'}`)
 }
 console.log(`\nErrori: ${errors}`)
 if(errors){console.error('✖ DRY-RUN NON SUPERATO');process.exit(1)}
 console.log('✔ DRY-RUN SUPERATO — piano di migrazione pronto — nessuna scrittura eseguita')
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exit(1)})
