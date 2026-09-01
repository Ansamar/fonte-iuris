import {getCliClient} from 'sanity/cli'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {canonicalTextToPortableText} from '../import-cic/portableText'

const client=getCliClient({apiVersion:'2026-03-25'})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/de-concordia-inter-codices')
const DATA=join(ROOT,'history-canonical.json')
const EFFECTIVE='2016-12-16'
const CIC_DOCUMENT_ID='cic-1983'

function deterministicId(value:string){return value.replace(/[^A-Za-z0-9_.-]/g,'-')}
function ref(_ref:string){return {_type:'reference',_ref}}

async function main(){
  console.log('\nIMPORT DE CONCORDIA HISTORY — PRODUCTION')
  const data=JSON.parse(await readFile(DATA,'utf8'))
  if(data.effectiveFrom!==EFFECTIVE)throw new Error(`effectiveFrom inatteso: ${data.effectiveFrom}`)
  if(!Array.isArray(data.versions)||data.versions.length!==10)throw new Error(`Versioni storiche attese 10, trovate ${data.versions?.length??0}`)

  const sources:any[]=await client.fetch('*[_type=="sourceDocument"&&documentId==$id]{_id,documentId}',{id:CIC_DOCUMENT_ID})
  if(sources.length!==1)throw new Error(`Fonte CIC 1983: atteso 1 documento, trovati ${sources.length}`)
  const cicSourceId=sources[0]._id
  console.log(`✔ Fonte CIC 1983 risolta: ${cicSourceId}`)

  let tx=client.transaction()
  let versionOps=0,segmentOps=0,currentOps=0

  for(const v of data.versions){
    const canon:any=await client.fetch('*[_id==$id&&_type=="canon"][0]{_id,number,canonicalId}',{id:v.canonRef})
    if(!canon||canon.number!==v.canon||canon.canonicalId!==`cic-1983-can-${v.canon}`)throw new Error(`Can. ${v.canon}: canonRef non coerente`)

    const current:any=await client.fetch('*[_id==$id&&_type=="canonVersion"][0]{_id,versionId,status,language,validFrom,validUntil,previousVersion}',{id:v.currentVersionRef})
    if(!current||current.versionId!==v.currentVersionId||current.status!=='current'||current.language!=='it')throw new Error(`Can. ${v.canon}: currentVersionRef non coerente`)
    if(current.validUntil)throw new Error(`Can. ${v.canon}: current validUntil già valorizzato ${current.validUntil}`)
    if(current.validFrom&&current.validFrom!==EFFECTIVE)throw new Error(`Can. ${v.canon}: current validFrom=${current.validFrom}, atteso ${EFFECTIVE}`)
    if(current.previousVersion?._ref&&current.previousVersion._ref!==v.versionDocumentId)throw new Error(`Can. ${v.canon}: previousVersion già punta a ${current.previousVersion._ref}`)

    const existingVersions:any[]=await client.fetch('*[_type=="canonVersion"&&(_id==$docId||versionId==$versionId)]{_id,versionId,"canonRef":canon._ref,language}',{docId:v.versionDocumentId,versionId:v.versionId})
    const distinct=new Map(existingVersions.map((x:any)=>[x._id,x]))
    if(distinct.size>1)throw new Error(`Can. ${v.canon}: collisione canonVersion su _id/versionId`)
    const existing=[...distinct.values()][0] as any
    if(existing&&(existing._id!==v.versionDocumentId||existing.versionId!==v.versionId||existing.canonRef!==v.canonRef||existing.language!=='it'))throw new Error(`Can. ${v.canon}: canonVersion esistente non coerente`)

    const versionFields={
      canon:ref(v.canonRef),versionId:v.versionId,versionLabel:v.versionLabel,status:'historical',language:'it',
      validFrom:v.validFrom,validUntil:v.validUntil,fullText:canonicalTextToPortableText(v.text),sourceDocument:ref(cicSourceId),
      sourceCitation:v.sourceCitation,sourceUrl:v.sourceUrl,
    }
    tx=tx.createIfNotExists({_id:v.versionDocumentId,_type:'canonVersion',...versionFields}).patch(v.versionDocumentId,{set:versionFields})
    versionOps++

    const segmentMap=new Map<string,string>()
    for(const s of v.segments??[])segmentMap.set(s.segmentId,deterministicId(`segment-${v.versionId}-${s.segmentId}`))
    for(const s of v.segments??[]){
      const segmentId=segmentMap.get(s.segmentId)!
      const parentId=s.parentSegmentId?segmentMap.get(s.parentSegmentId):undefined
      if(s.parentSegmentId&&!parentId)throw new Error(`Can. ${v.canon}: parentSegmentId non risolto ${s.parentSegmentId}`)
      const collisions:any[]=await client.fetch('*[_type=="canonSegment"&&(_id==$id||(version._ref==$version&&segmentId==$segmentId))]{_id,segmentId,"versionRef":version._ref,"canonRef":canon._ref}',{id:segmentId,version:v.versionDocumentId,segmentId:s.segmentId})
      const segDistinct=new Map(collisions.map((x:any)=>[x._id,x]))
      if(segDistinct.size>1)throw new Error(`Can. ${v.canon}: collisione segmento ${s.segmentId}`)
      const segExisting=[...segDistinct.values()][0] as any
      if(segExisting&&(segExisting._id!==segmentId||segExisting.versionRef!==v.versionDocumentId||segExisting.canonRef!==v.canonRef))throw new Error(`Can. ${v.canon}: segmento esistente non coerente ${s.segmentId}`)
      const fields:any={canon:ref(v.canonRef),version:ref(v.versionDocumentId),segmentType:s.segmentType,segmentId:s.segmentId,label:s.label,order:s.order,startOffset:s.startOffset,endOffset:s.endOffset,isFormalDivision:s.isFormalDivision}
      if(parentId)fields.parentSegment=ref(parentId)
      tx=tx.createIfNotExists({_id:segmentId,_type:'canonSegment',...fields}).patch(segmentId,{set:fields})
      segmentOps++
    }

    tx=tx.patch(v.currentVersionRef,{set:{validFrom:EFFECTIVE,previousVersion:ref(v.versionDocumentId)}})
    currentOps++
    console.log(`✔ Can. ${v.canon}: storico ${existing?'UPDATE':'CREATE'}; current → ${EFFECTIVE}`)
  }

  const result=await tx.commit({visibility:'sync',autoGenerateArrayKeys:true})
  console.log(`✔ Transazione completata — ${result.transactionId}`)

  const historicalIds=data.versions.map((v:any)=>v.versionDocumentId)
  const currentIds=data.versions.map((v:any)=>v.currentVersionRef)
  const history:any[]=await client.fetch('*[_id in $ids]{_id,_type,versionId,status,language,validFrom,validUntil,"canonRef":canon._ref,"sourceRef":sourceDocument._ref}',{ids:historicalIds})
  const currents:any[]=await client.fetch('*[_id in $ids]{_id,versionId,status,validFrom,validUntil,"previousRef":previousVersion._ref}',{ids:currentIds})
  const segments:any[]=await client.fetch('*[_type=="canonSegment"&&version._ref in $ids]{_id,segmentId,"versionRef":version._ref,"canonRef":canon._ref,"parentRef":parentSegment._ref,startOffset,endOffset}',{ids:historicalIds})
  const errors:string[]=[]
  if(history.length!==10)errors.push(`read-back versioni storiche=${history.length}, attese 10`)
  if(currents.length!==10)errors.push(`read-back current=${currents.length}, attese 10`)
  if(segments.length!==25)errors.push(`read-back segmenti storici=${segments.length}, attesi 25`)
  const hById=new Map(history.map((x:any)=>[x._id,x]));const cById=new Map(currents.map((x:any)=>[x._id,x]))
  for(const v of data.versions){const h:any=hById.get(v.versionDocumentId);const c:any=cById.get(v.currentVersionRef);if(!h||h.versionId!==v.versionId||h.status!=='historical'||h.language!=='it'||h.validFrom!==v.validFrom||h.validUntil!==v.validUntil||h.canonRef!==v.canonRef||h.sourceRef!==cicSourceId)errors.push(`Can. ${v.canon}: read-back storico non conforme`);if(!c||c.status!=='current'||c.validFrom!==EFFECTIVE||c.validUntil||c.previousRef!==v.versionDocumentId)errors.push(`Can. ${v.canon}: read-back current non conforme`)}
  if(errors.length){console.error('\n✖ READ-BACK FALLITO');for(const e of errors)console.error(`- ${e}`);process.exit(1)}
  console.log(`✔ READ-BACK SUPERATO — 10 versioni storiche · 25 segmenti · 10 current aggiornate`)
  console.log(`✔ IMPORT DE CONCORDIA HISTORY COMPLETATO — ops versioni=${versionOps}, segmenti=${segmentOps}, current=${currentOps}`)
}

main().catch(e=>{console.error('\n✖ IMPORT DE CONCORDIA HISTORY FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
