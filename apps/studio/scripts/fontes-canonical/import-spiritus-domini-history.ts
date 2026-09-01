import {getCliClient} from 'sanity/cli'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {canonicalTextToPortableText} from '../import-cic/portableText'

const client=getCliClient({apiVersion:'2026-03-25'})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/spiritus-domini')
const DATA=join(ROOT,'history-canonical.json')
const EFFECTIVE='2021-01-11'
const CIC_DOCUMENT_ID='cic-1983'
function deterministicId(value:string){return value.replace(/[^A-Za-z0-9_.-]/g,'-')}
function ref(_ref:string){return {_type:'reference',_ref}}

async function main(){
 console.log('\nIMPORT SPIRITUS DOMINI HISTORY — PRODUCTION')
 const data=JSON.parse(await readFile(DATA,'utf8'))
 if(data.effectiveFrom!==EFFECTIVE)throw new Error(`effectiveFrom inatteso: ${data.effectiveFrom}`)
 if(!Array.isArray(data.versions)||data.versions.length!==1)throw new Error(`Versioni storiche attese 1, trovate ${data.versions?.length??0}`)
 const sources:any[]=await client.fetch('*[_type=="sourceDocument"&&documentId==$id]{_id,documentId}',{id:CIC_DOCUMENT_ID})
 if(sources.length!==1)throw new Error(`Fonte CIC 1983: atteso 1 documento, trovati ${sources.length}`)
 const cicSourceId=sources[0]._id
 console.log(`✔ Fonte CIC 1983 risolta: ${cicSourceId}`)
 let tx=client.transaction();let versionOps=0,segmentOps=0,currentOps=0
 for(const v of data.versions){
  const canon:any=await client.fetch('*[_id==$id&&_type=="canon"][0]{_id,number,canonicalId}',{id:v.canonRef})
  if(!canon||canon.number!==230||canon.canonicalId!=='cic-1983-can-230')throw new Error('Can. 230: canonRef non coerente')
  const current:any=await client.fetch('*[_id==$id&&_type=="canonVersion"][0]{_id,versionId,status,language,validFrom,validUntil,previousVersion}',{id:v.currentVersionRef})
  if(!current||current.versionId!==v.currentVersionId||current.status!=='current'||current.language!=='it')throw new Error('Can. 230: currentVersionRef non coerente')
  if(current.validUntil)throw new Error(`Can. 230: current validUntil già valorizzato ${current.validUntil}`)
  if(current.validFrom&&current.validFrom!==EFFECTIVE)throw new Error(`Can. 230: current validFrom=${current.validFrom}, atteso ${EFFECTIVE}`)
  if(current.previousVersion?._ref&&current.previousVersion._ref!==v.versionDocumentId)throw new Error(`Can. 230: previousVersion già punta a ${current.previousVersion._ref}`)
  const existingVersions:any[]=await client.fetch('*[_type=="canonVersion"&&(_id==$docId||versionId==$versionId)]{_id,versionId,"canonRef":canon._ref,language}',{docId:v.versionDocumentId,versionId:v.versionId})
  const distinct=new Map(existingVersions.map((x:any)=>[x._id,x]));if(distinct.size>1)throw new Error('Can. 230: collisione canonVersion su _id/versionId')
  const existing=[...distinct.values()][0] as any
  if(existing&&(existing._id!==v.versionDocumentId||existing.versionId!==v.versionId||existing.canonRef!==v.canonRef||existing.language!=='it'))throw new Error('Can. 230: canonVersion esistente non coerente')
  const versionFields={canon:ref(v.canonRef),versionId:v.versionId,versionLabel:v.versionLabel,status:'historical',language:'it',validFrom:v.validFrom,validUntil:v.validUntil,fullText:canonicalTextToPortableText(v.text),sourceDocument:ref(cicSourceId),sourceCitation:v.sourceCitation,sourceUrl:v.sourceUrl}
  tx=tx.createIfNotExists({_id:v.versionDocumentId,_type:'canonVersion',...versionFields}).patch(v.versionDocumentId,{set:versionFields});versionOps++
  const segmentMap=new Map<string,string>();for(const s of v.segments??[])segmentMap.set(s.segmentId,deterministicId(`segment-${v.versionId}-${s.segmentId}`))
  for(const s of v.segments??[]){
   const id=segmentMap.get(s.segmentId)!;const parentId=s.parentSegmentId?segmentMap.get(s.parentSegmentId):undefined
   if(s.parentSegmentId&&!parentId)throw new Error(`Can. 230: parentSegmentId non risolto ${s.parentSegmentId}`)
   const collisions:any[]=await client.fetch('*[_type=="canonSegment"&&(_id==$id||(version._ref==$version&&segmentId==$segmentId))]{_id,segmentId,"versionRef":version._ref,"canonRef":canon._ref}',{id,version:v.versionDocumentId,segmentId:s.segmentId})
   const segDistinct=new Map(collisions.map((x:any)=>[x._id,x]));if(segDistinct.size>1)throw new Error(`Can. 230: collisione segmento ${s.segmentId}`)
   const segExisting=[...segDistinct.values()][0] as any
   if(segExisting&&(segExisting._id!==id||segExisting.versionRef!==v.versionDocumentId||segExisting.canonRef!==v.canonRef))throw new Error(`Can. 230: segmento esistente non coerente ${s.segmentId}`)
   const fields:any={canon:ref(v.canonRef),version:ref(v.versionDocumentId),segmentType:s.segmentType,segmentId:s.segmentId,label:s.label,order:s.order,startOffset:s.startOffset,endOffset:s.endOffset,isFormalDivision:s.isFormalDivision};if(parentId)fields.parentSegment=ref(parentId)
   tx=tx.createIfNotExists({_id:id,_type:'canonSegment',...fields}).patch(id,{set:fields});segmentOps++
  }
  tx=tx.patch(v.currentVersionRef,{set:{validFrom:EFFECTIVE,previousVersion:ref(v.versionDocumentId)}});currentOps++
  console.log(`✔ Can. 230: storico ${existing?'UPDATE':'CREATE'}; current → ${EFFECTIVE}`)
 }
 const result=await tx.commit({visibility:'sync',autoGenerateArrayKeys:true});console.log(`✔ Transazione completata — ${result.transactionId}`)
 const v=data.versions[0]
 const history:any=await client.fetch('*[_id==$id][0]{_id,_type,versionId,status,language,validFrom,validUntil,"canonRef":canon._ref,"sourceRef":sourceDocument._ref}',{id:v.versionDocumentId})
 const current:any=await client.fetch('*[_id==$id][0]{_id,versionId,status,validFrom,validUntil,"previousRef":previousVersion._ref}',{id:v.currentVersionRef})
 const segments:any[]=await client.fetch('*[_type=="canonSegment"&&version._ref==$id]{_id,segmentId,"versionRef":version._ref,"canonRef":canon._ref,startOffset,endOffset}',{id:v.versionDocumentId})
 const errors:string[]=[]
 if(!history||history.versionId!==v.versionId||history.status!=='historical'||history.language!=='it'||history.validFrom!==v.validFrom||history.validUntil!==v.validUntil||history.canonRef!==v.canonRef||history.sourceRef!==cicSourceId)errors.push('read-back storico non conforme')
 if(!current||current.status!=='current'||current.validFrom!==EFFECTIVE||current.validUntil||current.previousRef!==v.versionDocumentId)errors.push('read-back current non conforme')
 if(segments.length!==3)errors.push(`read-back segmenti storici=${segments.length}, attesi 3`)
 if(errors.length){console.error('\n✖ READ-BACK FALLITO');for(const e of errors)console.error(`- ${e}`);process.exit(1)}
 console.log('✔ READ-BACK SUPERATO — 1 versione storica · 3 segmenti · 1 current aggiornata')
 console.log(`✔ IMPORT SPIRITUS DOMINI HISTORY COMPLETATO — ops versioni=${versionOps}, segmenti=${segmentOps}, current=${currentOps}`)
}
main().catch(e=>{console.error('\n✖ IMPORT SPIRITUS DOMINI HISTORY FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
