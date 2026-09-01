import {createClient} from '@sanity/client'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false,token:process.env.SANITY_AUTH_TOKEN})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/de-concordia-inter-codices')
const DATA=join(ROOT,'canonical.json')
const SOURCE_DOC_ID='source-francis-2016-de-concordia-inter-codices'
const EFFECTIVE='2016-12-16'

const norm=(v:any)=>String(v??'').replace(/\s/g,'').toLowerCase()
function relationId(article:string,canon:number){return `francis-2016-de-concordia-inter-codices-art-${article}-can-${canon}`}
function relationDocId(article:string,canon:number){return `relation-${relationId(article,canon)}`}

async function resolveTarget(effect:any){
  const canon:any=await client.fetch('*[_type=="canon"&&number==$n][0]{_id,number,canonicalId}',{n:effect.canon})
  if(!canon||canon.canonicalId!==`cic-1983-can-${effect.canon}`)throw new Error(`Can. ${effect.canon}: canone non risolto`)
  const currents:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id&&language=="it"&&status=="current"]{_id,versionId,validFrom}',{id:canon._id})
  if(currents.length!==1)throw new Error(`Can. ${effect.canon}: versioni current IT=${currents.length}`)
  const current=currents[0]
  if(current.validFrom!==EFFECTIVE)throw new Error(`Can. ${effect.canon}: current validFrom=${current.validFrom??'∅'}, atteso ${EFFECTIVE}`)
  if(!effect.locator)return {targetId:current._id,targetType:'canonVersion',targetLabel:current.versionId}
  const segs:any[]=await client.fetch('*[_type=="canonSegment"&&version._ref==$v]{_id,segmentId,label,segmentType,"parentLabel":parentSegment->label}',{v:current._id})
  const wanted=norm(effect.locator)
  let matches:any[]=[]
  if(wanted==='§1,2°')matches=segs.filter(s=>(norm(s.label)==='2)'||norm(s.label)==='2°'||norm(s.label)==='2'||String(s.segmentId||'').endsWith('-num-2')||String(s.segmentId||'').endsWith('-n2'))&&norm(s.parentLabel)==='§1')
  else matches=segs.filter(s=>norm(s.label)===wanted)
  if(matches.length!==1)throw new Error(`Can. ${effect.canon} ${effect.locator}: segmenti target=${matches.length}`)
  return {targetId:matches[0]._id,targetType:'canonSegment',targetLabel:`${current.versionId} / ${matches[0].label}`}
}

