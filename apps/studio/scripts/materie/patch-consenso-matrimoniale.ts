import {getCliClient} from 'sanity/cli'

const ID='legal-concept-consenso-matrimoniale'
const CEI_SOURCE_ID='source-cei-1990-decreto-generale-matrimonio-canonico'
const CANONS=[1057,1095,1096,1097,1098,1099,1100,1101,1102,1103,1104,1105,1106,1107]
const PORTABLE_FIELDS=[
 'systematicFramework',
 'ecclesiologicalFoundation',
 'codicialDiscipline',
 'normativeEvolution',
 'extraCodicialLegislation',
 'interpretation',
 'jurisprudencePractice',
 'controversialIssues',
 'notes',
] as const

function slugKey(value:string){
 return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||'text'
}

function toPortableText(value:unknown,keySeed:string){
 if(value==null)return value
 if(Array.isArray(value))return value
 if(typeof value!=='string')throw new Error(`${keySeed}: formato non supportato per Portable Text`)
 const text=value.trim()
 if(!text)return []
 const key=slugKey(keySeed)
 return [{
  _key:`${key}-block`,
  _type:'block',
  style:'normal',
  markDefs:[],
  children:[{_key:`${key}-span`,_type:'span',marks:[],text}],
 }]
}

async function main(){
 const dryRun=process.argv.includes('--dry-run')
 const client=getCliClient({apiVersion:'2026-03-25'}).withConfig({dataset:'production',useCdn:false})
 const doc=await client.getDocument(ID) as any
 if(!doc)throw new Error(`${ID}: documento non trovato`)

 const canons=await client.fetch(`*[_type=='canon' && number in $numbers]{_id,number}`,{numbers:CANONS}) as Array<{_id:string,number:number}>
 const byNumber=new Map(canons.map((c)=>[c.number,c._id]))
 const missing=CANONS.filter((n)=>!byNumber.has(n))
 if(missing.length)throw new Error(`Canoni mancanti: ${missing.join(', ')}`)

 const source=await client.fetch(`*[_id==$id][0]{_id,title,documentType,status,officialUrl}`,{id:CEI_SOURCE_ID}) as any
 if(!source)throw new Error(`Fonte mancante: ${CEI_SOURCE_ID}`)

 const set:any={}
 if(!doc.interpretation&&doc.interpretationDoctrine)set.interpretation=toPortableText(doc.interpretationDoctrine,`${ID}-interpretation`)
 for(const field of PORTABLE_FIELDS){
  const value=field==='interpretation'?(set.interpretation??doc[field]):doc[field]
  if(value!=null)set[field]=toPortableText(value,`${ID}-${field}`)
 }
 if(!doc.sourceResearch&&(doc.sourceVerificationStatus||doc.sourceNotes)){
  set.sourceResearch={
   _type:'sourceResearch',
   status:doc.sourceVerificationStatus==='official-primary'?'official-verified':'pending',
   ...(doc.sourceNotes?{editorialNote:doc.sourceNotes}:{}),
  }
 }
 set.relatedCanons=CANONS.map((number)=>({
  _key:`can-${number}`,
  _type:'reference',
  _ref:byNumber.get(number),
 }))
 set.relatedSources=[{
  _key:'cei-decreto-matrimonio-1990',
  _type:'reference',
  _ref:source._id,
 }]

 console.log(`CONSENSO MATRIMONIALE · ${dryRun?'DRY RUN':'PATCH'}`)
 console.log(`Portable Text: ${Object.keys(set).filter((k)=>PORTABLE_FIELDS.includes(k as any)).join(', ')||'nessuna modifica'}`)
 console.log(`Canoni collegati: ${CANONS.join(', ')} · ${CANONS.length}/${CANONS.length}`)
 console.log(`Fonte collegata: ${source.title} · ${source._id}`)
 console.log(`Controllo fonti: ${set.sourceResearch?.status||doc.sourceResearch?.status||'non impostato'}`)
 if(dryRun)return

 await client.patch(ID)
  .set(set)
  .unset(['interpretationDoctrine','sourceVerificationStatus','sourceNotes'])
  .commit({visibility:'sync'})

 const readback=await client.fetch(`*[_id==$id][0]{_id,label,"canoni":relatedCanons[]->number,"fonti":relatedSources[]->{_id,title,documentType,status},"portable":{
  "systematicFramework":systematicFramework[]._type,
  "interpretation":interpretation[]._type,
  "jurisprudencePractice":jurisprudencePractice[]._type
 },sourceResearch}`,{id:ID})
 if(!readback||readback.canoni?.length!==CANONS.length)throw new Error('Read-back incompleto dopo patch')
 if(readback.fonti?.length!==1||readback.fonti[0]?._id!==CEI_SOURCE_ID)throw new Error('Read-back fonte CEI incompleto dopo patch')
 console.log(JSON.stringify(readback,null,2))
 console.log('PATCH OK · Consenso matrimoniale aggiornato e verificato')
}

main().catch((error)=>{
 console.error(error)
 process.exit(1)
})
