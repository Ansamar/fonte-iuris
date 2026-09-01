import {createClient} from '@sanity/client'

const client=createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false})
const NUMBERS=[868,1111,1112,1116]

function portableText(blocks:any[]|undefined){
  if(!Array.isArray(blocks)) return ''
  return blocks.map(b=>Array.isArray(b.children)?b.children.map((c:any)=>c.text||'').join(''):'').filter(Boolean).join('\n')
}

async function main(){
  console.log('\nAUDIT DE CONCORDIA — 4 CANONI — SOLA LETTURA')
  const canons:any[]=await client.fetch('*[_type=="canon" && number in $numbers]{_id,number,canonicalId}|order(number asc)',{numbers:NUMBERS})
  let issues=0
  for(const canon of canons){
    console.log(`\n============================================================`)
    console.log(`CAN. ${canon.number} — ${canon.canonicalId}`)
    const versions:any[]=await client.fetch('*[_type=="canonVersion" && canon._ref==$canonId]{_id,versionId,versionLabel,status,language,validFrom,validUntil,fullText}|order(versionId asc)',{canonId:canon._id})
    for(const version of versions){
      console.log(`\nVERSIONE: ${version.versionId}`)
      console.log(`status=${version.status} language=${version.language} valid=${version.validFrom||'∅'} → ${version.validUntil||'∅'}`)
      console.log('TESTO:')
      console.log(portableText(version.fullText)||'[testo non leggibile/assente]')
      const segments:any[]=await client.fetch('*[_type=="canonSegment" && canon._ref==$canonId && version._ref==$versionId]{_id,segmentId,label,segmentType,order,startOffset,endOffset,isFormalDivision,"parentId":parentSegment._ref,"parentLabel":parentSegment->label}|order(order asc)',{canonId:canon._id,versionId:version._id})
      console.log(`SEGMENTI: ${segments.length}`)
      if(!segments.length){console.log('  [nessun segmento]');issues++}
      for(const s of segments){
        console.log(`  - ${s.segmentId} | ${s.label} | ${s.segmentType} | order=${s.order} | parent=${s.parentLabel||'∅'} | offsets=${s.startOffset??'∅'}-${s.endOffset??'∅'}`)
      }
    }
    if(!versions.length){console.log('\n✖ Nessuna canonVersion');issues++}
  }
  const missing=NUMBERS.filter(n=>!canons.some(c=>c.number===n))
  for(const n of missing){console.log(`\n✖ Can. ${n} assente`);issues++}
  console.log(`\nAudit completato. Anomalie strutturali minime rilevate: ${issues}`)
  console.log('Nessuna scrittura eseguita.')
}
main().catch(e=>{console.error('\n✖ ERRORE TECNICO');console.error(e);process.exit(1)})
