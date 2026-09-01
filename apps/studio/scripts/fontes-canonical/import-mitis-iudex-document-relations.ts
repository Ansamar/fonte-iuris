import {getCliClient} from 'sanity/cli'
import {client as readClient} from '../import-cic/client'

const commitMode=process.argv.includes('--commit')
const client=commitMode?getCliClient({apiVersion:'2026-03-25'}):readClient
const docId='mitis-iudex-dominus-iesus-2015'
const sanityDocId='source-mitis-iudex-dominus-iesus-2015'
const officialUrl='https://www.vatican.va/content/francesco/it/motu_proprio/documents/papa-francesco-motu-proprio_20150815_mitis-iudex-dominus-iesus.html'
const sha256='70ad03b15a7894d4a29b0db756eec99429703deac918f49ffbb9c2c892be4879'

async function main(){
 console.log(`\nMITIS IUDEX — DOCUMENT + 21 REPLACEMENT RELATIONS — ${commitMode?'IMPORT':'DRY RUN'}`)
 const existingDoc=await client.fetch(`*[_type=='sourceDocument' && documentId==$id][0]{_id}`,{id:docId})
 const document={
  _id:existingDoc?._id??sanityDocId,_type:'sourceDocument',documentId,
  title:'Mitis Iudex Dominus Iesus',shortTitle:'Mitis Iudex',documentType:'motuProprio',issuer:'Papa Francesco',
  issuedAt:'2015-08-15',effectiveFrom:'2015-12-08',territorialScope:'universal',legalForce:'normative',status:'inForce',language:'it',
  officialCitation:'Litterae Apostolicae Motu Proprio datae Mitis Iudex Dominus Iesus, 15 agosto 2015',officialUrl,
  snapshot:{sourceUrl:officialUrl,sha256,path:'scripts/fontes-canonical/data/mitis-iudex/sources/mitis-iudex.official.html'},
  canonicalDataVersion:'1',notes:'Riforma del processo canonico per le cause di dichiarazione di nullità del matrimonio. Sostituisce integralmente i cann. 1671–1691 con efficacia dal 2015-12-08.'
 }
 console.log(`${existingDoc?'UPDATE':'CREATE'} sourceDocument — ${docId}`)
 if(commitMode){if(existingDoc)await client.patch(existingDoc._id).set(document).commit();else await client.createIfNotExists(document)}
 let create=0,update=0
 for(let n=1671;n<=1691;n++){
  const canon=await client.fetch(`*[_type=='canon' && canonicalId==$id][0]{_id}`,{id:`cic-1983-can-${n}`})
  if(!canon)throw new Error(`Can. ${n}: canon non trovato`)
  const relationId=`mitis-iudex-replaces-can-${n}`
  const existing=await client.fetch(`*[_type=='legalRelation' && relationId==$id][0]{_id}`,{id:relationId})
  const fields={relationId,source:{_type:'reference',_ref:document._id},target:{_type:'reference',_ref:canon._id},relationType:'replaces',authorityLevel:'official',validFrom:'2015-12-08',sourceDocument:{_type:'reference',_ref:document._id},officialCitation:`Mitis Iudex Dominus Iesus — Can. ${n}`,note:`Sostituzione integrale del can. ${n} con efficacia dal 2015-12-08.`,verified:true}
  console.log(`${existing?'UPDATE':'CREATE'} relation — Can. ${n}`);existing?update++:create++
  if(commitMode){const rid=existing?._id??`relation-${relationId}`;if(!existing)await client.createIfNotExists({_id:rid,_type:'legalRelation',...fields});else await client.patch(rid).set(fields).commit()}
 }
 console.log(`\n✔ sourceDocument risolto`)
 console.log(`✔ 21/21 relazioni di sostituzione risolte`)
 console.log(`✔ CREATE: ${create} · UPDATE: ${update}`)
 console.log(commitMode?'✔ IMPORT COMPLETATO':'✔ DRY RUN COMPLETATO — nessuna scrittura effettuata')
}
main().catch(e=>{console.error('\n✖ OPERAZIONE FALLITA');console.error(e instanceof Error?e.message:e);process.exit(1)})
