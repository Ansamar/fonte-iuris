import {writeFile, mkdir, readFile} from 'node:fs/promises'
import {dirname, join} from 'node:path'

const BASES = [
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/',
  'https://press.vatican.va/archive/cod-iuris-canonici/ita/documents/',
]

const pages = [
  [1311,1312],[1313,1320],[1321,1330],[1331,1335],[1336,1338],[1339,1340],
  [1341,1353],[1354,1363],[1364,1369],[1370,1377],[1379,1389],[1390,1391],
  [1392,1396],[1397,1398],[1399,1399],
]

const unitRanges = [
  [1311,1312,'cic-1983-book-6-part-1-title-1'],
  [1313,1320,'cic-1983-book-6-part-1-title-2'],
  [1321,1330,'cic-1983-book-6-part-1-title-3'],
  [1331,1335,'cic-1983-book-6-part-1-title-4-chapter-1'],
  [1336,1338,'cic-1983-book-6-part-1-title-4-chapter-2'],
  [1339,1340,'cic-1983-book-6-part-1-title-4-chapter-3'],
  [1341,1353,'cic-1983-book-6-part-1-title-5'],
  [1354,1363,'cic-1983-book-6-part-1-title-6'],
  [1364,1369,'cic-1983-book-6-part-2-title-1'],
  [1370,1378,'cic-1983-book-6-part-2-title-2'],
  [1379,1389,'cic-1983-book-6-part-2-title-3'],
  [1390,1391,'cic-1983-book-6-part-2-title-4'],
  [1392,1396,'cic-1983-book-6-part-2-title-5'],
  [1397,1398,'cic-1983-book-6-part-2-title-6'],
  [1399,1399,'cic-1983-book-6-part-2-title-7'],
]

function pageToken(a,b){return a===b?`${a}`:`${a}-${b}`}
function decode(s){const map={nbsp:' ',amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',agrave:'à',egrave:'è',eacute:'é',igrave:'ì',ograve:'ò',ugrave:'ù',Agrave:'À',Egrave:'È',Eacute:'É',Igrave:'Ì',Ograve:'Ò',Ugrave:'Ù',rsquo:'’',lsquo:'‘',ldquo:'“',rdquo:'”',ndash:'–',mdash:'—',sect:'§',laquo:'«',raquo:'»',ordm:'º'};return s.replace(/&#x([0-9a-f]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#(\d+);/g,(_,d)=>String.fromCodePoint(Number(d))).replace(/&([A-Za-z]+);/g,(m,n)=>map[n]??m)}
function toText(html){return decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<sup\b[^>]*>\s*n\s*<\/sup>/gi,'^{n}').replace(/<br\s*\/?>/gi,'\n').replace(/<\/(p|div|li|td|tr|h[1-6])>/gi,'\n').replace(/<[^>]+>/g,' ')).replace(/\r/g,'').replace(/[\t\f\v ]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim()}
function clean(s){return s.replace(/§\s+(\d+)\s*[:.]\s*/g,'§$1. ').replace(/\s+(?=§\d+\.)/g,'\n\n').replace(/\s+(?=\d+[º°)]\s)/g,'\n').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim()}
async function fetchOfficial(a,b){const file=`cic_libroVI_${pageToken(a,b)}_it.html`;for(const base of BASES){const url=base+file;const r=await fetch(url,{headers:{'user-agent':'Fonte-Iuris-Corpus-Builder/1.0'}});if(r.ok)return {url,html:await r.text()}}throw new Error(`Cannot fetch ${a}-${b}`)}
function extractCurrent(url,html,a,b){const text=toText(html);const re=/Can\.\s*(\d+)[^\n]{0,30}?[-–—]/g;const ms=[...text.matchAll(re)].filter(m=>Number(m[1])>=a&&Number(m[1])<=b);const out=[];for(let n=a;n<=b;n++){const occ=ms.filter(m=>Number(m[1])===n);if(!occ.length)throw new Error(`Missing Can. ${n} in ${url}`);const m=occ.at(-1);const start=(m.index??0)+m[0].length;const later=ms.filter(x=>(x.index??0)>start&&Number(x[1])>n).sort((x,y)=>(x.index??0)-(y.index??0))[0];let body=clean(text.slice(start,later?.index??text.length));body=body.replace(/\(\s*\^\{n\}[^]*$/,'').trim();if(!body)throw new Error(`Empty Can. ${n}`);out.push({number:n,text:body,sourceUrl:url})}return out}
function unitFor(n){const row=unitRanges.find(([a,b])=>n>=a&&n<=b);if(!row)throw new Error(`No structural unit for ${n}`);return row[2]}

const collected=[]
for(const [a,b] of pages){const {url,html}=await fetchOfficial(a,b);const part=extractCurrent(url,html,a,b);collected.push(...part);console.log(`${a}-${b}: ${part.length}`)}
// Can. 1378 belongs to Title II but is printed on the Vatican Title II page 1370-1377.
// Acquire it from the official whole-book Italian page if it is not present in the page manifest.
if(!collected.some(x=>x.number===1378)){
  const url='https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroVI_it.html'
  const r=await fetch(url,{headers:{'user-agent':'Fonte-Iuris-Corpus-Builder/1.0'}})
  if(!r.ok)throw new Error('Cannot fetch official whole Book VI page for Can. 1378')
  collected.push(...extractCurrent(url,await r.text(),1378,1378))
  console.log('1378: 1 (whole-book official page)')
}
collected.sort((a,b)=>a.number-b.number)
if(collected.length!==89||new Set(collected.map(x=>x.number)).size!==89)throw new Error(`Expected 89 unique canons, got ${collected.length}`)
for(let n=1311;n<=1399;n++)if(!collected.some(x=>x.number===n))throw new Error(`Missing ${n}`)

const data=collected.map(x=>({number:x.number,structuralUnitCanonicalId:unitFor(x.number),status:'inForce',versions:[{versionId:`cic-1983-can-${x.number}-it-2021`,versionLabel:'Libro VI riformato — testo vigente dall’8 dicembre 2021',status:'current',validFrom:'2021-12-08',language:'it',text:x.text,sourceDocumentTitle:'Costituzione Apostolica Pascite gregem Dei',sourceCitation:`CIC, can. ${x.number} — Libro VI riformato`,sourceUrl:x.sourceUrl,changeSummary:'Testo del Libro VI riformato dalla Costituzione Apostolica Pascite gregem Dei, in vigore dall’8 dicembre 2021.',segments:null}]}))
const p=join('apps/studio/scripts/import-cic/data','canons.1311-1399.static.ts');await mkdir(dirname(p),{recursive:true});const body=`import type {CanonInput} from '../types'\nimport {segments} from './canonSource'\n\nexport const canons1311to1399: CanonInput[] = ${JSON.stringify(data,null,2).replace(/"segments": null/g,'"segments": []')}\n\nfor (const canon of canons1311to1399) {\n  for (const version of canon.versions) version.segments = segments(canon.number, version.text)\n}\n`;await writeFile(p,body,'utf8')

const indexPath='apps/studio/scripts/import-cic/data/canons.ts';let index=await readFile(indexPath,'utf8');if(!index.includes("./canons.1311-1399.static")){index=index.replace("import {canons1254to1310} from './canons.1254-1310.static'", "import {canons1254to1310} from './canons.1254-1310.static'\nimport {canons1311to1399} from './canons.1311-1399.static'");index=index.replace('  ...canons1254to1310,\n]', '  ...canons1254to1310,\n  ...canons1311to1399,\n]');await writeFile(indexPath,index,'utf8')}
console.log('STATIC_BOOK6_OK 89/89')
