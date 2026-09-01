import {createClient} from '@sanity/client'

const client=createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false})
const FIRST=1671
const LAST=1691
const EFFECTIVE='2015-12-08'
const LAST_OLD_DAY='2015-12-07'

async function main(){
  console.log('\nAUDIT READ-ONLY — MITIS IUDEX — CANN. 1671–1691 — PRODUCTION')
  console.log(`Data di efficacia di riferimento: ${EFFECTIVE}\n`)

  let errors=0
  let canonsFound=0
  let versionsTotal=0
  let segmentsTotal=0
  let with1983=0
  let with2015=0
  let undated=0

  for(let n=FIRST;n<=LAST;n++){
    const canon:any=await client.fetch('*[_type=="canon"&&number==$n][0]{_id,number,canonicalId}',{n})
    if(!canon){console.log(`✖ Can. ${n}: canon assente`);errors++;continue}
    canonsFound++
    if(canon.canonicalId!==`cic-1983-can-${n}`){console.log(`✖ Can. ${n}: canonicalId=${canon.canonicalId??'∅'}`);errors++}

    const versions:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id]{_id,versionId,status,language,validFrom,validUntil,fullText,previousVersion,sourceDocument}|order(language asc,validFrom asc)',{id:canon._id})
    versionsTotal+=versions.length

    let canonSegments=0
    for(const v of versions){
      const count:number=await client.fetch('count(*[_type=="canonSegment"&&version._ref==$id])',{id:v._id})
      v.segmentCount=count
      canonSegments+=count
    }
    segmentsTotal+=canonSegments

    const it=versions.filter(v=>v.language==='it')
    const old=it.filter(v=>v.validFrom==='1983-11-27'&&v.validUntil===LAST_OLD_DAY)
    const reform=it.filter(v=>v.validFrom===EFFECTIVE)
    const noDates=it.filter(v=>!v.validFrom)
    if(old.length===1)with1983++
    if(reform.length===1)with2015++
    if(noDates.length)undated++

    const state=old.length===1&&reform.length===1?'PRONTO':noDates.length?'DA MIGRARE':'DA RICOSTRUIRE'
    console.log(`Can. ${n} — ${state} — versioni=${versions.length} · segmenti=${canonSegments}`)
    if(!versions.length){console.log('  - nessuna canonVersion')}
    for(const v of versions){
      console.log(`  - ${v.versionId??v._id} | ${v.language??'∅'} | ${v.status??'∅'} | ${v.validFrom??'∅'} → ${v.validUntil??'∞'} | segmenti=${v.segmentCount}`)
    }
  }

  const sourceDocs:any[]=await client.fetch('*[_type=="sourceDocument"&&((title match "*Mitis Iudex*")||(shortTitle match "*Mitis Iudex*")||(documentId match "*mitis-iudex*"))]{_id,documentId,title,effectiveFrom,status}')
  const relations:any[]=await client.fetch('*[_type=="legalRelation"&&((sourceDocument->title match "*Mitis Iudex*")||(sourceDocument->documentId match "*mitis-iudex*"))]{_id,relationId,relationType,validFrom,target->{_id,_type}}')

  console.log('\nRIEPILOGO')
  console.log(`Canoni trovati: ${canonsFound}/21`)
  console.log(`canonVersion totali: ${versionsTotal}`)
  console.log(`canonSegment totali: ${segmentsTotal}`)
  console.log(`Canoni con versione IT 1983 chiusa al ${LAST_OLD_DAY}: ${with1983}/21`)
  console.log(`Canoni con versione IT dalla riforma ${EFFECTIVE}: ${with2015}/21`)
  console.log(`Canoni con almeno una versione IT senza validFrom: ${undated}/21`)
  console.log(`sourceDocument Mitis Iudex già presenti: ${sourceDocs.length}`)
  for(const d of sourceDocs)console.log(`  - ${d.documentId??d._id} | ${d.effectiveFrom??'∅'} | ${d.title??'∅'}`)
  console.log(`legalRelation Mitis Iudex già presenti: ${relations.length}`)
  console.log(`Errori strutturali: ${errors}`)
  console.log('\n✔ AUDIT READ-ONLY COMPLETATO — nessuna scrittura eseguita')
}

main().catch(e=>{console.error('\n✖ AUDIT MITIS IUDEX FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
