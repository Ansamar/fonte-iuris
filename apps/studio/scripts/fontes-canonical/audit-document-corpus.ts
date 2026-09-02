import {client} from '../import-cic/client'

type SourceDoc={_id:string;documentId?:string;title?:string;documentType?:string;issuer?:string;effectiveFrom?:string;status?:string;officialUrl?:string;sourceText?:string;snapshot?:{sourceUrl?:string;sha256?:string;path?:string}}
type Provision={_id:string;provisionId?:string;title?:string;legalVerification?:string;summary?:string;normativeText?:string;sourceDocument?:{_ref?:string}}
type Relation={_id:string;relationId?:string;relationType?:string;sourceDocument?:{_ref?:string};verified?:boolean}
const clean=(v?:string)=>String(v??'').replace(/\s+/g,' ').trim()
const key=(v?:string)=>clean(v).toLocaleLowerCase('it')

async function main(){
  console.log('\nFONTE IURIS — INVENTARIO DOCUMENTALE READ-ONLY\n')
  const [sources,provisions,relations,counts]=await Promise.all([
    client.fetch<SourceDoc[]>(`*[_type=='sourceDocument']|order(title asc){_id,documentId,title,documentType,issuer,effectiveFrom,status,officialUrl,sourceText,snapshot}`),
    client.fetch<Provision[]>(`*[_type=='italianProvision']|order(title asc){_id,provisionId,title,legalVerification,summary,'normativeText':pt::text(normativeText),sourceDocument}`),
    client.fetch<Relation[]>(`*[_type=='legalRelation']{_id,relationId,relationType,sourceDocument,verified}`),
    client.fetch<any>(`{'canons':count(*[_type=='canon']),'canonVersions':count(*[_type=='canonVersion']),'canonSegments':count(*[_type=='canonSegment']),'sourceDocuments':count(*[_type=='sourceDocument']),'italianProvisions':count(*[_type=='italianProvision']),'legalRelations':count(*[_type=='legalRelation'])}`)
  ])

  console.log('=== CONSISTENZA GENERALE ===')
  Object.entries(counts).forEach(([k,v])=>console.log(`${k}=${v}`))

  const provisionBySource=new Map<string,Provision[]>()
  for(const p of provisions){const ref=p.sourceDocument?._ref;if(ref)provisionBySource.set(ref,[...(provisionBySource.get(ref)??[]),p])}
  const relsBySource=new Map<string,Relation[]>()
  for(const r of relations){const ref=r.sourceDocument?._ref;if(ref)relsBySource.set(ref,[...(relsBySource.get(ref)??[]),r])}

  const titleGroups=new Map<string,Array<{kind:string;id:string;title:string}>>()
  for(const s of sources){if(clean(s.title)){const k=key(s.title);titleGroups.set(k,[...(titleGroups.get(k)??[]),{kind:'sourceDocument',id:s._id,title:clean(s.title)}])}}
  for(const p of provisions){if(clean(p.title)){const k=key(p.title);titleGroups.set(k,[...(titleGroups.get(k)??[]),{kind:'italianProvision',id:p._id,title:clean(p.title)}])}}

  let complete=0,missingText=0,metadataProblems=0,noRelations=0
  console.log('\n=== SOURCE DOCUMENTS ===')
  for(const s of sources){
    const linked=provisionBySource.get(s._id)??[]
    const rels=relsBySource.get(s._id)??[]
    const hasText=clean(s.sourceText).length>0||linked.some(p=>clean(p.normativeText).length>0)
    const hasSnapshot=Boolean(s.snapshot?.sha256&&s.snapshot?.sourceUrl&&s.snapshot?.path)
    const hasCore=Boolean(s.documentId&&s.title&&s.issuer&&s.effectiveFrom&&s.status&&s.officialUrl&&hasSnapshot)
    const duplicated=(titleGroups.get(key(s.title))??[]).length>1
    const problems:string[]=[]
    if(!hasText)problems.push('TESTO_MANCANTE')
    if(!hasCore)problems.push('METADATI/PROVENIENZA_INCOMPLETI')
    if(rels.length===0)problems.push('NESSUNA_RELAZIONE')
    if(duplicated)problems.push('DOPPIO_RISULTATO_LOGICO')
    if(hasText&&hasCore)complete++;if(!hasText)missingText++;if(!hasCore)metadataProblems++;if(rels.length===0)noRelations++
    console.log(`\n${s.title??s._id}`)
    console.log(`  id=${s.documentId??'∅'} · tipo=${s.documentType??'∅'} · efficacia=${s.effectiveFrom??'∅'} · stato=${s.status??'∅'}`)
    console.log(`  testo=${hasText?'SI':'NO'} · snapshot=${hasSnapshot?'SI':'NO'} · relazioni=${rels.length} · provision=${linked.length}`)
    console.log(`  esito=${problems.length?problems.join(' | '):'COMPLETO'}`)
    for(const p of linked)console.log(`    ↳ italianProvision ${p.provisionId??p._id}: testo=${clean(p.normativeText).length?'SI':'NO'} · sintesi=${clean(p.summary).length?'SI':'NO'} · verifica=${p.legalVerification??'∅'}`)
  }

  const sourceIds=new Set(sources.map(s=>s._id))
  const orphans=provisions.filter(p=>!p.sourceDocument?._ref||!sourceIds.has(p.sourceDocument._ref))
  const duplicates=[...titleGroups.values()].filter(g=>g.length>1)
  const unverified=relations.filter(r=>r.verified!==true)

  console.log('\n=== ITALIAN PROVISIONS ORFANE ===')
  if(!orphans.length)console.log('nessuna'); else orphans.forEach(p=>console.log(`${p.title??p._id} · sourceDocument=${p.sourceDocument?._ref??'∅'}`))
  console.log('\n=== DUPLICAZIONI LOGICHE DI TITOLO ===')
  if(!duplicates.length)console.log('nessuna'); else duplicates.forEach(group=>{console.log(group[0].title);group.forEach(item=>console.log(`  - ${item.kind}: ${item.id}`))})
  console.log('\n=== RELAZIONI NON VERIFICATE ===')
  if(!unverified.length)console.log('nessuna'); else unverified.forEach(r=>console.log(`${r.relationId??r._id} · ${r.relationType??'∅'}`))

  console.log('\n=== RIEPILOGO DOCUMENTALE ===')
  console.log(`sourceDocument totali=${sources.length}`)
  console.log(`completi con testo+core=${complete}`)
  console.log(`testo mancante=${missingText}`)
  console.log(`metadati/provenienza incompleti=${metadataProblems}`)
  console.log(`senza relazioni=${noRelations}`)
  console.log(`duplicazioni logiche di titolo=${duplicates.length}`)
  console.log(`italianProvision orfane=${orphans.length}`)
  console.log(`legalRelation non verificate=${unverified.length}`)
  console.log('\n✔ AUDIT READ-ONLY COMPLETATO — nessuna scrittura effettuata')
}
main().catch(e=>{console.error('\n✖ AUDIT DOCUMENTALE FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
