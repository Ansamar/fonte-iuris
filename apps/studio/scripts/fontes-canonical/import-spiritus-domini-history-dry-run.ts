import {createClient} from '@sanity/client'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/spiritus-domini')
const DATA=join(ROOT,'history-canonical.json')
const EFFECTIVE='2021-01-11'
function deterministicId(value:string){return value.replace(/[^A-Za-z0-9_.-]/g,'-')}

async function main(){
 console.log('\nIMPORT SPIRITUS DOMINI HISTORY — DRY RUN — PRODUCTION — NESSUNA SCRITTURA')
 const data=JSON.parse(await readFile(DATA,'utf8'))
 if(data.effectiveFrom!==EFFECTIVE)throw new Error(`effectiveFrom inatteso: ${data.effectiveFrom}`)
 if(!Array.isArray(data.versions)||data.versions.length!==1)throw new Error(`Versioni storiche attese 1, trovate ${data.versions?.length??0}`)
 const cicSources:any[]=await client.fetch('*[_type=="sourceDocument"&&documentId=="cic-1983"]{_id,documentId,title}')
 if(cicSources.length!==1)throw new Error(`Fonte CIC 1983: atteso 1 documento, trovati ${cicSources.length}`)
 console.log(`✔ Fonte CIC 1983 risolta: ${cicSources[0]._id}`)
 let errors=0,createVersions=0,createSegments=0,patchCurrent=0
 for(const v of data.versions){
  const canon:any=await client.fetch('*[_id==$id&&_type=="canon"][0]{_id,number,canonicalId}',{id:v.canonRef})
  if(!canon||canon.number!==230||canon.canonicalId!=='cic-1983-can-230'){console.log('✖ Can. 230: canonRef non coerente');errors++;continue}
  const current:any=await client.fetch('*[_id==$id&&_type=="canonVersion"][0]{_id,versionId,status,language,validFrom,validUntil,previousVersion}',{id:v.currentVersionRef})
  if(!current||current.versionId!==v.currentVersionId||current.status!=='current'||current.language!=='it'){console.log('✖ Can. 230: currentVersionRef non coerente');errors++;continue}
  if(current.validUntil){console.log(`✖ Can. 230: current validUntil già valorizzato ${current.validUntil}`);errors++;continue}
  if(current.validFrom&&current.validFrom!==EFFECTIVE){console.log(`✖ Can. 230: current validFrom=${current.validFrom}, atteso ${EFFECTIVE}`);errors++;continue}
  if(current.previousVersion?._ref&&current.previousVersion._ref!==v.versionDocumentId){console.log(`✖ Can. 230: previousVersion già punta a ${current.previousVersion._ref}`);errors++;continue}
  const versionCollisions:any[]=await client.fetch('*[_type=="canonVersion"&&(_id==$docId||versionId==$versionId)]{_id,versionId}',{docId:v.versionDocumentId,versionId:v.versionId})
  if(versionCollisions.length){console.log(`✖ Can. 230: collisione canonVersion ${versionCollisions.map(x=>x._id).join(', ')}`);errors++;continue}
  const planned=(v.segments??[]).map((s:any)=>deterministicId(`segment-${v.versionId}-${s.segmentId}`))
  const collisions:any[]=planned.length?await client.fetch('*[_type=="canonSegment"&&(_id in $ids||version._ref==$versionId)]{_id}',{ids:planned,versionId:v.versionDocumentId}):[]
  if(collisions.length){console.log(`✖ Can. 230: collisioni segmenti ${collisions.map(x=>x._id).join(', ')}`);errors++;continue}
  createVersions++;createSegments+=v.segments?.length??0;patchCurrent++
  console.log(`✔ Can. 230: CREATE ${v.versionId} | ${v.validFrom}→${v.validUntil} | segmenti=${v.segments?.length??0}`)
  console.log(`  PATCH current ${current.versionId}: validFrom=${EFFECTIVE}; previousVersion=${v.versionDocumentId}`)
 }
 console.log('\nPIANO DI SCRITTURA')
 console.log(`canonVersion da creare: ${createVersions}`)
 console.log(`canonSegment da creare: ${createSegments}`)
 console.log(`canonVersion current da aggiornare: ${patchCurrent}`)
 console.log(`Errori bloccanti: ${errors}`)
 console.log('0 scritture eseguite su production.')
 if(errors){console.log('✖ DRY RUN SPIRITUS DOMINI HISTORY NON SUPERATO');process.exitCode=1}else console.log('✔ DRY RUN SPIRITUS DOMINI HISTORY SUPERATO — piano deterministico pronto')
}
main().catch(e=>{console.error('\n✖ DRY RUN SPIRITUS DOMINI HISTORY FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
