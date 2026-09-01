import {createHash} from 'node:crypto'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere/history-missing')

const EXPECTED_KEYS=['cic-232-264','cic-265-272','cic-1299-1310']
const EXPECTED_CANONS=[237,242,265,1308,1310]

async function main(){
  console.log('\nVALIDAZIONE FONTI STORICHE COMPETENTIAS — CAN. 237, 242, 265, 1308, 1310')
  let errors=0

  const manifest=JSON.parse(await readFile(join(ROOT,'manifest.json'),'utf8'))

  if(manifest.scope!=='competentias-history-missing'){
    console.log(`✖ scope inatteso: ${manifest.scope??'∅'}`)
    errors++
  }else console.log('✔ scope corretto')

  const canons=Array.isArray(manifest.canons)?manifest.canons:[]
  if(JSON.stringify(canons)!==JSON.stringify(EXPECTED_CANONS)){
    console.log(`✖ canoni inattesi: ${JSON.stringify(canons)}`)
    errors++
  }else console.log('✔ canoni corretti: 237, 242, 265, 1308, 1310')

  const sources=Array.isArray(manifest.sources)?manifest.sources:[]
  if(sources.length!==EXPECTED_KEYS.length){
    console.log(`✖ fonti=${sources.length}, attese ${EXPECTED_KEYS.length}`)
    errors++
  }

  for(const key of EXPECTED_KEYS){
    const source=sources.find((s:any)=>s?.key===key)
    if(!source){
      console.log(`✖ fonte mancante: ${key}`)
      errors++
      continue
    }
    if(typeof source.sourceUrl!=='string'||!source.sourceUrl.startsWith('https://www.vatican.va/')){
      console.log(`✖ ${key}: sourceUrl non ufficiale/inatteso`)
      errors++
    }
    if(typeof source.sha256!=='string'||!/^[a-f0-9]{64}$/.test(source.sha256)){
      console.log(`✖ ${key}: sha256 non valido`)
      errors++
      continue
    }
    const filename=`${key}.official.html`
    const html=await readFile(join(ROOT,filename),'utf8')
    const actual=createHash('sha256').update(html,'utf8').digest('hex')
    if(actual!==source.sha256){
      console.log(`✖ ${key}: hash mismatch manifest=${source.sha256} actual=${actual}`)
      errors++
      continue
    }
    console.log(`✔ ${key}: SHA-256 verificato ${actual}`)
  }

  console.log(`Errori: ${errors}`)
  if(errors){
    console.log('✖ FONTI STORICHE COMPETENTIAS MANCANTI NON VALIDE')
    process.exitCode=1
  }else{
    console.log('✔ FONTI STORICHE COMPETENTIAS MANCANTI VALIDE — provenienza ufficiale e integrità verificate')
  }
}

main().catch(e=>{
  console.error('\n✖ VALIDAZIONE FONTI STORICHE COMPETENTIAS FALLITA')
  console.error(e instanceof Error?e.message:e)
  process.exit(1)
})
