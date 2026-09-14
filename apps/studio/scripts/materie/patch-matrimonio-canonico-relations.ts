import {getCliClient} from 'sanity/cli'

const ID='legal-concept-matrimonio-canonico'
const CANON_START=1055
const CANON_END=1165
const SOURCE_IDS=[
 'source-cei-1990-decreto-generale-matrimonio-canonico',
 'source-mitis-iudex-dominus-iesus-2015',
]

async function main(){
 const dryRun=process.argv.includes('--dry-run')
 const client=getCliClient({apiVersion:'2026-03-25'}).withConfig({dataset:'production',useCdn:false})

 const doc=await client.getDocument(ID) as any
 if(!doc)throw new Error(`${ID}: documento non trovato`)
 if(doc.bibliography!==undefined)throw new Error(`${ID}: bibliography inline legacy ancora presente; interrompo`)

 const canons=await client.fetch(
  `*[_type=='canon' && number >= $start && number <= $end] | order(number asc){_id,number}`,
  {start:CANON_START,end:CANON_END},
 ) as Array<{_id:string,number:number}>

 const expectedCount=CANON_END-CANON_START+1
 if(canons.length!==expectedCount){
  throw new Error(`Corpus matrimoniale incompleto: ${canons.length}/${expectedCount} canoni`)
 }
 for(let number=CANON_START;number<=CANON_END;number++){
  if(canons[number-CANON_START]?.number!==number)throw new Error(`Canone mancante o fuori ordine: ${number}`)
 }

 const sources=await client.fetch(
  `*[_type=='sourceDocument' && _id in $ids]{_id,title,documentType,issuer,status,legalForce}`,
  {ids:SOURCE_IDS},
 ) as Array<{_id:string,title:string}>
 const sourceById=new Map(sources.map((s)=>[s._id,s]))
 const missingSources=SOURCE_IDS.filter((id)=>!sourceById.has(id))
 if(missingSources.length)throw new Error(`Fonti mancanti: ${missingSources.join(', ')}`)

 const relatedCanons=canons.map((canon)=>({
  _key:`can-${canon.number}`,
  _type:'reference',
  _ref:canon._id,
 }))
 const relatedSources=SOURCE_IDS.map((id)=>({
  _key:id==='source-cei-1990-decreto-generale-matrimonio-canonico'?'cei-decreto-matrimonio-1990':'mitis-iudex-2015',
  _type:'reference',
  _ref:id,
 }))

 console.log(`MATRIMONIO CANONICO · ${dryRun?'DRY RUN':'PATCH'}`)
 console.log(`Canoni: ${CANON_START}-${CANON_END} · ${canons.length}/${expectedCount}`)
 console.log(`Fonti: ${SOURCE_IDS.map((id)=>sourceById.get(id)?.title).join(' · ')}`)
 console.log('Bibliografia scientifica: gestita esclusivamente tramite bibliographicItem')
 if(dryRun)return

 await client.patch(ID)
  .set({relatedCanons,relatedSources})
  .commit({visibility:'sync'})

 const readback=await client.fetch(
  `*[_id==$id][0]{_id,label,"canoni":relatedCanons[]->number,"fonti":relatedSources[]->{_id,title},"bibliographyDefined":defined(bibliography)}`,
  {id:ID},
 ) as any
 if(!readback)throw new Error('Read-back mancante')
 if(readback.canoni?.length!==expectedCount)throw new Error(`Read-back canoni incompleto: ${readback.canoni?.length||0}/${expectedCount}`)
 const readbackSourceIds=(readback.fonti||[]).map((s:any)=>s._id).sort()
 const expectedSourceIds=[...SOURCE_IDS].sort()
 if(JSON.stringify(readbackSourceIds)!==JSON.stringify(expectedSourceIds))throw new Error('Read-back fonti incompleto')
 if(readback.bibliographyDefined)throw new Error('Read-back non conforme: bibliography inline legacy presente')

 console.log(JSON.stringify(readback,null,2))
 console.log('PATCH OK · relazioni Matrimonio canonico aggiornate · bibliography inline assente')
}

main().catch((error)=>{
 console.error(error)
 process.exit(1)
})
