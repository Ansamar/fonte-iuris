import {createClient} from '@sanity/client'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/de-concordia-inter-codices')
const DATA=join(ROOT,'canonical.json')
const SOURCE_DOC_ID='source-francis-2016-de-concordia-inter-codices'
const EFFECTIVE='2016-12-16'

const norm=(v:any)=>String(v??'').replace(/\s/g,'').toLowerCase()
function relationId(article:string,canon:number){return `francis-2016-de-concordia-inter-codices-art-${article}-can-${canon}`}

async function resolveTarget(effect:any){
  const canon:any=await client.fetch('*[_type=="canon"&&number==$n][0]{_id,number,canonicalId}',{n:effect.canon})
  if(!canon||canon.canonicalId!==`cic-1983-can-${effect.canon}`)throw new Error(`Can. ${effect.canon}: canone non risolto`)
  const currents:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id&&language=="it"&&status=="current"]{_id,versionId,validFrom}',{id:canon._id})
  if(currents.length!==1)throw new Error(`Can. ${effect.canon}: versioni current IT=${currents.length}`)
  const current=currents[0]
  if(current.validFrom!==EFFECTIVE)throw new Error(`Can. ${effect.canon}: current validFrom=${current.validFrom??'∅'}, atteso ${EFFECTIVE}`)
  if(!effect.locator)return {targetId:current._id,targetLabel:current.versionId,targetType:'canonVersion'}
  const segs:any[]=await client.fetch('*[_type=="canonSegment"&&version._ref==$v]{_id,segmentId,label,segmentType,"parentLabel":parentSegment->label}',{v:current._id})
  const wanted=norm(effect.locator)
  let matches:any[]=[]
  if(wanted==='§1,2°')matches=segs.filter(s=>(norm(s.label)==='2)'||norm(s.label)==='2°'||norm(s.label)==='2'||String(s.segmentId||'').endsWith('-num-2')||String(s.segmentId||'').endsWith('-n2'))&&norm(s.parentLabel)==='§1')
  else matches=segs.filter(s=>norm(s.label)===wanted)
  if(matches.length!==1)throw new Error(`Can. ${effect.canon} ${effect.locator}: segmenti target=${matches.length}`)
  return {targetId:matches[0]._id,targetLabel:`${current.versionId} / ${matches[0].label}`,targetType:'canonSegment'}
}

async function main(){
  console.log('\nIMPORT DE CONCORDIA — DRY RUN — PRODUCTION — NESSUNA SCRITTURA')
  const canonical=JSON.parse(await readFile(DATA,'utf8'))
  if(canonical.documentId!=='francis-2016-de-concordia-inter-codices')throw new Error(`documentId inatteso: ${canonical.documentId}`)
  if(canonical.effectiveFrom!==EFFECTIVE)throw new Error(`effectiveFrom inatteso: ${canonical.effectiveFrom}`)
  if(!Array.isArray(canonical.effects)||canonical.effects.length!==11)throw new Error(`Effetti attesi 11, trovati ${canonical.effects?.length??0}`)
  if(!canonical.snapshot?.sha256||!canonical.snapshot?.sourceUrl)throw new Error('Snapshot canonico incompleto')

  let errors=0
  const existingSource:any[]=await client.fetch('*[_type=="sourceDocument"&&(_id==$docId||documentId==$documentId)]{_id,documentId}',{docId:SOURCE_DOC_ID,documentId:canonical.documentId})
  if(existingSource.length){console.log(`✖ sourceDocument collisione: ${existingSource.map(x=>x._id).join(', ')}`);errors++}else console.log(`✔ sourceDocument CREATE ${SOURCE_DOC_ID} — effectiveFrom=${EFFECTIVE}`)

  let relationCount=0
  for(const effect of canonical.effects){
    const id=relationId(effect.article,effect.canon)
    const existing:any[]=await client.fetch('*[_type=="legalRelation"&&(_id==$docId||relationId==$relationId)]{_id,relationId}',{docId:`relation-${id}`,relationId:id})
    if(existing.length){console.log(`✖ Art. ${effect.article} — Can. ${effect.canon}: collisione relazione ${existing.map(x=>x._id).join(', ')}`);errors++;continue}
    try{
      const target=await resolveTarget(effect)
      const relationType=effect.effect==='replaces'?'replaces':'integrates'
      console.log(`✔ Art. ${effect.article} — Can. ${effect.canon}${effect.locator?` ${effect.locator}`:''}: ${relationType} → ${target.targetType} ${target.targetLabel}`)
      console.log(`  relationId=${id}`)
      relationCount++
    }catch(e){console.log(`✖ Art. ${effect.article} — Can. ${effect.canon}: ${e instanceof Error?e.message:e}`);errors++}
  }

  console.log('\nPIANO DI SCRITTURA')
  console.log(`sourceDocument da creare: ${existingSource.length?0:1}`)
  console.log(`legalRelation da creare: ${relationCount}`)
  console.log(`effectiveFrom: ${EFFECTIVE}`)
  console.log(`Errori bloccanti: ${errors}`)
  console.log('0 scritture eseguite su production.')
  if(errors){console.log('✖ DRY RUN DE CONCORDIA NON SUPERATO');process.exitCode=1}else console.log('✔ DRY RUN DE CONCORDIA SUPERATO — 1 fonte + 11 relazioni pronte')
}

main().catch(e=>{console.error('\n✖ DRY RUN DE CONCORDIA FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
