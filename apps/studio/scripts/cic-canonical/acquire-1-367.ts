import {createHash} from 'node:crypto'
import {mkdir, writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const INDEX = 'https://www.vatican.va/archive/cod-iuris-canonici/cic_index_it.html'
const BASE = 'https://www.vatican.va/archive/cod-iuris-canonici/'
const OUT = join(process.cwd(), 'scripts/cic-canonical/source')
const SOURCE = join(OUT, 'canoni-1-367.source.txt')
const MANIFEST = join(OUT, 'canoni-1-367.manifest.json')

function decode(s:string){return s.replace(/&nbsp;|&#160;/gi,' ').replace(/&sect;|&#167;/gi,'§').replace(/&ordm;|&#186;/gi,'º').replace(/&deg;|&#176;/gi,'°').replace(/&agrave;/gi,'à').replace(/&egrave;/gi,'è').replace(/&eacute;/gi,'é').replace(/&igrave;/gi,'ì').replace(/&ograve;/gi,'ò').replace(/&ugrave;/gi,'ù').replace(/&rsquo;|&apos;/gi,"'").replace(/&ldquo;|&rdquo;|&quot;/gi,'"').replace(/&ndash;|&mdash;/gi,'-').replace(/&amp;/gi,'&').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))}
function text(html:string){return decode(html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi,'').replace(/<br\s*\/?>/gi,'\n').replace(/<\/p\s*>/gi,'\n').replace(/<\/div\s*>/gi,'\n').replace(/<[^>]+>/g,' ')).replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n')}
async function get(url:string){const r=await fetch(url,{headers:{'user-agent':'Fonte-Iuris/1.0 canonical-source-builder'}});if(!r.ok)throw new Error(`${r.status} ${url}`);return r.text()}

function discover(indexHtml:string){
 const matches=[...indexHtml.matchAll(/(?:\.\.\/)?ita\/documents\/cic_libro(?:I|II)_[0-9-]+_it\.html/gi)].map(m=>m[0]);
 const fallback=[...indexHtml.matchAll(/cic_libro(?:I|II)_[0-9-]+_it\.html/gi)].map(m=>`ita/documents/${m[0]}`);
 return [...new Set([...matches,...fallback].map(p=>new URL(p.replace(/^\.\.\//,''),BASE).href))];
}

function extract(body:string,map:Map<number,string>){
 const matches=[...body.matchAll(/(?:^|\n|\s)Can\.\s*(\d+)\s*-\s*/gi)];
 for(let i=0;i<matches.length;i++){
  const number=Number(matches[i][1]); if(number<1||number>367)continue;
  const start=(matches[i].index??0)+matches[i][0].length;
  const end=i+1<matches.length?(matches[i+1].index??body.length):body.length;
  let value=body.slice(start,end).trim().split(/\n(?:CODICE DI DIRITTO CANONICO|LIBRO [IVX]+|PARTE |SEZIONE |TITOLO |CAPITOLO |Articolo |Cf:)/i)[0].trim();
  if(!value)throw new Error(`Can. ${number}: testo vuoto`);
  const prior=map.get(number); if(prior&&prior!==value)throw new Error(`Can. ${number}: testi discordanti tra pagine ufficiali`);
  map.set(number,value);
 }
}

async function main(){
 const indexHtml=await get(INDEX); const urls=discover(indexHtml); if(urls.length<30)throw new Error(`Indice sorgenti 1-367 incompleto: ${urls.length} pagine`);
 const map=new Map<number,string>();
 for(const url of urls)extract(text(await get(url)),map);
 const missing:number[]=[];for(let n=1;n<=367;n++)if(!map.has(n))missing.push(n);
 if(missing.length)throw new Error(`Canoni mancanti (${missing.length}): ${missing.join(', ')}`);
 const source=[...map].sort((a,b)=>a[0]-b[0]).map(([n,v])=>`@@CANON ${n}\n${v}\n@@END`).join('\n\n')+'\n';
 const sha256=createHash('sha256').update(source).digest('hex');
 await mkdir(OUT,{recursive:true});await writeFile(SOURCE,source,'utf8');await writeFile(MANIFEST,JSON.stringify({range:[1,367],expectedCanons:367,language:'it',source:'Santa Sede',indexUrl:INDEX,retrievedAt:new Date().toISOString(),pages:urls.length,sha256},null,2)+'\n','utf8');
 console.log(`CIC_SOURCE_OK 367/367 pages=${urls.length} sha256=${sha256}`);
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exitCode=1});
