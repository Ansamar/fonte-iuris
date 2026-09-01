import {createClient} from '@sanity/client'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/spiritus-domini')
const EFFECTIVE='2021-01-11'
const LAST_OLD_DAY='2021-01-10'
const HISTORICAL_VERSION_ID='cic-1983-can-230-it-1983'

function ptText(blocks:any[]){
  return (blocks||[])
    .map(b=>(b.children||[]).map((c:any)=>c.text||'').join(''))
    .filter(Boolean)
    .join('\n')
}

function normalize(value:string){
  return value
    .replace(/&nbsp;|&#160;|&#xA0;/gi,' ')
    .replace(/&sect;|&#167;|&#xA7;/gi,'§')
    .replace(/&rsquo;|&#8217;|&#x2019;/gi,'’')
    .replace(/&agrave;|&#224;|&#xE0;/gi,'à')
    .replace(/&egrave;|&#232;|&#xE8;/gi,'è')
    .replace(/&igrave;|&#236;|&#xEC;/gi,'ì')
    .replace(/&ograve;|&#242;|&#xF2;/gi,'ò')
    .replace(/&ugrave;|&#249;|&#xF9;/gi,'ù')
    .replace(/<[^>]+>/g,' ')
    .replace(/\s+/g,' ')
    .trim()
}

async function main(){
  console.log('\nPREFLIGHT STORICO SPIRITUS DOMINI — PRODUCTION — SOLA LETTURA')
  let errors=0
  let warnings=0

  const canonical=JSON.parse(await readFile(join(ROOT,'canonical.json'),'utf8'))
  if(canonical.effectiveFrom!==EFFECTIVE){
    console.log(`✖ effectiveFrom atteso ${EFFECTIVE}, trovato ${canonical.effectiveFrom??'∅'}`)
    errors++
  }else console.log(`✔ effectiveFrom=${EFFECTIVE}`)

  const manifest=JSON.parse(await readFile(join(ROOT,'manifest.json'),'utf8'))
  const canonSnapshot=manifest.sources?.find((x:any)=>x.key==='canon-230')
  if(!canonSnapshot){
    console.log('✖ snapshot ufficiale Can. 230 assente nel manifest')
    errors++
  }else{
    const html=await readFile(join(process.cwd(),canonSnapshot.path),'utf8')
    const text=normalize(html)
    const hasCanon=/Can\.\s*230\b/i.test(text)
    const hasOriginal=/Redazione originaria/i.test(text)
    const hasOldMale=/I laici di sesso maschile/i.test(text)
    const hasSpiritus=/Spiritus Domini/i.test(text)
    if(!hasCanon||!hasOriginal||!hasOldMale||!hasSpiritus){
      console.log(`✖ evidenza storica ufficiale incompleta: canon=${hasCanon} original=${hasOriginal} oldText=${hasOldMale} act=${hasSpiritus}`)
      errors++
    }else console.log('✔ snapshot Can. 230: redazione originaria e richiamo a Spiritus Domini verificati')
  }

  const canon:any=await client.fetch('*[_type=="canon"&&number==230][0]{_id,number,canonicalId}')
  if(!canon){
    console.log('✖ Can. 230 assente in production')
    errors++
  }else{
    console.log(`✔ Can. 230 risolto: ${canon._id}`)
    const current:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id&&language=="it"&&status=="current"]{_id,versionId,validFrom,validUntil,previousVersion,fullText}',{id:canon._id})
    if(current.length!==1){
      console.log(`✖ Can. 230: versioni current IT=${current.length}, attesa 1`)
      errors++
    }else{
      const v=current[0]
      const text=ptText(v.fullText)
      if(!text.trim()){
        console.log('✖ Can. 230: testo current vuoto')
        errors++
      }
      if(!/I laici che abbiano/i.test(text)){
        console.log('✖ Can. 230 current: non riconosco la redazione post-Spiritus Domini')
        errors++
      }
      const segs:any[]=await client.fetch('*[_type=="canonSegment"&&version._ref==$vid]{_id,segmentId,segmentType,label,parentSegment,order,startOffset,endOffset}',{vid:v._id})
      const par1=segs.filter(s=>s.segmentType==='paragraph'&&(/^§\s*1$/i.test(s.label??'')||/-par-1$/.test(s.segmentId??'')))
      if(par1.length!==1){
        console.log(`✖ Can. 230: segmenti §1 sulla current=${par1.length}, atteso 1`)
        errors++
      }else console.log(`✔ target current §1 risolto: ${par1[0]._id} / ${par1[0].label??'§1'}`)

      const collisions:number=await client.fetch('count(*[_type=="canonVersion"&&(_id==$id||versionId==$versionId)])',{id:`version-${HISTORICAL_VERSION_ID}`,versionId:HISTORICAL_VERSION_ID})
      if(collisions){
        console.log(`✖ collisione versione storica ${HISTORICAL_VERSION_ID}: ${collisions}`)
        errors++
      }else console.log(`✔ nessuna collisione per ${HISTORICAL_VERSION_ID}`)

      console.log(`Can. 230: historical 1983-11-27 → ${LAST_OLD_DAY}; current ${v.versionId} → dal ${EFFECTIVE}`)
      console.log(`  currentDates=${v.validFrom??'∅'}→${v.validUntil??'∅'}`)
      if(v.validFrom&&v.validFrom!==EFFECTIVE){
        console.log(`  ⚠ current validFrom già valorizzato a ${v.validFrom}`)
        warnings++
      }
    }
  }

  const sourceCollisions:number=await client.fetch('count(*[_type=="sourceDocument"&&documentId=="francis-2021-spiritus-domini"])')
  const relationCollisions:number=await client.fetch('count(*[_type=="legalRelation"&&relationId=="francis-2021-spiritus-domini-can-230-par-1"])')
  console.log(`sourceDocument Spiritus Domini già presenti: ${sourceCollisions}`)
  console.log(`legalRelation Spiritus Domini già presenti: ${relationCollisions}`)
  if(sourceCollisions>1){console.log('✖ collisione multipla sourceDocument');errors++}
  if(relationCollisions>1){console.log('✖ collisione multipla legalRelation');errors++}

  console.log(`\nErrori bloccanti: ${errors}`)
  console.log(`Avvisi: ${warnings}`)
  if(errors){
    console.log('✖ PREFLIGHT STORICO SPIRITUS DOMINI NON SUPERATO')
    process.exitCode=1
  }else console.log('✔ PREFLIGHT STORICO SPIRITUS DOMINI SUPERATO — nessuna scrittura eseguita')
}

main().catch(e=>{console.error(e);process.exit(1)})
