import {writeFile, mkdir, readFile} from 'node:fs/promises'
import {dirname, join} from 'node:path'

const BASES = [
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/',
  'https://press.vatican.va/archive/cod-iuris-canonici/ita/documents/',
]
const pages=[[1254,1258],[1259,1272],[1273,1289],[1290,1298],[1299,1310]]
const unitRanges=[
  [1254,1258,'cic-1983-book-5'],
  [1259,1272,'cic-1983-book-5-title-1'],
  [1273,1289,'cic-1983-book-5-title-2'],
  [1290,1298,'cic-1983-book-5-title-3'],
  [1299,1310,'cic-1983-book-5-title-4'],
]
function token(a,b){return `${a}-${b}`}
function decode(s){const map={nbsp:' ',amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',agrave:'à',egrave:'è',eacute:'é',igrave:'ì',ograve:'ò',ugrave:'ù',Agrave:'À',Egrave:'È',Eacute:'É',Igrave:'Ì',Ograve:'Ò',Ugrave:'Ù',rsquo:'’',lsquo:'‘',ldquo:'“',rdquo:'”',ndash:'–',mdash:'—',sect:'§',laquo:'«',raquo:'»'};return s.replace(/&#x([0-9a-f]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#(\d+);/g,(_,d)=>String.fromCodePoint(Number(d))).replace(/&([A-Za-z]+);/g,(m,n)=>map[n]??m)}
function toText(html){return decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<sup\b[^>]*>\s*n\s*<\/sup>/gi,'^{n}').replace(/<br\s*\/?>/gi,'\n').replace(/<\/(p|div|li|td|tr|h[1-6])>/gi,'\n').replace(/<[^>]+>/g,' ')).replace(/\r/g,'').replace(/[\t\f\v ]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim()}
function clean(s){return s.replace(/§\s+(\d+)\s*[:.]\s*/g,'§$1. ').replace(/\s+(?=§\d+\.)/g,'\n\n').replace(/\s+(?=\d+\)\s)/g,'\n').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim()}
async function fetchOfficial(a,b){const file=`cic_libroV_${token(a,b)}_it.html`;for(const base of BASES){const url=base+file;const r=await fetch(url,{headers:{'user-agent':'Fonte-Iuris-Corpus-Builder/1.0'}});if(r.ok)return {url,html:await r.text()}}throw new Error(`Cannot fetch ${a}-${b}`)}
function extractCurrent(url,html,a,b){let text=toText(html);const cut=text.search(/Redazione originaria/i);if(cut>=0)text=text.slice(0,cut);const re=/Can\.\s*(\d+)[^\n]{0,25}?[-–—]/g;const ms=[...text.matchAll(re)].filter(m=>Number(m[1])>=a&&Number(m[1])<=b);const out=[];for(let n=a;n<=b;n++){const occ=ms.filter(m=>Number(m[1])===n);if(!occ.length)throw new Error(`Missing Can. ${n} in ${url}`);const m=occ.at(-1);const start=(m.index??0)+m[0].length;const later=ms.filter(x=>(x.index??0)>start&&Number(x[1])>n).sort((x,y)=>(x.index??0)-(y.index??0))[0];let body=clean(text.slice(start,later?.index??text.length));body=body.replace(/\(\s*\^\{n\}[^]*$/,'').trim();if(!body)throw new Error(`Empty Can. ${n}`);out.push({number:n,text:body,sourceUrl:url})}return out}
function unitFor(n){return unitRanges.find(([a,b])=>n>=a&&n<=b)[2]}
const collected=[]
for(const [a,b] of pages){const {url,html}=await fetchOfficial(a,b);const part=extractCurrent(url,html,a,b);collected.push(...part);console.log(`${a}-${b}: ${part.length}`)}
if(collected.length!==57||new Set(collected.map(x=>x.number)).size!==57)throw new Error(`Expected 57 unique canons, got ${collected.length}`)
for(let n=1254;n<=1310;n++)if(!collected.some(x=>x.number===n))throw new Error(`Missing ${n}`)
const data=collected.map(x=>({number:x.number,structuralUnitCanonicalId:unitFor(x.number),status:[1308,1310].includes(x.number)?'amended':'inForce',versions:[{versionId:`cic-1983-can-${x.number}-it-current`,versionLabel:'Testo vigente — fonte ufficiale della Santa Sede',status:'current',language:'it',text:x.text,sourceDocumentTitle:'Codice di Diritto Canonico',sourceCitation:`CIC, can. ${x.number} — testo vigente`,sourceUrl:x.sourceUrl,segments:null}]}))
const p=join('apps/studio/scripts/import-cic/data','canons.1254-1310.static.ts');await mkdir(dirname(p),{recursive:true});const body=`import type {CanonInput} from '../types'\nimport {segments} from './canonSource'\n\nexport const canons1254to1310: CanonInput[] = ${JSON.stringify(data,null,2).replace(/"segments": null/g,'"segments": []')}\n\nfor (const canon of canons1254to1310) {\n  for (const version of canon.versions) version.segments = segments(canon.number, version.text)\n}\n`;await writeFile(p,body,'utf8')
const indexPath='apps/studio/scripts/import-cic/data/canons.ts';let index=await readFile(indexPath,'utf8');if(!index.includes("./canons.1254-1310.static")){index=index.replace("import {canons1166to1253} from './canons.1166-1253.static'", "import {canons1166to1253} from './canons.1166-1253.static'\nimport {canons1254to1310} from './canons.1254-1310.static'");index=index.replace('  ...canons1166to1253,\n]', '  ...canons1166to1253,\n  ...canons1254to1310,\n]');await writeFile(indexPath,index,'utf8')}
console.log('STATIC_BOOK5_OK 57/57')
