import {createHash} from 'node:crypto'
import {mkdir, writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const OUT=join(process.cwd(),'scripts/fontes-canonical/data/de-concordia-inter-codices/history-source')
const pages=[
  ['96-112','https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroI_96-112_it.html','original'],
  ['515-552','https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_515-552_it.html','original'],
  ['864-871','https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroIV_864-871_it.html','marked-current'],
  ['1108-1123','https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroIV_1108-1123_it.html','original-or-marked'],
  ['1124-1129','https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroIV_1124-1129_it.html','original-or-marked'],
] as const

function decode(s:string){return s.replace(/&nbsp;|&#160;/gi,' ').replace(/&sect;|&#167;/gi,'§').replace(/&ordm;|&#186;/gi,'º').replace(/&deg;|&#176;/gi,'°').replace(/&agrave;/gi,'à').replace(/&egrave;/gi,'è').replace(/&eacute;/gi,'é').replace(/&igrave;/gi,'ì').replace(/&ograve;/gi,'ò').replace(/&ugrave;/gi,'ù').replace(/&rsquo;|&apos;/gi,"'").replace(/&ldquo;|&rdquo;|&quot;/gi,'"').replace(/&ndash;|&mdash;/gi,'-').replace(/&amp;/gi,'&').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))}
function toText(html:string){return decode(html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<br\s*\/?>/gi,'\n').replace(/<\/p\s*>/gi,'\n').replace(/<\/div\s*>/gi,'\n').replace(/<[^>]+>/g,' ')).replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n')}
async function get(url:string){const r=await fetch(url,{headers:{'user-agent':'Fonte-Iuris/1.0 historical-source-builder'}});if(!r.ok)throw new Error(`${r.status} ${url}`);return r.text()}
function evidenceOk(text:string,mode:string){const original=/Redazione originaria/i.test(text);const marked=/De concordia inter Codices/i.test(text)&&/(nuova versione|nuovo paragrafo|Articoli modificati)/i.test(text);return mode==='original'?original:mode==='marked-current'?marked:(original||marked)}

async function main(){await mkdir(OUT,{recursive:true});const manifest:any={source:'Santa Sede',purpose:'De concordia historical canon reconstruction',language:'it',retrievedAt:new Date().toISOString(),pages:[]}
for(const [key,url,evidenceMode] of pages){const html=await get(url);const text=toText(html);if(!evidenceOk(text,evidenceMode))throw new Error(`${key}: evidenza De concordia/originale non trovata (${evidenceMode})`);const sha256=createHash('sha256').update(html).digest('hex');const htmlPath=join(OUT,`${key}.official.html`);const txtPath=join(OUT,`${key}.official.txt`);await writeFile(htmlPath,html,'utf8');await writeFile(txtPath,text,'utf8');manifest.pages.push({key,url,sha256,evidenceMode,html:`${key}.official.html`,text:`${key}.official.txt`});console.log(`✔ ${key} sha256=${sha256} evidence=${evidenceMode}`)}
const raw=JSON.stringify(manifest,null,2)+'\n';manifest.manifestSha256=createHash('sha256').update(raw).digest('hex');await writeFile(join(OUT,'manifest.json'),JSON.stringify(manifest,null,2)+'\n','utf8');console.log(`DE CONCORDIA HISTORY SOURCE OK — ${manifest.pages.length}/5 pagine ufficiali congelate`)}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exitCode=1})
