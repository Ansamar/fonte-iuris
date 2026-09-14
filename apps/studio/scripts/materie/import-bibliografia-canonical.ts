import {getCliClient} from 'sanity/cli'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

type InputItem={
  _id:string
  _type:'bibliographicItem'
  title:string
  authors?:string[]
  publicationType?:string
  year?:number
  publisher?:string
  citation?:string
  url?:string
  notes?:string
  relatedCanonNumbers?:number[]
  relatedConceptIds?:string[]
}

type Ref={_key:string;_type:'reference';_ref:string}

function uniqRefs(refs:Ref[]){
  const seen=new Set<string>()
  return refs.filter((ref)=>{
    if(seen.has(ref._ref))return false
    seen.add(ref._ref)
    return true
  })
}

function refKey(prefix:string,id:string){
  return `${prefix}-${id.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,72)}`
}

async function main(){
  const client=getCliClient({apiVersion:'2026-03-25'}).withConfig({
    projectId:'2rq93txn',
    dataset:'production',
    useCdn:false,
    perspective:'raw',
  })
  const dryRun=process.argv.includes('--dry-run')
  const input=process.argv.find((arg)=>arg.endsWith('.json'))
  if(!input)throw new Error('File JSON mancante')

  const items=JSON.parse(readFileSync(resolve(process.cwd(),input),'utf8')) as InputItem[]
  if(!Array.isArray(items)||!items.length)throw new Error('Il file canonico deve contenere un array non vuoto')

  const ids=new Set<string>()
  for(const [i,item] of items.entries()){
    if(!item._id||item._type!=='bibliographicItem'||!item.title)throw new Error(`Voce ${i+1}: campi obbligatori mancanti`)
    if(ids.has(item._id))throw new Error(`ID duplicato nel batch: ${item._id}`)
    ids.add(item._id)
  }

  const canonNumbers=[...new Set(items.flatMap((item)=>item.relatedCanonNumbers??[]))].sort((a,b)=>a-b)
  const canons=await client.fetch<Array<{_id:string;number:number}>>(
    `*[_type=='canon' && number in $numbers]{_id,number}`,
    {numbers:canonNumbers},
  )
  const canonByNumber=new Map(canons.map((canon)=>[canon.number,canon]))
  const missingCanons=canonNumbers.filter((number)=>!canonByNumber.has(number))
  if(missingCanons.length)throw new Error(`Canoni mancanti: ${missingCanons.join(', ')}`)

  const conceptIds=[...new Set(items.flatMap((item)=>item.relatedConceptIds??[]))]
  const concepts=await client.fetch<Array<{_id:string;label:string}>>(
    `*[_type=='legalConcept' && _id in $ids]{_id,label}`,
    {ids:conceptIds},
  )
  const conceptById=new Map(concepts.map((concept)=>[concept._id,concept]))
  const missingConcepts=conceptIds.filter((id)=>!conceptById.has(id))
  if(missingConcepts.length)throw new Error(`Concetti mancanti: ${missingConcepts.join(', ')}`)

  const prepared=[] as any[]
  for(const item of items){
    const duplicate=await client.fetch<{_id:string;title:string}|null>(
      `*[_type=='bibliographicItem' && title==$title && _id!=$id][0]{_id,title}`,
      {title:item.title,id:item._id},
    )
    if(duplicate)throw new Error(`${item.title}: esiste già con ID diverso (${duplicate._id})`)

    const existing=await client.getDocument(item._id) as any
    const existingCanonRefs=Array.isArray(existing?.relatedCanons)?existing.relatedCanons:[]
    const existingConceptRefs=Array.isArray(existing?.relatedConcepts)?existing.relatedConcepts:[]
    const intendedCanonRefs=(item.relatedCanonNumbers??[]).map((number)=>({
      _key:refKey('can',String(number)),
      _type:'reference' as const,
      _ref:canonByNumber.get(number)!._id,
    }))
    const intendedConceptRefs=(item.relatedConceptIds??[]).map((id)=>({
      _key:refKey('concept',id),
      _type:'reference' as const,
      _ref:id,
    }))

    const {
      relatedCanonNumbers,
      relatedConceptIds,
      ...core
    }=item

    const doc={
      ...(existing??{}),
      ...core,
      relatedCanons:uniqRefs([...existingCanonRefs,...intendedCanonRefs]),
      relatedConcepts:uniqRefs([...existingConceptRefs,...intendedConceptRefs]),
    }
    prepared.push(doc)

    console.log(`${existing?'UPDATE':'CREATE'} · ${item.title}`)
    console.log(`  Canoni collegati: ${intendedCanonRefs.length}`)
    console.log(`  Concetti collegati: ${(item.relatedConceptIds??[]).map((id)=>conceptById.get(id)?.label??id).join(' · ')}`)
  }

  console.log(`VALIDAZIONE OK · ${prepared.length} voci bibliografiche · ${dryRun?'DRY RUN':'IMPORT'}`)
  if(dryRun){
    console.log('Nessuna scrittura eseguita.')
    return
  }

  let tx=client.transaction()
  for(const doc of prepared)tx=tx.createOrReplace(doc)
  const result=await tx.commit({visibility:'sync'})

  const readback=await client.fetch<Array<{_id:string;title:string;canons:number[];concepts:string[]}>>(
    `*[_type=='bibliographicItem' && _id in $ids]{_id,title,"canons":relatedCanons[]->number,"concepts":relatedConcepts[]->_id}`,
    {ids:[...ids]},
  )
  if(readback.length!==prepared.length)throw new Error(`Read-back incompleto: ${readback.length}/${prepared.length}`)
  for(const item of items){
    const row=readback.find((doc)=>doc._id===item._id)
    if(!row)throw new Error(`Read-back mancante: ${item._id}`)
    for(const number of item.relatedCanonNumbers??[]){
      if(!(row.canons??[]).includes(number))throw new Error(`${item._id}: canone ${number} non collegato`)
    }
    for(const id of item.relatedConceptIds??[]){
      if(!(row.concepts??[]).includes(id))throw new Error(`${item._id}: concetto ${id} non collegato`)
    }
  }

  console.log(`IMPORT OK · transaction ${result.transactionId} · read-back ${readback.length}/${prepared.length}`)
}

main().catch((error)=>{
  console.error(error)
  process.exit(1)
})
