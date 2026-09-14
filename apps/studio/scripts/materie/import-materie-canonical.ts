import {getCliClient} from 'sanity/cli'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

const PORTABLE_TEXT_FIELDS = [
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

function normalizeSourceResearch(doc:any){
 if(doc.sourceResearch)return doc.sourceResearch
 const legacyStatus=doc.sourceVerificationStatus
 const legacyNote=doc.sourceNotes
 if(!legacyStatus&&!legacyNote)return undefined
 const status=legacyStatus==='official-primary'?'official-verified':'pending'
 return {
  _type:'sourceResearch',
  status,
  ...(legacyNote?{editorialNote:legacyNote}:{}),
 }
}

function normalizeDocument(input:any){
 const d={...input}
 if(!d.interpretation&&d.interpretationDoctrine)d.interpretation=d.interpretationDoctrine
 for(const field of PORTABLE_TEXT_FIELDS){
  if(d[field]!=null)d[field]=toPortableText(d[field],`${d.slug?.current||d._id}-${field}`)
 }
 const sourceResearch=normalizeSourceResearch(d)
 if(sourceResearch)d.sourceResearch=sourceResearch
 delete d.interpretationDoctrine
 delete d.sourceVerificationStatus
 delete d.sourceNotes
 delete d.bibliography
 return d
}

async function main(){
 const client=getCliClient({apiVersion:'2026-03-25'}).withConfig({dataset:'production',useCdn:false})
 const input=process.argv.find((arg)=>arg.endsWith('.json'))
 const dryRun=process.argv.includes('--dry-run')
 if(!input)throw new Error('File JSON mancante')
 const file=resolve(process.cwd(),input)
 const rawDocs=JSON.parse(readFileSync(file,'utf8'))
 if(!Array.isArray(rawDocs)||!rawDocs.length)throw new Error('Il file canonico deve contenere un array non vuoto')
 const docs=rawDocs.map(normalizeDocument)
 const ids=new Set<string>()
 for(const [i,d] of docs.entries()){
  if(!d._id||d._type!=='legalConcept'||!d.label||!d.slug?.current||!d.definition)throw new Error(`Documento ${i+1}: campi obbligatori mancanti`)
  if(ids.has(d._id))throw new Error(`ID duplicato nel batch: ${d._id}`)
  ids.add(d._id)
  if(d.broaderConcept?._ref===d._id)throw new Error(`${d._id}: broaderConcept autoreferenziale`)
  if('bibliography' in d)throw new Error(`${d._id}: bibliography inline non ammessa; usare documenti bibliographicItem`)
  for(const field of PORTABLE_TEXT_FIELDS){
   if(d[field]!=null&&!Array.isArray(d[field]))throw new Error(`${d._id}: ${field} non normalizzato`)
  }
 }
 console.log(`VALIDAZIONE OK · ${docs.length} materie · schema corrente · ${dryRun?'DRY RUN':'IMPORT'}`)
 if(dryRun)return
 let tx=client.transaction()
 for(const d of docs)tx=tx.createOrReplace(d)
 const result=await tx.commit({visibility:'sync'})
 const readback=await client.fetch(`*[_type=='legalConcept' && _id in $ids]{_id,label,slug,definition,systematicFramework,sourceResearch}`,{ids:[...ids]})
 if(readback.length!==docs.length)throw new Error(`Read-back incompleto: ${readback.length}/${docs.length}`)
 const invalid=readback.filter((d:any)=>d.systematicFramework!=null&&!Array.isArray(d.systematicFramework))
 if(invalid.length)throw new Error(`Read-back schema non conforme: ${invalid.map((d:any)=>d._id).join(', ')}`)
 console.log(`IMPORT OK · transaction ${result.transactionId} · read-back ${readback.length}/${docs.length}`)
}

main().catch((error)=>{
 console.error(error)
 process.exit(1)
})
