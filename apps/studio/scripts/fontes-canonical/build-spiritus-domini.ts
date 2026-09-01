import {readFile,writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/spiritus-domini')

async function main(){
  const manifest=JSON.parse(await readFile(join(ROOT,'manifest.json'),'utf8'))
  const act=manifest.sources.find((x:any)=>x.key==='act')
  const promulgation=manifest.sources.find((x:any)=>x.key==='promulgation')
  const canon=manifest.sources.find((x:any)=>x.key==='canon-230')
  if(!act||!promulgation||!canon)throw new Error('Manifest incompleto')
  const canonical={
    canonicalDataVersion:'1.0.0',
    documentId:'francis-2021-spiritus-domini',
    title:'Spiritus Domini',
    shortTitle:'Spiritus Domini',
    documentType:'motuProprio',
    issuer:'Franciscus PP.',
    issuedAt:'2021-01-10',
    effectiveFrom:'2021-01-11',
    territorialScope:'universal',
    legalForce:'normative',
    status:'inForce',
    language:'it',
    officialUrl:act.sourceUrl,
    snapshots:{act,promulgationEvidence:promulgation,canon230:canon},
    effects:[{article:'dispositivo',canon:230,locator:'§1',effect:'replaces'}],
    juridicalVerification:{
      status:'verified',
      note:'Il Motu Proprio prescrive la promulgazione mediante pubblicazione su L’Osservatore Romano e l’entrata in vigore nello stesso giorno. L’Osservatore Romano del 11 gennaio 2021 dichiara il documento datato 10 gennaio e pubblicato quel giorno; effectiveFrom=2021-01-11.'
    }
  }
  await writeFile(join(ROOT,'canonical.json'),JSON.stringify(canonical,null,2)+'\n','utf8')
  console.log('SPIRITUS DOMINI CANONICAL BUILT — 1 effetto')
  console.log(`effectiveFrom=${canonical.effectiveFrom}`)
  console.log(`canonical=${join(ROOT,'canonical.json')}`)
}

main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exit(1)})
