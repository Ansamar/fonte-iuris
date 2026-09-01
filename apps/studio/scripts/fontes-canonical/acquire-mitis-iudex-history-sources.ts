import {createHash} from 'node:crypto'
import {mkdir,writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/mitis-iudex/history')
const SOURCES=[
 {key:'mitis-iudex',url:'https://www.vatican.va/content/francesco/it/motu_proprio/documents/papa-francesco-motu-proprio_20150815_mitis-iudex-dominus-iesus.html',markers:['Mitis Iudex Dominus Iesus','cann. 1671-1691','8 dicembre 2015','Can. 1671','Can. 1691']},
 {key:'cic-1671-1673',url:'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroVII_1671-1673_it.html',markers:['Can. 1671','Can. 1672','Can. 1673','nuova versione','Mitis Iudex Dominus Iesus']},
 {key:'cic-1674',url:'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroVII_1674_it.html',markers:['Can. 1674','nuova versione','Mitis Iudex Dominus Iesus']},
 {key:'cic-1675-1678',url:'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroVII_1675-1678_it.html',markers:['Can. 1675','Can. 1678','nuova versione','Mitis Iudex Dominus Iesus']},
 {key:'cic-1679-1682',url:'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroVII_1679-1682_it.html',markers:['Can. 1679','Can. 1682','nuova versione','Mitis Iudex Dominus Iesus']},
 {key:'cic-1683-1687',url:'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroVII_1683-1687_it.html',markers:['Can. 1683','Can. 1687','nuova versione','Mitis Iudex Dominus Iesus']},
 {key:'cic-1688-1690',url:'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroVII_1688-1690_it.html',markers:['Can. 1688','Can. 1690','nuova versione','Mitis Iudex Dominus Iesus']},
 {key:'cic-1691',url:'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroVII_1691_it.html',markers:['Can. 1691','nuova versione','Mitis Iudex Dominus Iesus']},
]
function text(v:string){return v.replace(/&nbsp;|&#160;|&#xA0;/gi,' ').replace(/&sect;|&#167;|&#xA7;/gi,'§').replace(/&rsquo;|&#8217;|&#x2019;/gi,"'").replace(/[’‘]/g,"'").replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().toLocaleLowerCase('it')}
async function main(){
 await mkdir(ROOT,{recursive:true});const frozen:any[]=[]
 console.log('\nACQUISIZIONE MITIS IUDEX — FONTI UFFICIALI')
 for(const s of SOURCES){
  const r=await fetch(s.url,{headers:{'user-agent':'Fonte-Iuris/1.0 canonical-source-acquisition'}});if(!r.ok)throw new Error(`${s.key}: HTTP ${r.status}`)
  const html=await r.text(),search=text(html)
  for(const m of s.markers)if(!search.includes(text(m)))throw new Error(`${s.key}: fonte inattesa, manca ${m}`)
  const sha256=createHash('sha256').update(html,'utf8').digest('hex'),filename=`${s.key}.official.html`
  await writeFile(join(ROOT,filename),html,'utf8');frozen.push({key:s.key,sourceUrl:s.url,capturedAt:new Date().toISOString(),sha256,path:`scripts/fontes-canonical/data/mitis-iudex/history/${filename}`});console.log(`✔ ${s.key}: ${sha256}`)
 }
 await writeFile(join(ROOT,'manifest.json'),JSON.stringify({scope:'mitis-iudex-1671-1691-history',effectiveFrom:'2015-12-08',canons:Array.from({length:21},(_,i)=>1671+i),sources:frozen,juridicalNote:'The official Mitis Iudex act establishes integral replacement of CIC cann. 1671–1691 effective 2015-12-08. Official CIC Italian archive pages are frozen as documentary witnesses for the post-reform redactions. The archive pages mark the text as new (^n) and link Mitis Iudex; they do not embed the 1983 redaction, which must therefore be acquired from a separate official pre-reform witness before historical versions are built.'},null,2)+'\n')
 console.log('✔ FONTI MITIS IUDEX CONGELATE')
}
main().catch(e=>{console.error('\n✖ ACQUISIZIONE FALLITA');console.error(e instanceof Error?e.message:e);process.exit(1)})
