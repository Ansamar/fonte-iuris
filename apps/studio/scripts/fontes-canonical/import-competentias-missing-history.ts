import {getCliClient} from 'sanity/cli'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {canonicalTextToPortableText} from '../import-cic/portableText'

const client=getCliClient({apiVersion:'2026-03-25'})
const DATA=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere/history-missing/history-canonical.json')
const TARGETS=[237,242,265,1308,1310]
function ref(_ref:string){return {_type:'reference',_ref}}
function did(v:string){return v.replace(/[^A-Za-z0-9_.-]/g,'-')}

async function main(){
 console.log('\nIMPORT HISTORY — COMPETENTIAS — CAN. 237, 242, 265, 1308, 1310 — PRODUCTION')
 const data=JSON.parse(await readFile(DATA,'utf8'))
 if(data.scope!=='competentias-history-missing'||data.effectiveFrom!=='2022-02-15')throw new Error('canonical non riconosciuta')
 let tx=client.transaction()
 for(const n of TARGETS){
  const e=data.canons.find((x:any)=>x.canon===n);if(!e)throw new Error(`Can. ${n} assente`)
  const old=e.actions.find((x:any)=>x.action==='create-historical'), cur=e.actions.find((x:any)=>x.action==='migrate-current-to-2022')
  if(!old||!cur)throw new Error(`Can. ${n}: piano incompleto`)
  const src:any=await client.fetch('*[_id==$id&&_type=="canonVersion"][0]{_id,versionId,"canonRef":canon._ref,"sourceRef":sourceDocument._ref}',{id:cur.fromVersionRef})
  if(!src||src.versionId!==cur.fromVersionId||src.canonRef!==e.canonRef)throw new Error(`Can. ${n}: versione sorgente inattesa`)
  const inbound:any[]=await client.fetch('*[references($id)]{_id,_type,"versionRef":version._ref}',{id:src._id})
  const bad=inbound.filter((x:any)=>x._type!=='canonSegment'||x.versionRef!==src._id);if(bad.length)throw new Error(`Can. ${n}: inbound esterni`)
  for(const a of [old,cur]){const id=a.versionDocumentId||a.toVersionDocumentId,vid=a.versionId||a.toVersionId;const collision=await client.fetch('count(*[_type=="canonVersion"&&(_id==$id||versionId==$vid)])',{id,vid});if(collision)throw new Error(`Can. ${n}: collisione ${vid}`)}
  const mk=(a:any,id:string,vid:string,prev?:string)=>({_id:id,_type:'canonVersion',canon:ref(e.canonRef),versionId:vid,versionLabel:a.versionLabel,status:a.status,language:a.language,validFrom:a.validFrom,...(a.validUntil?{validUntil:a.validUntil}:{}),fullText:canonicalTextToPortableText(a.text),sourceDocument:src.sourceRef?ref(src.sourceRef):undefined,sourceCitation:`Codice di Diritto Canonico, can. ${n}`,...(prev?{previousVersion:ref(prev)}:{})})
  const oldDoc=mk(old,old.versionDocumentId,old.versionId)
  const curDoc=mk(cur,cur.toVersionDocumentId,cur.toVersionId,old.versionDocumentId)
  tx=tx.create(oldDoc).create(curDoc)
  for(const [a,id,vid] of [[old,old.versionDocumentId,old.versionId],[cur,cur.toVersionDocumentId,cur.toVersionId]] as any[]){for(const s of a.segments??[]){tx=tx.create({_id:did(`segment-${vid}-${s.segmentId}`),_type:'canonSegment',canon:ref(e.canonRef),version:ref(id),segmentType:s.segmentType,segmentId:s.segmentId,label:s.label,order:s.order,startOffset:s.startOffset,endOffset:s.endOffset,isFormalDivision:s.isFormalDivision})}}
  for(const r of inbound)tx=tx.delete(r._id)
  tx=tx.delete(src._id)
  console.log(`✔ Can. ${n}: pronto 1983→2022; vecchia ${src.versionId} rimossa con ${inbound.length} segmenti`)
 }
 const result=await tx.commit({visibility:'sync',autoGenerateArrayKeys:true});console.log(`✔ Transazione completata — ${result.transactionId}`)
 const errors:string[]=[]
 for(const n of TARGETS){
  const vs:any[]=await client.fetch('*[_type=="canonVersion"&&canon->number==$n&&language=="it"]{_id,versionId,status,validFrom,validUntil,"previousRef":previousVersion._ref}|order(validFrom asc)',{n})
  const a=vs.find(v=>v.versionId===`cic-1983-can-${n}-it-1983`),b=vs.find(v=>v.versionId===`cic-1983-can-${n}-it-2022`)
  if(vs.length!==2||!a||a.status!=='historical'||a.validFrom!=='1983-11-27'||a.validUntil!=='2022-02-14'||!b||b.status!=='current'||b.validFrom!=='2022-02-15'||b.validUntil||b.previousRef!==a._id)errors.push(`Can. ${n}: versioni temporali non conformi`)
  const expected:any={237:[2,2],242:[2,2],265:[0,0],1308:[5,4],1310:[3,2]};const sa=await client.fetch('count(*[_type=="canonSegment"&&version._ref==$id])',{id:a?._id}),sb=await client.fetch('count(*[_type=="canonSegment"&&version._ref==$id])',{id:b?._id});if(sa!==expected[n][0]||sb!==expected[n][1])errors.push(`Can. ${n}: segmenti ${sa}/${sb}`)
  const oldLeft=await client.fetch('count(*[_type=="canonVersion"&&versionId==$v])',{v:`cic-1983-can-${n}-it-current`});if(oldLeft)errors.push(`Can. ${n}: vecchia current residua`)
  if(!errors.some(e=>e.startsWith(`Can. ${n}:`)))console.log(`✔ READ-BACK Can. ${n}: 1983→2022 current; segmenti ${sa}/${sb}`)
 }
 if(errors.length){console.error('\n✖ READ-BACK FALLITO');errors.forEach(e=>console.error(`- ${e}`));process.exit(1)}
 console.log('✔ IMPORT HISTORY COMPETENTIAS MANCANTE COMPLETATO — READ-BACK SUPERATO')
}
main().catch(e=>{console.error('\n✖ IMPORT FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
