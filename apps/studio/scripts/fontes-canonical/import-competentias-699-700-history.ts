import {getCliClient} from 'sanity/cli'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {canonicalTextToPortableText} from '../import-cic/portableText'

const client=getCliClient({apiVersion:'2026-03-25'})
const DATA=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere/history-699-700/history-canonical.json')

function ref(_ref:string){return {_type:'reference',_ref}}
function deterministicId(value:string){return value.replace(/[^A-Za-z0-9_.-]/g,'-')}

async function main(){
  console.log('\nIMPORT HISTORY — COMPETENTIAS CAN. 699–700 — PRODUCTION')
  const data=JSON.parse(await readFile(DATA,'utf8'))
  if(data.scope!=='competentias-history-699-700'||data.effectiveFrom!=='2022-02-15')throw new Error('history-canonical non riconosciuta')

  const e699=data.canons?.find((x:any)=>x.canon===699)
  const e700=data.canons?.find((x:any)=>x.canon===700)
  if(!e699||!e700)throw new Error('Can. 699–700 assenti dal piano')

  const a699old=e699.actions.find((x:any)=>x.action==='patch-existing')
  const a699new=e699.actions.find((x:any)=>x.action==='create')
  const a699retire=e699.actions.find((x:any)=>x.action==='retire-incorrect-version')
  const a700old=e700.actions.find((x:any)=>x.action==='patch-existing')
  const a700new=e700.actions.find((x:any)=>x.action==='create')
  const a700keep=e700.actions.find((x:any)=>x.action==='keep-existing-current')
  if(!a699old||!a699new||!a699retire||!a700old||!a700new||!a700keep)throw new Error('azioni del piano incomplete')

  const old699:any=await client.fetch('*[_id==$id&&_type=="canonVersion"][0]{_id,versionId,"canonRef":canon._ref}',{id:a699old.versionRef})
  const old700:any=await client.fetch('*[_id==$id&&_type=="canonVersion"][0]{_id,versionId,"canonRef":canon._ref}',{id:a700old.versionRef})
  const keep700:any=await client.fetch('*[_id==$id&&_type=="canonVersion"][0]{_id,versionId,status,language,validFrom,validUntil}',{id:a700keep.versionRef})
  if(!old699||old699.versionId!==a699old.versionId||old699.canonRef!==e699.canonRef)throw new Error('Can. 699 storico 1983 non coerente')
  if(!old700||old700.versionId!==a700old.versionId||old700.canonRef!==e700.canonRef)throw new Error('Can. 700 storico 1983 non coerente')
  if(!keep700||keep700.versionId!==a700keep.versionId||keep700.status!=='current'||keep700.language!=='la'||keep700.validFrom!=='2023-05-07'||keep700.validUntil)throw new Error('Can. 700 LA 2023 non coerente')

  for(const a of [a699new,a700new]){
    const collisions:any[]=await client.fetch('*[_type=="canonVersion"&&(_id==$id||versionId==$versionId)]{_id,versionId,"canonRef":canon._ref,language}',{id:a.versionDocumentId,versionId:a.versionId})
    const distinct=new Map(collisions.map((x:any)=>[x._id,x]))
    if(distinct.size>1)throw new Error(`${a.versionId}: collisione _id/versionId`)
    const existing=[...distinct.values()][0] as any
    const expectedCanon=a===a699new?e699.canonRef:e700.canonRef
    if(existing&&(existing._id!==a.versionDocumentId||existing.versionId!==a.versionId||existing.canonRef!==expectedCanon||existing.language!==a.language))throw new Error(`${a.versionId}: documento esistente non coerente`)
  }

  const bad699:any=await client.fetch('*[_id==$id&&_type=="canonVersion"][0]{_id,versionId}',{id:a699retire.versionRef})
  if(bad699&&bad699.versionId!==a699retire.versionId)throw new Error('versione 699/2026 inattesa')
  if(bad699){
    const inbound:any[]=await client.fetch('*[references($id)]{_id,_type,"versionRef":version._ref}',{id:bad699._id})
    const unexpected=inbound.filter((x:any)=>x._type!=='canonSegment'||x.versionRef!==bad699._id)
    if(unexpected.length)throw new Error(`Can. 699/2026: riferimenti entranti non gestibili=${unexpected.map((x:any)=>`${x._type}:${x._id}`).join(', ')}`)
    console.log(`✔ Can. 699/2026: ${inbound.length} riferimenti entranti, tutti canonSegment eliminabili in sicurezza`)
  }else{
    console.log('✔ Can. 699/2026 già assente: import idempotente')
  }

  let tx=client.transaction()

  tx=tx.patch(a699old.versionRef,{set:{status:'historical',validFrom:a699old.validFrom,validUntil:a699old.validUntil}})
  tx=tx.patch(a700old.versionRef,{set:{status:'historical',validFrom:a700old.validFrom,validUntil:a700old.validUntil}})

  const buildVersion=(a:any,canonRef:string,previousVersionRef:string)=>({
    _id:a.versionDocumentId,
    _type:'canonVersion',
    canon:ref(canonRef),
    versionId:a.versionId,
    versionLabel:a.versionLabel,
    status:a.status,
    language:a.language,
    validFrom:a.validFrom,
    ...(a.validUntil?{validUntil:a.validUntil}:{}),
    fullText:canonicalTextToPortableText(a.text),
    sourceCitation:a.versionId.includes('699')?'Codice di Diritto Canonico, can. 699 — testo introdotto da Competentias quasdam decernere':'Codice di Diritto Canonico, can. 700 — testo introdotto da Competentias quasdam decernere',
    sourceUrl:a.sourceUrl,
    previousVersion:ref(previousVersionRef),
  })

  const doc699=buildVersion(a699new,e699.canonRef,a699old.versionRef)
  const doc700=buildVersion(a700new,e700.canonRef,a700old.versionRef)
  tx=tx.createIfNotExists(doc699).patch(a699new.versionDocumentId,{set:{...doc699,_id:undefined,_type:undefined}})
  tx=tx.createIfNotExists(doc700).patch(a700new.versionDocumentId,{set:{...doc700,_id:undefined,_type:undefined}})

  for(const s of a699new.segments??[]){
    const id=deterministicId(`segment-${a699new.versionId}-${s.segmentId}`)
    const fields:any={canon:ref(e699.canonRef),version:ref(a699new.versionDocumentId),segmentType:s.segmentType,segmentId:s.segmentId,label:s.label,order:s.order,startOffset:s.startOffset,endOffset:s.endOffset,isFormalDivision:s.isFormalDivision}
    tx=tx.createIfNotExists({_id:id,_type:'canonSegment',...fields}).patch(id,{set:fields})
  }

  if(bad699){
    const badSegments:any[]=await client.fetch('*[_type=="canonSegment"&&version._ref==$id]{_id}',{id:bad699._id})
    for(const s of badSegments)tx=tx.delete(s._id)
    tx=tx.delete(bad699._id)
  }

  const result=await tx.commit({visibility:'sync',autoGenerateArrayKeys:true})
  console.log(`✔ Transazione completata — ${result.transactionId}`)

  const versions699:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id&&language=="it"]{_id,versionId,status,language,validFrom,validUntil,"previousRef":previousVersion._ref}|order(validFrom asc)',{id:e699.canonRef})
  const versions700:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id]{_id,versionId,status,language,validFrom,validUntil,"previousRef":previousVersion._ref}|order(validFrom asc)',{id:e700.canonRef})
  const seg699new:any[]=await client.fetch('*[_type=="canonSegment"&&version._ref==$id]{_id,segmentId,startOffset,endOffset}|order(order asc)',{id:a699new.versionDocumentId})
  const badLeft:number=await client.fetch('count(*[_id==$id || (_type=="canonSegment"&&version._ref==$id)])',{id:a699retire.versionRef})

  const errors:string[]=[]
  const v699old=versions699.find(v=>v.versionId===a699old.versionId)
  const v699new=versions699.find(v=>v.versionId===a699new.versionId)
  if(!v699old||v699old.status!=='historical'||v699old.validFrom!=='1983-11-27'||v699old.validUntil!=='2022-02-14')errors.push('Can. 699 versione 1983 non conforme')
  if(!v699new||v699new.status!=='current'||v699new.validFrom!=='2022-02-15'||v699new.validUntil||v699new.previousRef!==a699old.versionRef)errors.push('Can. 699 versione 2022 non conforme')
  if(seg699new.length!==2)errors.push(`Can. 699 versione 2022: segmenti=${seg699new.length}, attesi 2`)
  if(badLeft!==0)errors.push(`Can. 699 versione 2026/segmenti residui=${badLeft}`)

  const v700old=versions700.find(v=>v.versionId===a700old.versionId)
  const v700new=versions700.find(v=>v.versionId===a700new.versionId)
  const v700la=versions700.find(v=>v.versionId===a700keep.versionId)
  if(!v700old||v700old.status!=='historical'||v700old.validFrom!=='1983-11-27'||v700old.validUntil!=='2022-02-14')errors.push('Can. 700 versione IT 1983 non conforme')
  if(!v700new||v700new.status!=='historical'||v700new.language!=='it'||v700new.validFrom!=='2022-02-15'||v700new.validUntil!=='2023-05-06'||v700new.previousRef!==a700old.versionRef)errors.push('Can. 700 versione IT 2022 non conforme')
  if(!v700la||v700la.status!=='current'||v700la.language!=='la'||v700la.validFrom!=='2023-05-07'||v700la.validUntil)errors.push('Can. 700 versione LA 2023 non conforme')

  if(errors.length){console.error('\n✖ READ-BACK FALLITO');for(const e of errors)console.error(`- ${e}`);process.exit(1)}
  console.log('✔ READ-BACK SUPERATO — Can. 699: 1983→2022 current; falsa 2026 rimossa con i suoi 2 segmenti')
  console.log('✔ READ-BACK SUPERATO — Can. 700: IT 1983→IT 2022→LA 2023 current')
  console.log('✔ IMPORT HISTORY 699–700 COMPLETATO')
}

main().catch(e=>{console.error('\n✖ IMPORT HISTORY 699–700 FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
