import {getCliClient} from 'sanity/cli'

const client=getCliClient({apiVersion:'2026-03-25'})
const VERSION_ID='version-cic-1983-can-699-it-2026'

async function main(){
  console.log('\nAUDIT INBOUND — CAN. 699 VERSIONE 2026 — PRODUCTION — SOLA LETTURA')
  const version:any=await client.fetch('*[_id==$id&&_type=="canonVersion"][0]{_id,versionId,status,language,validFrom,validUntil}',{id:VERSION_ID})
  if(!version)throw new Error(`Versione ${VERSION_ID} non trovata`)
  console.log(`✔ ${version.versionId} | ${version.status} | ${version.language} | ${version.validFrom??'∅'}→${version.validUntil??'∅'}`)

  const refs:any[]=await client.fetch('*[references($id)]{_id,_type,title,name,documentId,relationId,versionId,segmentId,label,"canonNumber":canon->number,"versionRef":version._ref,"sourceRef":source._ref,"targetRef":target._ref,"sourceDocumentRef":sourceDocument._ref,"previousVersionRef":previousVersion._ref}|order(_type asc,_id asc)',{id:VERSION_ID})
  console.log(`Riferimenti entranti: ${refs.length}`)
  for(const r of refs){
    console.log(`\n- _id=${r._id}`)
    console.log(`  _type=${r._type}`)
    if(r.title)console.log(`  title=${r.title}`)
    if(r.name)console.log(`  name=${r.name}`)
    if(r.documentId)console.log(`  documentId=${r.documentId}`)
    if(r.relationId)console.log(`  relationId=${r.relationId}`)
    if(r.versionId)console.log(`  versionId=${r.versionId}`)
    if(r.segmentId)console.log(`  segmentId=${r.segmentId}`)
    if(r.label)console.log(`  label=${r.label}`)
    if(r.canonNumber)console.log(`  canonNumber=${r.canonNumber}`)
    if(r.versionRef)console.log(`  versionRef=${r.versionRef}`)
    if(r.sourceRef)console.log(`  sourceRef=${r.sourceRef}`)
    if(r.targetRef)console.log(`  targetRef=${r.targetRef}`)
    if(r.sourceDocumentRef)console.log(`  sourceDocumentRef=${r.sourceDocumentRef}`)
    if(r.previousVersionRef)console.log(`  previousVersionRef=${r.previousVersionRef}`)
  }

  console.log('\nAUDIT COMPLETATO — nessuna scrittura eseguita')
}

main().catch(e=>{console.error('\n✖ AUDIT INBOUND FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
