import {getCliClient} from 'sanity/cli'
const client=getCliClient({apiVersion:'2026-03-25'})
async function main(){
 console.log('FONTES — PREFLIGHT FINALE CORPUS DOCUMENTALE')
 const docs=await client.fetch(`*[_type=='sourceDocument']|order(title asc){_id,title,documentId,sourceText,officialUrl,effectiveFrom,status,snapshot}`)
 const provisions=await client.fetch(`*[_type=='italianProvision']{_id,title,'sourceId':sourceDocument->_id}`)
 const relations=await client.fetch(`*[_type=='legalRelation']{_id,verified,sourceDocument}`)
 const errors:string[]=[]
 console.log(`sourceDocument: ${docs.length}`)
 for(const d of docs){
  const len=typeof d.sourceText==='string'?d.sourceText.trim().length:0
  const core=!!d.documentId&&!!d.title&&!!d.status
  const ok=len>0&&core
  console.log(`${ok?'✔':'✘'} ${d.title||d._id} · testo=${len} · documentId=${d.documentId||'MANCANTE'} · status=${d.status||'MANCANTE'}`)
  if(!ok) errors.push(`${d.title||d._id}: ${!len?'testo mancante; ':''}${!core?'core incompleto':''}`)
 }
 const orphan=provisions.filter((p:any)=>!p.sourceId)
 if(orphan.length) errors.push(`italianProvision orfane: ${orphan.length}`)
 const unverified=relations.filter((r:any)=>r.verified!==true)
 console.log(`italianProvision: ${provisions.length} · orfane=${orphan.length}`)
 console.log(`legalRelation: ${relations.length} · non verificate=${unverified.length}`)
 if(errors.length){console.error('\n✘ PREFLIGHT FALLITO');for(const e of errors)console.error(`- ${e}`);process.exit(1)}
 console.log('\n✔ TUTTI I SOURCE DOCUMENT HANNO TESTO INTERNO + CORE')
 console.log('✔ PREFLIGHT FINALE SUPERATO')
}
main().catch(e=>{console.error(`✘ ${e instanceof Error?e.message:String(e)}`);process.exit(1)})
