import {getCliClient} from 'sanity/cli'

const client=getCliClient({apiVersion:'2026-03-25'})
const TARGETS=[237,242,265,1308,1310]

function ptText(blocks:any[]|undefined){return (blocks||[]).map(b=>(b.children||[]).map((c:any)=>c.text||'').join('')).filter(Boolean).join('\n').trim()}

async function main(){
  console.log('\nAUDIT COMPETENTIAS — TARGET TEMPORALI MANCANTI — PRODUCTION — SOLA LETTURA')
  for(const n of TARGETS){
    const canon:any=await client.fetch('*[_type=="canon"&&number==$n][0]{_id,number,canonicalId}',{n})
    if(!canon){console.log(`\n✖ Can. ${n}: canone assente`);continue}
    const versions:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id]{_id,versionId,versionLabel,status,language,validFrom,validUntil,"sourceRef":sourceDocument._ref,fullText}|order(validFrom asc)',{id:canon._id})
    console.log(`\nCan. ${n} — versioni=${versions.length}`)
    for(const v of versions){
      const segs:any[]=await client.fetch('*[_type=="canonSegment"&&version._ref==$id]{_id,segmentId,label,segmentType,startOffset,endOffset}|order(order asc)',{id:v._id})
      const inbound:number=await client.fetch('count(*[references($id)])',{id:v._id})
      console.log(`- ${v.versionId} | ${v.status} | ${v.language} | ${v.validFrom??'∅'}→${v.validUntil??'∅'} | source=${v.sourceRef??'∅'} | segments=${segs.length} | inbound=${inbound}`)
      const text=ptText(v.fullText).replace(/\s+/g,' ').trim()
      console.log(`  text=${text.slice(0,500)}${text.length>500?'…':''}`)
      for(const s of segs)console.log(`  segment ${s.segmentId} | ${s.label??'∅'} | ${s.segmentType} | ${s.startOffset??'∅'}-${s.endOffset??'∅'}`)
    }
    const refs:any[]=await client.fetch('*[_type=="legalRelation"&&((source._ref in $ids)||(target._ref in $ids))]{_id,relationId,relationType,"source":source._ref,"target":target._ref,validFrom,validUntil}',{ids:versions.map(v=>v._id)})
    if(refs.length){console.log(`  legalRelations=${refs.length}`);for(const r of refs)console.log(`    ${r.relationId??r._id} | ${r.relationType} | ${r.source} → ${r.target} | ${r.validFrom??'∅'}→${r.validUntil??'∅'}`)}
  }
  console.log('\nAUDIT COMPLETATO — nessuna scrittura eseguita')
}
main().catch(e=>{console.error('\n✖ AUDIT FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
