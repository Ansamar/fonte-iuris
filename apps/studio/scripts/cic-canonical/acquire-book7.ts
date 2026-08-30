import {createHash} from 'node:crypto'
import {mkdir, writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const INDEX='https://www.vatican.va/archive/cod-iuris-canonici/cic_index_it.html'
const OUT=join(process.cwd(),'scripts/cic-canonical/source')
const SOURCE=join(OUT,'libro-7.source.txt')
const MANIFEST=join(OUT,'libro-7.manifest.json')

function decode(s:string){return s.replace(/&nbsp;|&#160;/gi,' ').replace(/&sect;|&#167;/gi,'§').replace(/&ordm;|&#186;/gi,'º').replace(/&deg;|&#176;/gi,'°').replace(/&agrave;/gi,'à').replace(/&egrave;/gi,'è').replace(/&eacute;/gi,'é').replace(/&igrave;/gi,'ì').replace(/&ograve;/gi,'ò').replace(/&ugrave;/gi,'ù').replace(/&rsquo;|&apos;/gi,"'").replace(/&ldquo;|&rdquo;|&quot;/gi,'"').replace(/&ndash;|&mdash;/gi,'-').replace(/&amp;/gi,'&').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))}
function text(html:string){return decode(html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<br\s*\/?>/gi,'\n').replace(/<\/p\s*>/gi,'\n').replace(/<\/div\s*>/gi,'\n').replace(/<[^>]+>/g,' ')).replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n')}
async function get(url:string){const r=await fetch(url,{headers:{'user-agent':'Fonte-Iuris/1.0 canonical-source-builder'}});if(!r.ok)throw new Error(`${r.status} ${url}`);return r.text()}

const indexHtml=await get(INDEX)
const urls=[...indexHtml.matchAll(/href=["']([^"']*cic_libroVII_[^"']+_it\.html)["']/gi)].map(m=>new URL(m[1],INDEX).href)
const unique=[...new Set(urls)]
if(unique.length<40)throw new Error(`Indice Libro VII incompleto: ${unique.length} pagine`)

const canonMap=new Map<number,string>()
for(const url of unique){
 const body=text(await get(url))
 const matches=[...body.matchAll(/(?:^|\n|\s)Can\.\s*(\d+)\s*-\s*/g)]
 for(let i=0;i<matches.length;i++){
  const n=Number(matches[i][1]); if(n<1400||n>1752)continue
  const start=(matches[i].index??0)+matches[i][0].length
  const end=i+1<matches.length?(matches[i+1].index??body.length):body.length
  let value=body.slice(start,end).trim()
  value=value.split(/\n(?:CODICE DI DIRITTO CANONICO|LIBRO VII|PARTE |TITOLO |CAPITOLO |Articolo )/)[0].trim()
  if(!value)throw new Error(`Can. ${n}: testo vuoto`)
  const prior=canonMap.get(n)
  if(prior&&prior!==value)throw new Error(`Can. ${n}: testi discordanti tra pagine ufficiali`)
  canonMap.set(n,value)
 }
}
const missing=[] as number[]
for(let n=1400;n<=1752;n++)if(!canonMap.has(n))missing.push(n)
if(missing.length)throw new Error(`Canoni mancanti: ${missing.join(', ')}`)

const source=[...canonMap].sort((a,b)=>a[0]-b[0]).map(([n,t])=>`@@CANON ${n}\n${t}\n@@END`).join('\n\n')+'\n'
const sha256=createHash('sha256').update(source).digest('hex')
await mkdir(OUT,{recursive:true})
await writeFile(SOURCE,source,'utf8')
await writeFile(MANIFEST,JSON.stringify({book:7,range:[1400,1752],expectedCanons:353,language:'it',source:'Santa Sede',indexUrl:INDEX,retrievedAt:new Date().toISOString(),pages:unique.length,sha256},null,2)+'\n','utf8')
console.log(`BOOK7_SOURCE_OK 353/353 pages=${unique.length} sha256=${sha256}`)
