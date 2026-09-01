import {createClient} from '@sanity/client'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere')
const DATA=join(ROOT,'canonical.json')
const SOURCE_ID='source-francis-2022-competentias-quasdam-decernere'
const EFFECTIVE='2022-02-15'
const norm=(v:any)=>String(v??'').replace(/\s/g,'').toLowerCase()
const slug=(v:string)=>v.replace(/[^A-Za-z0-9_.-]/g,'-')
function relId(e:any){return `francis-2022-competentias-art-${e.article}-can-${e.canon}${e.locator?`-${slug(norm(e.locator).replace('§','par-'))}`:''}`}
function active(v:any){return Boolean(v?.validFrom&&v.validFrom<=EFFECTIVE&&(!v.validUntil||v.validUntil>=EFFECTIVE))}

async function resolveTarget(e:any){
 const canon:any=await client.fetch('*[_type=="canon"&&number==$n][0]{_id,canonicalId}',{n:e.canon})
 if(!canon||canon.canonicalId!==`cic-1983-can-${e.canon}`)throw new Error(`Can. ${e.canon}: canone non risolto`)
 const versions:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id&&language=="it"]{_id,versionId,status,validFrom,validUntil}',{id:canon._id})
 const matches=versions.filter(active)
 if(matches.length!==1)throw new Error(`Can. ${e.canon}: versioni IT attive al ${EFFECTIVE}=${matches.length}`)
 const v=matches[0]
 if(!e.locator)return {_id:v._id,label:`canonVersion ${v.versionId}`}
 const segs:any[]=await client.fetch('*[_type=="canonSegment"&&version._ref==$v]{_id,segmentId,label}',{v:v._id})
 const wanted=norm(e.locator)
 const ms=segs.filter(s=>norm(s.label)===wanted||(wanted==='§1'&&/-par-1$/.test(s.segmentId??''))||(wanted==='§2'&&/-par-2$/.test(s.segmentId??''))||(wanted==='§3'&&/-par-3$/.test(s.segmentId??'')))
 if(ms.length!==1)throw new Error(`Can. ${e.canon} ${e.locator}: segmenti target=${ms.length}`)
 return {_id:ms[0]._id,label:`canonSegment ${ms[0]._id}`}
}

async function main(){
 console.log('\nDRY-RUN COMPETENTIAS — sourceDocument + 11 legalRelation — NESSUNA SCRITTURA')
 const c=JSON.parse(await readFile(DATA,'utf8'))
 if(c.documentId!=='francis-2022-competentias-quasdam-decernere'||c.effectiveFrom!==EFFECTIVE||!Array.isArray(c.effects)||c.effects.length!==11)throw new Error('Canonical Competentias inattesa')
 const snap=c.snapshot
 if(!snap?.sha256||!snap?.sourceUrl||!snap?.path)throw new Error('Snapshot act incompleto')
 const sourceMatches:any[]=await client.fetch('*[_type=="sourceDocument"&&(_id==$id||documentId==$documentId)]{_id,documentId}',{id:SOURCE_ID,documentId:c.documentId})
 if(sourceMatches.some(x=>x._id!==SOURCE_ID))throw new Error(`Collisione sourceDocument: ${sourceMatches.map(x=>x._id).join(', ')}`)
 console.log(`${sourceMatches.length?'UPDATE/UPSERT':'CREATE'} ${SOURCE_ID} | effectiveFrom=${EFFECTIVE} | sha256=${snap.sha256}`)
 let count=0
 for(const e of c.effects){
  const target=await resolveTarget(e)
  const rid=relId(e),docId=`relation-${rid}`
  const collisions:any[]=await client.fetch('*[_type=="legalRelation"&&(_id==$id||relationId==$rid)]{_id,relationId}',{id:docId,rid})
  if(collisions.some(x=>x._id!==docId))throw new Error(`Collisione legalRelation ${rid}: ${collisions.map(x=>x._id).join(', ')}`)
  console.log(`${collisions.length?'UPDATE/UPSERT':'CREATE'} ${docId} | art. ${e.article} | Can. ${e.canon}${e.locator?` ${e.locator}`:''} | ${e.effect} → ${target.label}`)
  count++
 }
 console.log(`\n✔ DRY-RUN SUPERATO — 1 sourceDocument · ${count} legalRelation pronte — nessuna scrittura eseguita`)
}
main().catch(e=>{console.error('\n✖ DRY-RUN COMPETENTIAS FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
