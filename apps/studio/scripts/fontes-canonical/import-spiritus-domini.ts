import {getCliClient} from 'sanity/cli'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=getCliClient({apiVersion:'2026-03-25'})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/spiritus-domini')
const DATA=join(ROOT,'canonical.json')
const SOURCE_DOC_ID='source-francis-2021-spiritus-domini'
const RELATION_ID='francis-2021-spiritus-domini-can-230-par-1'
const RELATION_DOC_ID=`relation-${RELATION_ID}`
const EFFECTIVE='2021-01-11'

const norm=(v:any)=>String(v??'').replace(/\s/g,'').toLowerCase()
function ref(_ref:string){return {_type:'reference',_ref}}

async function main(){
 console.log('\nIMPORT SPIRITUS DOMINI — PRODUCTION')
 const canonical=JSON.parse(await readFile(DATA,'utf8'))
 if(canonical.documentId!=='francis-2021-spiritus-domini')throw new Error(`documentId inatteso: ${canonical.documentId}`)
 if(canonical.effectiveFrom!==EFFECTIVE)throw new Error(`effectiveFrom inatteso: ${canonical.effectiveFrom}`)
 if(!Array.isArray(canonical.effects)||canonical.effects.length!==1)throw new Error(`Effetti attesi 1, trovati ${canonical.effects?.length??0}`)
 const effect=canonical.effects[0]
 if(effect.canon!==230||norm(effect.locator)!=='§1'||effect.effect!=='replaces')throw new Error('Effetto canonico inatteso')
 const snapshot=canonical.snapshots?.act
 if(!snapshot?.sha256||!snapshot?.sourceUrl||!snapshot?.path)throw new Error('Snapshot act incompleto')

 const sourceMatches:any[]=await client.fetch('*[_type=="sourceDocument"&&(_id==$docId||documentId==$documentId)]{_id,documentId}',{docId:SOURCE_DOC_ID,documentId:canonical.documentId})
 if(sourceMatches.some(x=>x._id!==SOURCE_DOC_ID))throw new Error(`Collisione sourceDocument: ${sourceMatches.map(x=>x._id).join(', ')}`)
 const relationMatches:any[]=await client.fetch('*[_type=="legalRelation"&&(_id==$docId||relationId==$relationId)]{_id,relationId}',{docId:RELATION_DOC_ID,relationId:RELATION_ID})
 if(relationMatches.some(x=>x._id!==RELATION_DOC_ID))throw new Error(`Collisione legalRelation: ${relationMatches.map(x=>x._id).join(', ')}`)

 const canon:any=await client.fetch('*[_type=="canon"&&number==230][0]{_id,canonicalId}')
 if(!canon||canon.canonicalId!=='cic-1983-can-230')throw new Error('Can. 230 non risolto')
 const currents:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id&&language=="it"&&status=="current"]{_id,versionId,validFrom}',{id:canon._id})
 if(currents.length!==1)throw new Error(`Can. 230: versioni current IT=${currents.length}`)
 const current=currents[0]
 if(current.validFrom!==EFFECTIVE)throw new Error(`Can. 230 current validFrom=${current.validFrom??'∅'}, atteso ${EFFECTIVE}`)
 const segs:any[]=await client.fetch('*[_type=="canonSegment"&&version._ref==$v]{_id,segmentId,label}',{v:current._id})
 const matches=segs.filter(s=>norm(s.label)==='§1'||String(s.segmentId||'').endsWith('-par-1'))
 if(matches.length!==1)throw new Error(`Can. 230 §1: segmenti target=${matches.length}`)
 const target=matches[0]
 console.log(`✔ target current risolto: ${target._id} / ${target.label}`)

 const sourceFields={
  documentId:canonical.documentId,title:canonical.title,shortTitle:canonical.shortTitle,documentType:canonical.documentType,
  issuer:canonical.issuer,issuedAt:canonical.issuedAt,effectiveFrom:canonical.effectiveFrom,territorialScope:canonical.territorialScope,
  legalForce:canonical.legalForce,status:canonical.status,language:canonical.language,officialUrl:canonical.officialUrl,
  snapshot:{sourceUrl:snapshot.sourceUrl,capturedAt:snapshot.capturedAt,sha256:snapshot.sha256,path:snapshot.path},
  canonicalDataVersion:canonical.canonicalDataVersion,notes:canonical.juridicalVerification?.note,
 }
 const relationFields={
  relationId:RELATION_ID,source:ref(SOURCE_DOC_ID),target:ref(target._id),relationType:'replaces',authorityLevel:'official',
  validFrom:EFFECTIVE,sourceDocument:ref(SOURCE_DOC_ID),officialCitation:'Spiritus Domini — modifica del can. 230 §1',
  note:'Spiritus Domini sostituisce il testo del can. 230 §1 con efficacia dall’11 gennaio 2021.',verified:true,
 }

 let tx=client.transaction()
 tx=tx.createIfNotExists({_id:SOURCE_DOC_ID,_type:'sourceDocument',...sourceFields}).patch(SOURCE_DOC_ID,{set:sourceFields})
 tx=tx.createIfNotExists({_id:RELATION_DOC_ID,_type:'legalRelation',...relationFields}).patch(RELATION_DOC_ID,{set:relationFields})
 const result=await tx.commit({visibility:'sync'})
 console.log(`✔ Transazione completata — ${result.transactionId}`)

 const source:any=await client.fetch('*[_id==$id][0]{_id,_type,documentId,effectiveFrom,snapshot}',{id:SOURCE_DOC_ID})
 const relation:any=await client.fetch('*[_id==$id][0]{_id,_type,relationId,relationType,authorityLevel,validFrom,source,target,sourceDocument,verified}',{id:RELATION_DOC_ID})
 const errors:string[]=[]
 if(!source||source._type!=='sourceDocument'||source.documentId!==canonical.documentId||source.effectiveFrom!==EFFECTIVE||source.snapshot?.sha256!==snapshot.sha256)errors.push('sourceDocument read-back non conforme')
 if(!relation||relation._type!=='legalRelation'||relation.relationId!==RELATION_ID||relation.relationType!=='replaces'||relation.authorityLevel!=='official'||relation.validFrom!==EFFECTIVE||relation.source?._ref!==SOURCE_DOC_ID||relation.target?._ref!==target._id||relation.sourceDocument?._ref!==SOURCE_DOC_ID||relation.verified!==true)errors.push('legalRelation read-back non conforme')
 if(errors.length){console.error('\n✖ READ-BACK FALLITO');for(const e of errors)console.error(`- ${e}`);process.exit(1)}
 console.log('✔ READ-BACK SUPERATO — 1 sourceDocument · 1 legalRelation conforme')
 console.log('✔ IMPORT SPIRITUS DOMINI COMPLETATO')
}
main().catch(e=>{console.error('\n✖ IMPORT SPIRITUS DOMINI FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
