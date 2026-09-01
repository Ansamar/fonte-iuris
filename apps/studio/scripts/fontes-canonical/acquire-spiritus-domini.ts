import {createHash} from 'node:crypto'
import {mkdir, writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/spiritus-domini')
const ACT_URL='https://www.vatican.va/content/francesco/it/motu_proprio/documents/papa-francesco-motu-proprio-20210110_spiritus-domini.html'
const PROMULGATION_URL='https://www.osservatoreromano.va/it/news/2021-01/quo-007/aperti-alle-donne-i-ministeri-istituiti-del-lettorato-br-e-dell.html'
const CANON_URL='https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_224-231_it.html'

async function acquire(key:string,url:string,markers:string[]){
  const response=await fetch(url,{headers:{'user-agent':'Fonte-Iuris/1.0 canonical-source-acquisition'}})
  if(!response.ok)throw new Error(`${key}: acquisizione fallita HTTP ${response.status}`)
  const html=await response.text()
  for(const marker of markers)if(!html.includes(marker))throw new Error(`${key}: fonte inattesa, manca ${marker}`)
  const sha256=createHash('sha256').update(html,'utf8').digest('hex')
  const path=`${key}.official.html`
  await writeFile(join(ROOT,path),html,'utf8')
  return {key,sourceUrl:url,capturedAt:new Date().toISOString(),sha256,path:`scripts/fontes-canonical/data/spiritus-domini/${path}`}
}

async function main(){
  await mkdir(ROOT,{recursive:true})
  console.log('\nACQUISIZIONE SPIRITUS DOMINI — FONTI UFFICIALI')
  const act=await acquire('act',ACT_URL,['SPIRITUS DOMINI','CAN. 230 § 1','entrando in vigore nello stesso giorno','10 di gennaio dell’anno 2021'])
  const promulgation=await acquire('promulgation',PROMULGATION_URL,['11 gennaio 2021','Spiritus Domini','datata 10 gennaio','pubblicata oggi'])
  const canon=await acquire('canon-230',CANON_URL,['Can. 230','I laici di sesso maschile','Spiritus Domini'])
  const manifest={documentId:'francis-2021-spiritus-domini',sources:[act,promulgation,canon]}
  await writeFile(join(ROOT,'manifest.json'),JSON.stringify(manifest,null,2)+'\n','utf8')
  for(const item of manifest.sources)console.log(`✔ ${item.key}: sha256=${item.sha256}`)
  console.log('✔ SPIRITUS DOMINI SOURCE OK — 3/3 fonti ufficiali congelate')
}

main().catch(e=>{console.error('\n✖ ACQUISIZIONE SPIRITUS DOMINI FALLITA');console.error(e instanceof Error?e.message:e);process.exit(1)})
