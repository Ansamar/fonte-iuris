import {createHash} from 'node:crypto'
import {mkdir,writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere/history-699-700')

const SOURCES=[
  {
    key:'cic-694-704',
    url:'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_694-704_it.html',
    markers:[
      'Can. 699',
      'Nei monasteri sui iuris',
      'compete al Superiore maggiore con il consenso del suo consiglio',
      'Can. 700',
      'Competentias quasdam decernere',
      'Redazione originaria',
      'Il decreto di dimissione non ha vigore se non fu confermato dalla Santa Sede',
      'trenta giorni',
    ],
  },
  {
    key:'expedit-ut-iura',
    url:'https://www.vatican.va/content/francesco/it/motu_proprio/documents/20230402-motu-proprio-expedit-ut-iura.html',
    markers:[
      'Can. 700',
      'trenta giorni',
      'entrando in vigore il 7 maggio dell’anno 2023',
      '2 aprile dell’anno 2023',
    ],
  },
  {
    key:'rescriptum-699-2026',
    url:'https://press.vatican.va/content/salastampa/it/bollettino/pubblico/2026/05/28/0450/00884.html',
    markers:[
      'can. 699',
      '25 marzo 2026',
      'facoltà di autorizzare il Vescovo diocesano competente ad emettere il decreto di dimissione',
      'entrando immediatamente in vigore',
    ],
  },
]

function normalizeHtmlText(value:string){
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
    .toLocaleLowerCase('it')
}

async function main(){
  await mkdir(ROOT,{recursive:true})
  console.log('\nACQUISIZIONE STORICA COMPETENTIAS — CAN. 699–700 — FONTI UFFICIALI')
  const frozen:any[]=[]

  for(const source of SOURCES){
    const response=await fetch(source.url,{headers:{'user-agent':'Fonte-Iuris/1.0 canonical-source-acquisition'}})
    if(!response.ok)throw new Error(`${source.key}: acquisizione fallita HTTP ${response.status}`)
    const html=await response.text()
    const searchable=normalizeHtmlText(html)
    for(const marker of source.markers){
      if(!searchable.includes(normalizeHtmlText(marker)))throw new Error(`${source.key}: fonte inattesa, manca ${marker}`)
    }
    const sha256=createHash('sha256').update(html,'utf8').digest('hex')
    const filename=`${source.key}.official.html`
    await writeFile(join(ROOT,filename),html,'utf8')
    frozen.push({key:source.key,sourceUrl:source.url,capturedAt:new Date().toISOString(),sha256,path:`scripts/fontes-canonical/data/competentias-quasdam-decernere/history-699-700/${filename}`})
    console.log(`✔ ${source.key}: sha256=${sha256}`)
  }

  const manifest={
    scope:'competentias-history-699-700',
    sources:frozen,
    juridicalNote:'Can. 699: Competentias modifies §2 from 2022-02-15; the 2026 Rescriptum creates a special faculty/exception and must not be treated as a textual replacement of the canon. Can. 700: Competentias creates the 2022 text; Expedit ut iura creates a further version effective 2023-05-07.',
  }
  await writeFile(join(ROOT,'manifest.json'),JSON.stringify(manifest,null,2)+'\n','utf8')
  console.log('✔ COMPETENTIAS 699–700 HISTORY SOURCES OK — fonti ufficiali congelate')
}

main().catch(e=>{console.error('\n✖ ACQUISIZIONE STORICA COMPETENTIAS 699–700 FALLITA');console.error(e instanceof Error?e.message:e);process.exit(1)})
