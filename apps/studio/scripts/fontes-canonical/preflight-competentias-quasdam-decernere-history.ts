import {createClient} from '@sanity/client'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere')
const EFFECTIVE='2022-02-15'
const LAST_OLD_DAY='2022-02-14'
const DOC_ID='francis-2022-competentias-quasdam-decernere'

const norm=(v:any)=>String(v??'').replace(/\s/g,'').toLowerCase()
const activeOn=(v:any,date:string)=>Boolean(v?.validFrom&&v.validFrom<=date&&(!v.validUntil||v.validUntil>=date))

async function main(){
  console.log('\nPREFLIGHT STORICO COMPETENTIAS QUASDAM DECERNERE — PRODUCTION — SOLA LETTURA')
  let errors=0
  let warnings=0

  const canonical=JSON.parse(await readFile(join(ROOT,'canonical.json'),'utf8'))
  if(canonical.documentId!==DOC_ID){console.log(`✖ documentId inatteso: ${canonical.documentId??'∅'}`);errors++}
  if(canonical.effectiveFrom!==EFFECTIVE){console.log(`✖ effectiveFrom atteso ${EFFECTIVE}, trovato ${canonical.effectiveFrom??'∅'}`);errors++}
  else console.log(`✔ effectiveFrom=${EFFECTIVE}`)
  if(!Array.isArray(canonical.effects)||canonical.effects.length!==11){console.log(`✖ effetti=${canonical.effects?.length??0}, attesi 11`);errors++}

  for(const effect of canonical.effects??[]){
    const canon:any=await client.fetch('*[_type=="canon"&&number==$n][0]{_id,number,canonicalId}',{n:effect.canon})
    if(!canon||canon.canonicalId!==`cic-1983-can-${effect.canon}`){console.log(`✖ Can. ${effect.canon}: canone non risolto`);errors++;continue}

    const versions:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id&&language=="it"]{_id,versionId,status,language,validFrom,validUntil,previousVersion}|order(validFrom asc)',{id:canon._id})
    const active=versions.filter(v=>activeOn(v,EFFECTIVE))
    if(active.length!==1){console.log(`✖ Can. ${effect.canon}: versioni IT in vigore il ${EFFECTIVE}=${active.length}, attesa 1`);errors++;continue}
    const v=active[0]

    if(v.validFrom!==EFFECTIVE){
      console.log(`⚠ Can. ${effect.canon}: versione attiva al ${EFFECTIVE} inizia ${v.validFrom??'∅'}; verificare se il testo Competentias è già incorporato`)
      warnings++
    }
    if(v.status!=='current')console.log(`ℹ Can. ${effect.canon}: target temporale è storico/superseded (${v.versionId}), non la versione current`)

    let target=`canonVersion ${v.versionId}`
    if(effect.locator){
      const segs:any[]=await client.fetch('*[_type=="canonSegment"&&version._ref==$v]{_id,segmentId,label,segmentType}',{v:v._id})
      const wanted=norm(effect.locator)
      const matches=segs.filter(s=>norm(s.label)===wanted || (wanted==='§1'&&/-par-1$/.test(s.segmentId??'')) || (wanted==='§2'&&/-par-2$/.test(s.segmentId??'')) || (wanted==='§3'&&/-par-3$/.test(s.segmentId??'')))
      if(matches.length!==1){console.log(`✖ Can. ${effect.canon} ${effect.locator}: segmenti target=${matches.length}, atteso 1 nella versione ${v.versionId}`);errors++;continue}
      target=`canonSegment ${matches[0]._id} / ${matches[0].label??effect.locator}`
    }

    const predecessors=versions.filter(x=>x.validUntil===LAST_OLD_DAY)
    if(predecessors.length>1){
      console.log(`✖ Can. ${effect.canon}: più versioni IT terminano il ${LAST_OLD_DAY}: ${predecessors.map(x=>x.versionId).join(', ')}`)
      errors++
      continue
    }

    if(predecessors.length===1){
      console.log(`✔ Can. ${effect.canon}${effect.locator?` ${effect.locator}`:''}: ${effect.effect} → ${target}; storico già presente ${predecessors[0].versionId} fino al ${LAST_OLD_DAY}`)
      continue
    }

    const histVersionId=`cic-1983-can-${effect.canon}-it-pre-2022`
    const collisions:number=await client.fetch('count(*[_type=="canonVersion"&&(_id==$id||versionId==$versionId)])',{id:`version-${histVersionId}`,versionId:histVersionId})
    if(collisions){console.log(`✖ Can. ${effect.canon}: collisione versione storica prospettica ${histVersionId}: ${collisions}`);errors++}
    else console.log(`✔ Can. ${effect.canon}${effect.locator?` ${effect.locator}`:''}: ${effect.effect} → ${target}; storico da costruire fino al ${LAST_OLD_DAY}; nessuna collisione`)
  }

  const sourceCount:number=await client.fetch('count(*[_type=="sourceDocument"&&documentId==$id])',{id:DOC_ID})
  const relationCount:number=await client.fetch('count(*[_type=="legalRelation"&&sourceDocument->documentId==$id])',{id:DOC_ID})
  console.log(`\nsourceDocument Competentias già presenti: ${sourceCount}`)
  console.log(`legalRelation Competentias già presenti: ${relationCount}`)
  if(sourceCount>1){console.log('✖ collisione multipla sourceDocument');errors++}
  if(relationCount>11){console.log('✖ numero anomalo di legalRelation esistenti');errors++}

  console.log('\nNota: i target sono risolti temporalmente alla data di efficacia dell’atto, non in base allo status current. Una relazione storica resta quindi ancorata alla versione prodotta dall’atto anche se successivamente sostituita.')
  console.log(`Errori bloccanti: ${errors}`)
  console.log(`Avvisi: ${warnings}`)
  if(errors){console.log('✖ PREFLIGHT STORICO COMPETENTIAS NON SUPERATO');process.exitCode=1}
  else console.log('✔ PREFLIGHT STORICO COMPETENTIAS SUPERATO — nessuna scrittura eseguita')
}

main().catch(e=>{console.error('\n✖ PREFLIGHT STORICO COMPETENTIAS FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
