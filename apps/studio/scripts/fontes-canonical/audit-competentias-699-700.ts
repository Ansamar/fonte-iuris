import {createClient} from '@sanity/client'

const client=createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false})
const NUMBERS=[699,700]

function portableText(blocks:any[]|undefined){
  if(!Array.isArray(blocks)) return ''
  return blocks.map(b=>Array.isArray(b.children)?b.children.map((c:any)=>c.text||'').join(''):'').filter(Boolean).join('\n')
}

async function main(){
  console.log('\nAUDIT COMPETENTIAS — CAN. 699–700 — PRODUCTION — SOLA LETTURA')
  const canons:any[]=await client.fetch('*[_type=="canon" && number in $numbers]{_id,number,canonicalId}|order(number asc)',{numbers:NUMBERS})

  for(const canon of canons){
    console.log(`\n============================================================`)
    console.log(`CAN. ${canon.number} — canonId=${canon._id} — canonicalId=${canon.canonicalId}`)

    const versions:any[]=await client.fetch('*[_type=="canonVersion" && canon._ref==$canonId]{_id,versionId,versionLabel,status,language,validFrom,validUntil,"previousVersionId":previousVersion._ref,"sourceDocumentId":sourceDocument._ref,fullText}|order(validFrom asc,versionId asc)',{canonId:canon._id})
    console.log(`VERSIONI: ${versions.length}`)

    for(const version of versions){
      console.log(`\n- _id=${version._id}`)
      console.log(`  versionId=${version.versionId}`)
      console.log(`  label=${version.versionLabel??'∅'}`)
      console.log(`  status=${version.status??'∅'} language=${version.language??'∅'}`)
      console.log(`  valid=${version.validFrom??'∅'} → ${version.validUntil??'∅'}`)
      console.log(`  previousVersion=${version.previousVersionId??'∅'}`)
      console.log(`  sourceDocument=${version.sourceDocumentId??'∅'}`)
      console.log(`  text=${portableText(version.fullText)||'[vuoto]'}`)

      const segments:any[]=await client.fetch('*[_type=="canonSegment" && version._ref==$versionId]{_id,segmentId,label,segmentType,order,startOffset,endOffset,"parentId":parentSegment._ref}|order(order asc)',{versionId:version._id})
      console.log(`  segmenti=${segments.length}`)
      for(const s of segments){
        console.log(`    • ${s._id} | ${s.segmentId} | ${s.label??'∅'} | ${s.segmentType} | order=${s.order} | offsets=${s.startOffset??'∅'}-${s.endOffset??'∅'} | parent=${s.parentId??'∅'}`)
      }
    }
  }

  const missing=NUMBERS.filter(n=>!canons.some(c=>c.number===n))
  for(const n of missing) console.log(`\n✖ Can. ${n} assente in production`)

  console.log('\nAUDIT COMPLETATO — nessuna scrittura eseguita')
}

main().catch(e=>{console.error('\n✖ AUDIT FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
