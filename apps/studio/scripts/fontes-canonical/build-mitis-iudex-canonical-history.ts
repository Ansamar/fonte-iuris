import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/mitis-iudex/history')
const OUT=join(ROOT,'canonical-history.json')
const CANONS=Array.from({length:21},(_,i)=>1671+i)

function clean(v:string){return v.replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim()}
function htmlText(v:string){return clean(v.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/&nbsp;|&#160;|&#xA0;/gi,' ').replace(/&sect;|&#167;|&#xA7;/gi,'§').replace(/&deg;|&#176;/gi,'°').replace(/&rsquo;|&#8217;|&#x2019;/gi,"'").replace(/&ldquo;|&rdquo;|&#8220;|&#8221;/gi,'"').replace(/<br\s*\/?>/gi,'\n').replace(/<\/p>/gi,'\n').replace(/<[^>]+>/g,' '))}

async function main(){
 const manifest=JSON.parse(await readFile(join(ROOT,'manifest.json'),'utf8'))
 const pages=manifest.sources.filter((s:any)=>s.key.startsWith('cic-'))
 const corpus=(await Promise.all(pages.map(async(s:any)=>htmlText(await readFile(join(process.cwd(),s.path),'utf8'))))).join('\n')
 const current:any[]=[]
 for(let i=0;i<CANONS.length;i++){
  const n=CANONS[i],next=n+1
  const re=new RegExp(`(?:Can\\.\\s*)?${n}(?:\\^?\\{?n\\}?|ⁿ)?\\s*[-–—]?\\s*([\\s\\S]*?)(?=(?:Can\\.\\s*)?${next}(?:\\D|$)|$)`,'i')
  const m=corpus.match(re)
  if(!m)throw new Error(`Can. ${n}: testo corrente non estratto dalle fonti congelate`)
  const fullText=clean(m[1]).replace(/\s*\(\^?n:?[\s\S]*$/i,'').trim()
  if(fullText.length<20)throw new Error(`Can. ${n}: testo corrente troppo breve`)
  current.push({canon:n,language:'it',status:'current',validFrom:'2015-12-08',validUntil:null,fullText,source:'official-vatican-cic-post-mitis-iudex'})
 }
 const history={scope:'mitis-iudex-1671-1691',effectiveFrom:'2015-12-08',intervals:{original:{validFrom:'1983-11-27',validUntil:'2015-12-07'},reformed:{validFrom:'2015-12-08',validUntil:null}},canons:CANONS,current,original1983:{status:'pending-controlled-transcription-from-frozen-authentic-aas',source:'cic-1983-aas',expectedCanons:CANONS}}
 await mkdir(ROOT,{recursive:true});await writeFile(OUT,JSON.stringify(history,null,2)+'\n')
 console.log('\nMITIS IUDEX — CANONICAL HISTORY BUILDER')
 console.log(`✔ ${current.length}/21 testi post-2015 estratti dalle fonti ufficiali congelate`)
 console.log('✔ intervallo riformato: 2015-12-08 → ∞')
 console.log('✔ intervallo storico predisposto: 1983-11-27 → 2015-12-07')
 console.log(`✔ output: ${OUT}`)
 console.log('→ prossimo passo: completamento controllato delle 21 redazioni 1983')
}
main().catch(e=>{console.error('\n✖ BUILD FALLITA');console.error(e instanceof Error?e.message:e);process.exit(1)})
