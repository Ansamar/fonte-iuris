import {getCliClient} from 'sanity/cli'

const client=getCliClient({apiVersion:'2026-03-25'})
const TARGETS=[237,242,265,1308,1310]
const EXPECTED:any={237:2,242:2,265:0,1308:4,1310:2}

async function main(){
 console.log('\nAUDIT STRICT INBOUND — COMPETENTIAS MISSING HISTORY — PRODUCTION — SOLA LETTURA')
 let errors=0
 for(const n of TARGETS){
  const versionId=`cic-1983-can-${n}-it-current`
  const v:any=await client.fetch('*[_type=="canonVersion"&&versionId==$versionId][0]{_id,versionId,"canon":canon->number}',{versionId})
  if(!v){console.log(`✖ Can. ${n}: ${versionId} assente`);errors++;continue}
  const refs:any[]=await client.fetch('*[references($id)]{_id,_type,segmentId,"versionRef":version._ref,"canonRef":canon._ref}',{id:v._id})
  console.log(`\nCan. ${n} — ${v.versionId} — inbound=${refs.length}`)
  const bad=refs.filter(r=>r._type!=='canonSegment'||r.versionRef!==v._id)
  for(const r of refs)console.log(`- ${r._type} | ${r._id}${r.segmentId?` | ${r.segmentId}`:''}`)
  if(refs.length!==EXPECTED[n]){console.log(`✖ Can. ${n}: inbound=${refs.length}, attesi ${EXPECTED[n]}`);errors++}
  if(bad.length){console.log(`✖ Can. ${n}: ${bad.length} riferimenti esterni/non eliminabili automaticamente`);errors++}
  else console.log(`✔ Can. ${n}: tutti i riferimenti entranti sono canonSegment propri`)
 }
 console.log(`\nErrori: ${errors}`)
 if(errors){console.error('✖ AUDIT STRICT INBOUND NON SUPERATO');process.exit(1)}
 console.log('✔ AUDIT STRICT INBOUND SUPERATO — migrazione controllata consentita — nessuna scrittura eseguita')
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exit(1)})
