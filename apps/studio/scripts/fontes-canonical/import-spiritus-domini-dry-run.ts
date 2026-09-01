import {createClient} from '@sanity/client'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/spiritus-domini')
const DATA=join(ROOT,'canonical.json')
const SOURCE_DOC_ID='source-francis-2021-spiritus-domini'
const RELATION_ID='francis-2021-spiritus-domini-can-230-par-1'
const RELATION_DOC_ID=`relation-${RELATION_ID}`
const EFFECTIVE='2021-01-11'
const norm=(v:any)=>String(v??'').replace(/\s/g,'').toLowerCase()

async function main(){
 console.log('\nIMPORT SPIRITUS DOMINI — DRY RUN — PRODUCTION — NESSUNA SCRITTURA')
 const canonical=JSON.parse(await readFile(DATA,'utf8'))
 if(canonical.documentId!=='francis-2021-spiritus-domini')throw new Error(`documentId inatteso: ${canonical.documentId}`)
 if(canonical.effectiveFrom!==EFFECTIVE)throw new Error(`effectiveFrom inatteso: ${canonical.effectiveFrom}`)
 if(!Array.isArray(canonical.effects)||canonical.effects.length!==1)throw new Error(`Effetti attesi 1, trovati ${canonical.effects?.length??0}`)
 if(!canonical.snapshots?.act?.sha256||!canonical.snapshots?.act?.sourceUrl||!canonical.snapshots?.act?.path)throw new Error('Snapshot act incompleto')

 let errors=0
 const existingSource:any[]=await client.fetch('*[_type=="sourceDocument"&&(_id==$docId||documentId==$documentId)]{_id,documentId}',{docId:SOURCE_DOC_ID,documentId:canonical.documentId})
 if(existingSource.length){console.log(`✖ sourceDocument collisione: ${existingSource.map(x=>x._id).join(', ')}`);errors++}else console.log(`✔ sourceDocument CREATE ${SOURCE_DOC_ID} — effectiveFrom=${EFFECTIVE}`)

 const existingRelation:any[]=await client.fetch('*[_type=="legalRelation"&&(_id==$docId||relationId==$relationId)]{_id,relationId}',{docId:RELATION_DOC_ID,relationId:RELATION_ID})
 if(existingRelation.length){console.log(`✖ legalRelation collisione: ${existingRelation.map(x=>x._id).join(', ')}`);errors++}

 const effect=canonical.effects[0]
 if(effect.canon!==230||norm(effect.locator)!=='§1'||effect.effect!=='replaces'){console.log('✖ effetto canonico inatteso');errors++}
 const canon:any=await client.fetch('*[_type=="canon"&&number==230][0]{_id,number,canonicalId}')
 if(!canon||canon.canonicalId!=='cic-1983-can-230'){console.log('✖ Can. 230 non risolto');errors++}
 let target:any=null
 if(canon){
  const currents:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id&&language=="it"&&status=="current"]{_id,versionId,validFrom}',{id:canon._id})
  if(currents.length!==1){console.log(`✖ Can. 230: versioni current IT=${currents.length}`);errors++}
  else if(currents[0].validFrom!==EFFECTIVE){console.log(`✖ Can. 230: current validFrom=${currents[0].validFrom??'∅'}, atteso ${EFFECTIVE}`);errors++}
  else {
   const segs:any[]=await client.fetch('*[_type=="canonSegment"&&version._ref==$v]{_id,segmentId,label}',{v:currents[0]._id})
   const matches=segs.filter(s=>norm(s.label)==='§1')
   if(matches.length!==1){console.log(`✖ Can. 230 §1: segmenti target=${matches.length}`);errors++}
   else {target={...matches[0],versionId:currents[0].versionId};console.log(`✔ target current risolto: ${target._id} / ${target.label}`)}
  }
 }
 if(!existingRelation.length&&target)console.log(`✔ legalRelation CREATE ${RELATION_DOC_ID}: replaces → ${target.versionId} / ${target.label}`)

 console.log('\nPIANO DI SCRITTURA')
 console.log(`sourceDocument da creare: ${existingSource.length?0:1}`)
 console.log(`legalRelation da creare: ${!existingRelation.length&&target?1:0}`)
 console.log(`effectiveFrom: ${EFFECTIVE}`)
 console.log(`Errori bloccanti: ${errors}`)
 console.log('0 scritture eseguite su production.')
 if(errors){console.log('✖ DRY RUN SPIRITUS DOMINI NON SUPERATO');process.exitCode=1}else console.log('✔ DRY RUN SPIRITUS DOMINI SUPERATO — 1 fonte + 1 relazione pronte')
}
main().catch(e=>{console.error('\n✖ DRY RUN SPIRITUS DOMINI FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
