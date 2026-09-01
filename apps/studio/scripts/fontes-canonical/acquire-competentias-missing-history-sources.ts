import {createHash} from 'node:crypto'
import {mkdir,writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere/history-missing')

const SOURCES=[
  {
    key:'cic-232-264',
    url:'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_232-264_it.html',
    markers:[
      'Can. 237',
      'ottenuta la conferma della Sede Apostolica',
      "ottenuta l'approvazione della Sede Apostolica",
      'Can. 242',
      'confermata dalla Santa Sede',
      'approvata dalla Santa Sede',
      'Redazione originaria',
      'Competentias quasdam decernere',
    ],
  },
  {
    key:'cic-265-272',
    url:'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_265-272_it.html',
    markers:[
      'Can. 265',
      'Associazione pubblica clericale',
      'prelatura personale',
      'Redazione originaria',
      'Competentias quasdam decernere',
      'in modo che non siano assolutamente ammessi chierici acefali o girovaghi',
    ],
  },
  {
    key:'cic-1299-1310',
    url:'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroV_1299-1310_it.html',
    markers:[
      'Can. 1308',
      'riservata al Vescovo diocesano',
      'riservata alla Sede Apostolica',
      'Can. 1310',
      'Nei rimanenti casi si deve ricorrere alla Sede Apostolica',
      'Redazione originaria',
      'Competentias quasdam decernere',
    ],
  },
]

function normalizeHtmlText(value:string){
  return value
    .replace(/&nbsp;|&#160;|&#xA0;/gi,' ')
    .replace(/&sect;|&#167;|&#xA7;/gi,'§')
    .replace(/&rsquo;|&#8217;|&#x2019;/gi,"'")
    .replace(/[’‘]/g,"'")
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
  console.log('\nACQUISIZIONE STORICA COMPETENTIAS — CAN. 237, 242, 265, 1308, 1310 — FONTI UFFICIALI')
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
    frozen.push({key:source.key,sourceUrl:source.url,capturedAt:new Date().toISOString(),sha256,path:`scripts/fontes-canonical/data/competentias-quasdam-decernere/history-missing/${filename}`})
    console.log(`✔ ${source.key}: sha256=${sha256}`)
  }

  const manifest={
    scope:'competentias-history-missing',
    canons:[237,242,265,1308,1310],
    sources:frozen,
    juridicalNote:'Official CIC pages containing both the current text after Competentias quasdam decernere and the embedded Redazione originaria are frozen as the documentary basis for reconstruction of the 1983→2022 temporal histories.',
  }
  await writeFile(join(ROOT,'manifest.json'),JSON.stringify(manifest,null,2)+'\n','utf8')
  console.log('✔ COMPETENTIAS MISSING HISTORY SOURCES OK — fonti ufficiali congelate')
}

main().catch(e=>{console.error('\n✖ ACQUISIZIONE STORICA COMPETENTIAS MANCANTI FALLITA');console.error(e instanceof Error?e.message:e);process.exit(1)})
