import {createClient} from '@sanity/client'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const client = createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false})
const CANONICAL_PATH = join(process.cwd(),'scripts/fontes-canonical/data/de-concordia-inter-codices/canonical.json')

type Effect={article:string;canon:number;locator:string|null;effect:string}

async function main(){
  console.log('\nPREFLIGHT DE CONCORDIA — PRODUCTION — SOLA LETTURA')
  const canonical=JSON.parse(await readFile(CANONICAL_PATH,'utf8'))
  const effects:Effect[]=canonical.effects
  const numbers=[...new Set(effects.map(e=>e.canon))]
  let errors=0
  let warnings=0

  console.log(`Documento: ${canonical.documentId}`)
  console.log(`Effetti canonici: ${effects.length}`)
  if(effects.length!==11){console.log('✖ Canonical atteso con 11 effetti');errors++}
  if(canonical.effectiveFrom){console.log(`⚠ effectiveFrom già valorizzato: ${canonical.effectiveFrom}`);warnings++}
  else console.log('✔ effectiveFrom non valorizzato: verifica giuridica ancora separata')

  const existingSource=await client.fetch('*[_type=="sourceDocument" && documentId==$id]{_id,documentId,title}',{id:canonical.documentId})
  console.log(`sourceDocument De concordia esistenti: ${existingSource.length}`)
  if(existingSource.length){console.log('✖ Collisione sourceDocument');errors++}

  const canons:any[]=await client.fetch('*[_type=="canon" && number in $numbers]{_id,number,canonicalId}|order(number asc)',{numbers})
  const canonByNumber=new Map(canons.map(c=>[c.number,c]))
  for(const number of numbers){
    const c=canonByNumber.get(number)
    if(!c){console.log(`✖ Can. ${number}: assente`);errors++;continue}
    if(c.canonicalId!==`cic-1983-can-${number}`){console.log(`✖ Can. ${number}: canonicalId inatteso ${c.canonicalId}`);errors++}
    else console.log(`✔ Can. ${number}: ${c._id}`)
  }

  const canonIds=canons.map(c=>c._id)
  const versions:any[]=await client.fetch('*[_type=="canonVersion" && canon._ref in $ids]{_id,versionId,versionLabel,status,validFrom,validUntil,language,"canonId":canon._ref,"sourceDocumentId":sourceDocument._ref}|order(canonId asc,validFrom asc)',{ids:canonIds})
  const versionsByCanon=new Map<string,any[]>()
  for(const v of versions) versionsByCanon.set(v.canonId,[...(versionsByCanon.get(v.canonId)||[]),v])

  console.log('\nVERSIONI ESISTENTI')
  for(const number of numbers){
    const c=canonByNumber.get(number); if(!c) continue
    const vs=versionsByCanon.get(c._id)||[]
    console.log(`Can. ${number}: ${vs.length} versione/i`)
    if(!vs.length){console.log('  ✖ nessuna canonVersion');errors++;continue}
    for(const v of vs) console.log(`  - ${v.versionId} | ${v.language} | ${v.status} | ${v.validFrom||'∅'} → ${v.validUntil||'∅'}`)
    const current=vs.filter(v=>v.status==='current')
    if(current.length!==1){console.log(`  ⚠ versioni status=current: ${current.length} (attesa 1)`);warnings++}
  }

  console.log('\nSEGMENTI RICHIESTI DAGLI 11 EFFETTI')
  for(const effect of effects){
    const c=canonByNumber.get(effect.canon)
    if(!c){continue}
    if(!effect.locator){console.log(`Art. ${effect.article} — Can. ${effect.canon}: intero canone (${effect.effect})`);continue}
    const segs:any[]=await client.fetch('*[_type=="canonSegment" && canon._ref==$canonId]{_id,segmentId,label,segmentType,"versionId":version->versionId,"parentLabel":parentSegment->label}',{canonId:c._id})
    const wanted=effect.locator.replace(/\s/g,'').toLowerCase()
    const matches=segs.filter(s=>{
      const label=String(s.label||'').replace(/\s/g,'').toLowerCase()
      if(wanted==='§2'||wanted==='§3'||wanted==='§1') return label===wanted
      if(wanted==='§1,2°') return label==='2°' || label==='2' || String(s.segmentId||'').endsWith('-n2')
      return false
    })
    console.log(`Art. ${effect.article} — Can. ${effect.canon} ${effect.locator}: ${matches.length} segmento/i candidato/i`)
    for(const s of matches) console.log(`  - ${s.segmentId} | ${s.label} | ${s.versionId} | parent=${s.parentLabel||'∅'}`)
    if(!matches.length){console.log('  ⚠ locator non risolto su segmenti esistenti');warnings++}
  }

  const relationCollisions:any[]=await client.fetch('*[_type=="legalRelation" && (relationId match "*de-concordia*" || sourceDocument->documentId==$id)]{_id,relationId,relationType}',{id:canonical.documentId})
  console.log(`\nRelazioni De concordia già presenti: ${relationCollisions.length}`)
  if(relationCollisions.length){for(const r of relationCollisions) console.log(`  - ${r._id} ${r.relationId||'∅'} ${r.relationType||'∅'}`);errors++}

  console.log(`\nErrori bloccanti: ${errors}`)
  console.log(`Avvisi da esaminare: ${warnings}`)
  if(errors===0) console.log('✔ PREFLIGHT TECNICO DE CONCORDIA SUPERATO')
  else console.log('✖ PREFLIGHT TECNICO DE CONCORDIA NON SUPERATO')
  console.log('Nessuna scrittura eseguita.')
  if(errors) process.exitCode=1
}

main().catch(e=>{console.error('\n✖ ERRORE TECNICO');console.error(e);process.exit(1)})