async function main(){
  console.log('\nIMPORT DE CONCORDIA — PRODUCTION')
  if(!process.env.SANITY_AUTH_TOKEN)throw new Error('SANITY_AUTH_TOKEN non disponibile: nessuna scrittura eseguita.')
  const canonical=JSON.parse(await readFile(DATA,'utf8'))
  if(canonical.documentId!=='francis-2016-de-concordia-inter-codices')throw new Error(`documentId inatteso: ${canonical.documentId}`)
  if(canonical.effectiveFrom!==EFFECTIVE)throw new Error(`effectiveFrom inatteso: ${canonical.effectiveFrom}`)
  if(!Array.isArray(canonical.effects)||canonical.effects.length!==11)throw new Error(`Effetti attesi 11, trovati ${canonical.effects?.length??0}`)
  if(!canonical.snapshot?.sha256||!canonical.snapshot?.sourceUrl||!canonical.snapshot?.path)throw new Error('Snapshot canonico incompleto')

  const sourceMatches:any[]=await client.fetch('*[_type=="sourceDocument"&&(_id==$docId||documentId==$documentId)]{_id,documentId}',{docId:SOURCE_DOC_ID,documentId:canonical.documentId})
  if(sourceMatches.some(x=>x._id!==SOURCE_DOC_ID))throw new Error(`Collisione sourceDocument: ${sourceMatches.map(x=>x._id).join(', ')}`)

  const resolved:any[]=[]
  for(const effect of canonical.effects){
    const id=relationId(effect.article,effect.canon)
    const docId=relationDocId(effect.article,effect.canon)
    const existing:any[]=await client.fetch('*[_type=="legalRelation"&&(_id==$docId||relationId==$relationId)]{_id,relationId}',{docId,relationId:id})
    if(existing.some(x=>x._id!==docId))throw new Error(`Art. ${effect.article} — Can. ${effect.canon}: collisione relazione ${existing.map(x=>x._id).join(', ')}`)
    const target=await resolveTarget(effect)
    resolved.push({effect,id,docId,target,relationType:effect.effect==='replaces'?'replaces':'integrates'})
    console.log(`✔ Art. ${effect.article} — Can. ${effect.canon}${effect.locator?` ${effect.locator}`:''}: ${target.targetType} ${target.targetLabel}`)
  }

  const sourceFields={
    documentId:canonical.documentId,
    title:canonical.title,
    shortTitle:canonical.shortTitle,
    documentType:canonical.documentType,
    issuer:canonical.issuer,
    issuedAt:canonical.issuedAt,
    publicationReference:canonical.publicationReference,
    effectiveFrom:canonical.effectiveFrom,
    territorialScope:canonical.territorialScope,
    legalForce:canonical.legalForce,
    status:canonical.status,
    language:canonical.language,
    officialCitation:canonical.publicationReference,
    officialUrl:canonical.officialUrl,
    snapshot:{sourceUrl:canonical.snapshot.sourceUrl,capturedAt:canonical.snapshot.capturedAt,sha256:canonical.snapshot.sha256,path:canonical.snapshot.path},
    canonicalDataVersion:canonical.canonicalDataVersion,
    notes:canonical.juridicalVerification?.note,
  }

  let tx=client.transaction()
  tx=tx.createIfNotExists({_id:SOURCE_DOC_ID,_type:'sourceDocument',...sourceFields}).patch(SOURCE_DOC_ID,{set:sourceFields})
  for(const item of resolved){
    const fields={
      relationId:item.id,
      source:{_type:'reference',_ref:SOURCE_DOC_ID},
      target:{_type:'reference',_ref:item.target.targetId},
      relationType:item.relationType,
      authorityLevel:'official',
      validFrom:EFFECTIVE,
      sourceDocument:{_type:'reference',_ref:SOURCE_DOC_ID},
      officialCitation:`De concordia inter Codices, art. ${item.effect.article}`,
      note:`Effetto normativo sull${item.effect.locator?'a porzione indicata del':'’intero'} can. ${item.effect.canon}${item.effect.locator?` (${item.effect.locator})`:''}.`,
      verified:true,
    }
    tx=tx.createIfNotExists({_id:item.docId,_type:'legalRelation',...fields}).patch(item.docId,{set:fields})
  }

  const result=await tx.commit({visibility:'sync'})
  console.log(`✔ Transazione completata — ${result.transactionId}`)

  const source:any=await client.fetch('*[_id==$id][0]{_id,_type,documentId,title,documentType,issuer,effectiveFrom,territorialScope,legalForce,status,language,officialUrl,snapshot,canonicalDataVersion}',{id:SOURCE_DOC_ID})
  const relationIds=resolved.map(x=>x.docId)
  const relations:any[]=await client.fetch('*[_id in $ids]{_id,_type,relationId,relationType,authorityLevel,validFrom,source,target,sourceDocument,verified}',{ids:relationIds})
  const errors:string[]=[]
  if(!source||source._type!=='sourceDocument'||source.documentId!==canonical.documentId||source.effectiveFrom!==EFFECTIVE||source.snapshot?.sha256!==canonical.snapshot.sha256)errors.push('sourceDocument read-back non conforme')
  if(relations.length!==11)errors.push(`legalRelation read-back: ${relations.length}/11`)
  const byId=new Map(relations.map(r=>[r._id,r]))
  for(const item of resolved){const r:any=byId.get(item.docId);if(!r||r.relationId!==item.id||r.relationType!==item.relationType||r.authorityLevel!=='official'||r.validFrom!==EFFECTIVE||r.source?._ref!==SOURCE_DOC_ID||r.target?._ref!==item.target.targetId||r.sourceDocument?._ref!==SOURCE_DOC_ID||r.verified!==true)errors.push(`${item.id}: read-back non conforme`)}
  if(errors.length){console.error('\n✖ READ-BACK FALLITO');for(const e of errors)console.error(`- ${e}`);process.exit(1)}
  console.log('✔ READ-BACK SUPERATO — 1 sourceDocument · 11 legalRelation conformi')
  console.log('✔ IMPORT DE CONCORDIA COMPLETATO')
}

main().catch(e=>{console.error('\n✖ IMPORT DE CONCORDIA FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
