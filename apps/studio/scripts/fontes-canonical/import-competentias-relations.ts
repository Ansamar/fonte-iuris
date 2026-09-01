import {getCliClient} from 'sanity/cli'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=getCliClient({apiVersion:'2026-03-25'})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere')
const DATA=join(ROOT,'canonical.json')
const SOURCE_ID='source-francis-2022-competentias-quasdam-decernere'
const EFFECTIVE='2022-02-15'
const norm=(v:any)=>String(v??'').replace(/\s/g,'').toLowerCase()
const slug=(v:string)=>v.replace(/[^A-Za-z0-9_.-]/g,'-')
function ref(_ref:string){return {_type:'reference',_ref}}
function relId(e:any){return `francis-2022-competentias-art-${e.article}-can-${e.canon}${e.locator?`-${slug(norm(e.locator).replace('§','par-'))}`:''}`}
function active(v:any){return Boolean(v?.validFrom&&v.validFrom<=EFFECTIVE&&(!v.validUntil||v.validUntil>=EFFECTIVE))}

async function resolveTarget(e:any){
 const canon:any=await client.fetch('*[_type=="canon"&&number==$n][0]{_id,canonicalId}',{n:e.canon})
 if(!canon||canon.canonicalId!==`cic-1983-can-${e.canon}`)throw new Error(`Can. ${e.canon}: canone non risolto`)
 const versions:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id&&language=="it"]{_id,versionId,status,validFrom,validUntil}',{id:canon._id})
 const ms=versions.filter(active)
 if(ms.length!==1)throw new Error(`Can. ${e.canon}: versioni IT attive al ${EFFECTIVE}=${ms.length}`)
 const v=ms[0]
 if(!e.locator)return {_id:v._id,label:`canonVersion ${v.versionId}`}
 const segs:any[]=await client.fetch('*[_type=="canonSegment"&&version._ref==$v]{_id,segmentId,label}',{v:v._id})
 const wanted=norm(e.locator)
 const ss=segs.filter(s=>norm(s.label)===wanted||(wanted==='§1'&&/-par-1$/.test(s.segmentId??''))||(wanted==='§2'&&/-par-2$/.test(s.segmentId??''))||(wanted==='§3'&&/-par-3$/.test(s.segmentId??'')))
 if(ss.length!==1)throw new Error(`Can. ${e.canon} ${e.locator}: segmenti target=${ss.length}`)
 return {_id:ss[0]._id,label:`canonSegment ${ss[0]._id}`}
}

async function main(){
 console.log('\nIMPORT COMPETENTIAS — sourceDocument + 11 legalRelation — PRODUCTION')
 const c=JSON.parse(await readFile(DATA,'utf8'))
 if(c.documentId!=='francis-2022-competentias-quasdam-decernere'||c.effectiveFrom!==EFFECTIVE||!Array.isArray(c.effects)||c.effects.length!==11)throw new Error('Canonical Competentias inattesa')
 const snap=c.snapshot
 if(!snap?.sha256||!snap?.sourceUrl||!snap?.path)throw new Error('Snapshot act incompleto')
 const sourceMatches:any[]=await client.fetch('*[_type=="sourceDocument"&&(_id==$id||documentId==$documentId)]{_id,documentId}',{id:SOURCE_ID,documentId:c.documentId})
 if(sourceMatches.some(x=>x._id!==SOURCE_ID))throw new Error(`Collisione sourceDocument: ${sourceMatches.map(x=>x._id).join(', ')}`)

 const targets:any[]=[]
 for(const e of c.effects){
  const target=await resolveTarget(e)
  const rid=relId(e),docId=`relation-${rid}`
  const collisions:any[]=await client.fetch('*[_type=="legalRelation"&&(_id==$id||relationId==$rid)]{_id,relationId}',{id:docId,rid})
  if(collisions.some(x=>x._id!==docId))throw new Error(`Collisione legalRelation ${rid}: ${collisions.map(x=>x._id).join(', ')}`)
  targets.push({e,target,rid,docId})
 }

 const sourceFields={
  documentId:c.documentId,title:c.title,shortTitle:c.shortTitle,documentType:c.documentType,issuer:c.issuer,issuedAt:c.issuedAt,
  effectiveFrom:c.effectiveFrom,territorialScope:c.territorialScope,legalForce:c.legalForce,status:c.status,language:c.language,officialUrl:c.officialUrl,
  snapshot:{sourceUrl:snap.sourceUrl,capturedAt:snap.capturedAt,sha256:snap.sha256,path:snap.path},canonicalDataVersion:c.canonicalDataVersion,
  notes:c.juridicalVerification?.note,
 }
 let tx=client.transaction()
 tx=tx.createIfNotExists({_id:SOURCE_ID,_type:'sourceDocument',...sourceFields}).patch(SOURCE_ID,{set:sourceFields})
 for(const {e,target,rid,docId} of targets){
  const relationFields={
   relationId:rid,source:ref(SOURCE_ID),target:ref(target._id),relationType:e.effect,authorityLevel:'official',validFrom:EFFECTIVE,
   sourceDocument:ref(SOURCE_ID),officialCitation:`Competentias quasdam decernere, art. ${e.article} — Can. ${e.canon}${e.locator?` ${e.locator}`:''}`,
   note:`Competentias quasdam decernere ${e.effect==='integrates'?'integra':'sostituisce'} il ${e.locator?`can. ${e.canon} ${e.locator}`:`can. ${e.canon}`} con efficacia dal 15 febbraio 2022.`,verified:true,
  }
  tx=tx.createIfNotExists({_id:docId,_type:'legalRelation',...relationFields}).patch(docId,{set:relationFields})
  console.log(`✔ pronto ${rid} → ${target.label}`)
 }
 const result=await tx.commit({visibility:'sync'})
 console.log(`✔ Transazione completata — ${result.transactionId}`)

 const source:any=await client.fetch('*[_id==$id][0]{_id,_type,documentId,effectiveFrom,snapshot}',{id:SOURCE_ID})
 const rels:any[]=await client.fetch('*[_type=="legalRelation"&&sourceDocument._ref==$id]{_id,relationId,relationType,authorityLevel,validFrom,"targetRef":target._ref,verified}',{id:SOURCE_ID})
 const errors:string[]=[]
 if(!source||source._type!=='sourceDocument'||source.documentId!==c.documentId||source.effectiveFrom!==EFFECTIVE||source.snapshot?.sha256!==snap.sha256)errors.push('sourceDocument read-back non conforme')
 if(rels.length!==11)errors.push(`legalRelation read-back=${rels.length}, attese 11`)
 for(const {e,target,rid,docId} of targets){const r=rels.find(x=>x._id===docId);if(!r||r.relationId!==rid||r.relationType!==e.effect||r.authorityLevel!=='official'||r.validFrom!==EFFECTIVE||r.targetRef!==target._id||r.verified!==true)errors.push(`legalRelation non conforme: ${rid}`)}
 if(errors.length){console.error('\n✖ READ-BACK FALLITO');errors.forEach(e=>console.error(`- ${e}`));process.exit(1)}
 console.log('✔ READ-BACK SUPERATO — 1 sourceDocument · 11 legalRelation conformi')
 console.log('✔ IMPORT COMPETENTIAS COMPLETATO')
}
main().catch(e=>{console.error('\n✖ IMPORT COMPETENTIAS FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
