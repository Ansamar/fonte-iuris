import {writeFile, mkdir} from 'node:fs/promises'
import {dirname, join} from 'node:path'

const BASES = [
  'https://press.vatican.va/archive/cod-iuris-canonici/ita/documents/',
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/',
  'https://www.vatican.va/content/dam/wss/archive/cod-iuris-canonici/ita/documents/',
]

const pages = [
  [834,839],[840,848],[849,849],[850,860],[861,863],[864,871],[872,874],[875,878],
  [879,879],[880,881],[882,888],[889,891],[892,893],[894,896],[897,898],[899,899],
  [900,911],[912,923],[924,930],[931,933],[934,944],[945,958],[959,959],[960,964],
  [965,986],[987,991],[992,997],[998,998],[999,1002],[1003,1003],[1004,1007],[1008,1009],
  [1010,1023],[1024,1025],[1026,1032],[1033,1039],[1040,1049],[1050,1052],[1053,1054],
  [1055,1062],[1063,1072],[1073,1082],[1083,1094],[1095,1107],[1108,1123],[1124,1129],
  [1130,1133],[1134,1140],[1141,1150],[1151,1155],[1156,1160],[1161,1165],[1166,1172],
  [1173,1175],[1176,1176],[1177,1182],[1183,1185],[1186,1190],[1191,1198],[1199,1204],
  [1205,1213],[1214,1222],[1223,1229],[1230,1234],[1235,1239],[1240,1243],[1244,1245],
  [1246,1248],[1249,1253],
]

const unitRanges = [
  [834,839,'cic-1983-book-4'],[840,848,'cic-1983-book-4-part-1'],[849,849,'cic-1983-book-4-part-1-title-1'],
  [850,860,'cic-1983-book-4-part-1-title-1-chapter-1'],[861,863,'cic-1983-book-4-part-1-title-1-chapter-2'],[864,871,'cic-1983-book-4-part-1-title-1-chapter-3'],[872,874,'cic-1983-book-4-part-1-title-1-chapter-4'],[875,878,'cic-1983-book-4-part-1-title-1-chapter-5'],
  [879,879,'cic-1983-book-4-part-1-title-2'],[880,881,'cic-1983-book-4-part-1-title-2-chapter-1'],[882,888,'cic-1983-book-4-part-1-title-2-chapter-2'],[889,891,'cic-1983-book-4-part-1-title-2-chapter-3'],[892,893,'cic-1983-book-4-part-1-title-2-chapter-4'],[894,896,'cic-1983-book-4-part-1-title-2-chapter-5'],
  [897,898,'cic-1983-book-4-part-1-title-3'],[899,899,'cic-1983-book-4-part-1-title-3-chapter-1'],[900,911,'cic-1983-book-4-part-1-title-3-chapter-1-article-1'],[912,923,'cic-1983-book-4-part-1-title-3-chapter-1-article-2'],[924,930,'cic-1983-book-4-part-1-title-3-chapter-1-article-3'],[931,933,'cic-1983-book-4-part-1-title-3-chapter-1-article-4'],[934,944,'cic-1983-book-4-part-1-title-3-chapter-2'],[945,958,'cic-1983-book-4-part-1-title-3-chapter-3'],
  [959,959,'cic-1983-book-4-part-1-title-4'],[960,964,'cic-1983-book-4-part-1-title-4-chapter-1'],[965,986,'cic-1983-book-4-part-1-title-4-chapter-2'],[987,991,'cic-1983-book-4-part-1-title-4-chapter-3'],[992,997,'cic-1983-book-4-part-1-title-4-chapter-4'],
  [998,998,'cic-1983-book-4-part-1-title-5'],[999,1002,'cic-1983-book-4-part-1-title-5-chapter-1'],[1003,1003,'cic-1983-book-4-part-1-title-5-chapter-2'],[1004,1007,'cic-1983-book-4-part-1-title-5-chapter-3'],
  [1008,1009,'cic-1983-book-4-part-1-title-6'],[1010,1023,'cic-1983-book-4-part-1-title-6-chapter-1'],[1024,1025,'cic-1983-book-4-part-1-title-6-chapter-2'],[1026,1032,'cic-1983-book-4-part-1-title-6-chapter-2-article-1'],[1033,1039,'cic-1983-book-4-part-1-title-6-chapter-2-article-2'],[1040,1049,'cic-1983-book-4-part-1-title-6-chapter-2-article-3'],[1050,1052,'cic-1983-book-4-part-1-title-6-chapter-2-article-4'],[1053,1054,'cic-1983-book-4-part-1-title-6-chapter-3'],
  [1055,1062,'cic-1983-book-4-part-1-title-7'],[1063,1072,'cic-1983-book-4-part-1-title-7-chapter-1'],[1073,1082,'cic-1983-book-4-part-1-title-7-chapter-2'],[1083,1094,'cic-1983-book-4-part-1-title-7-chapter-3'],[1095,1107,'cic-1983-book-4-part-1-title-7-chapter-4'],[1108,1123,'cic-1983-book-4-part-1-title-7-chapter-5'],[1124,1129,'cic-1983-book-4-part-1-title-7-chapter-6'],[1130,1133,'cic-1983-book-4-part-1-title-7-chapter-7'],[1134,1140,'cic-1983-book-4-part-1-title-7-chapter-8'],[1141,1150,'cic-1983-book-4-part-1-title-7-chapter-9-article-1'],[1151,1155,'cic-1983-book-4-part-1-title-7-chapter-9-article-2'],[1156,1160,'cic-1983-book-4-part-1-title-7-chapter-10-article-1'],[1161,1165,'cic-1983-book-4-part-1-title-7-chapter-10-article-2'],
  [1166,1172,'cic-1983-book-4-part-2-title-1'],[1173,1175,'cic-1983-book-4-part-2-title-2'],[1176,1176,'cic-1983-book-4-part-2-title-3'],[1177,1182,'cic-1983-book-4-part-2-title-3-chapter-1'],[1183,1185,'cic-1983-book-4-part-2-title-3-chapter-2'],[1186,1190,'cic-1983-book-4-part-2-title-4'],[1191,1198,'cic-1983-book-4-part-2-title-5-chapter-1'],[1199,1204,'cic-1983-book-4-part-2-title-5-chapter-2'],
  [1205,1213,'cic-1983-book-4-part-3-title-1'],[1214,1222,'cic-1983-book-4-part-3-title-1-chapter-1'],[1223,1229,'cic-1983-book-4-part-3-title-1-chapter-2'],[1230,1234,'cic-1983-book-4-part-3-title-1-chapter-3'],[1235,1239,'cic-1983-book-4-part-3-title-1-chapter-4'],[1240,1243,'cic-1983-book-4-part-3-title-1-chapter-5'],[1244,1245,'cic-1983-book-4-part-3-title-2'],[1246,1248,'cic-1983-book-4-part-3-title-2-chapter-1'],[1249,1253,'cic-1983-book-4-part-3-title-2-chapter-2'],
]

const amended = new Set([838,868,1008,1009,1086,1108,1109,1111,1112,1116,1117,1124,1127])

function token(a,b){return a===b?String(a):`${a}-${b}`}
function decode(s){const map={nbsp:' ',amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',agrave:'à',egrave:'è',eacute:'é',igrave:'ì',ograve:'ò',ugrave:'ù',Agrave:'À',Egrave:'È',Eacute:'É',Igrave:'Ì',Ograve:'Ò',Ugrave:'Ù',rsquo:'’',lsquo:'‘',ldquo:'“',rdquo:'”',ndash:'–',mdash:'—',deg:'°'};return s.replace(/&#x([0-9a-f]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#(\d+);/g,(_,d)=>String.fromCodePoint(Number(d))).replace(/&([A-Za-z]+);/g,(m,n)=>map[n]??m)}
function toText(html){return decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<sup\b[^>]*>\s*n\s*<\/sup>/gi,'^{n}').replace(/<br\s*\/?>/gi,'\n').replace(/<\/(p|div|li|td|tr|h[1-6])>/gi,'\n').replace(/<[^>]+>/g,' ')).replace(/\r/g,'').replace(/[\t\f\v ]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim()}
function cleanBody(s,n){let t=s;for(const marker of ['Indica che il testo corrisponde','Redazione originaria','Articoli modificati da','Per la nuova redazione','Copyright ©']){const i=t.indexOf(marker);if(i>=0)t=t.slice(0,i)}t=t.replace(/§\s+(\d+)\s*\./g,'§$1.').replace(/§(\d+)\s*\./g,'§$1.').replace(/\s+(?=§\d+\.)/g,'\n\n').replace(/\s+(?=\d+\)\s)/g,'\n').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim();if(n===838&&/^1\.\s/.test(t)&&/§2\./.test(t))t=t.replace(/^1\.\s/,'§1. ');return t}

async function fetchOfficial(a,b){const file=`cic_libroIV_${token(a,b)}_it.html`;const tried=[];for(const base of BASES){const url=base+file;tried.push(url);const r=await fetch(url,{headers:{'user-agent':'Fonte-Iuris-Corpus-Builder/1.0'}});if(r.ok)return {url,html:await r.text()}}throw new Error(`Cannot fetch ${a}-${b}: ${tried.join(', ')}`)}

function extractPage(url,html,a,b){let text=toText(html);const foot=text.indexOf('Indica che il testo corrisponde');if(foot>=0)text=text.slice(0,foot);const re=/Can\.\s*(\d+)(?:\s*§\s*(\d+))?(?:\s*\^\{n\})?\s*[-–—]/g;const ms=[...text.matchAll(re)].filter(m=>Number(m[1])>=a&&Number(m[1])<=b);const out=[];for(let n=a;n<=b;n++){const occ=ms.filter(m=>Number(m[1])===n);if(!occ.length)throw new Error(`Missing Can. ${n} in ${url}`);let best=null;for(const m of occ){const start=(m.index??0)+m[0].length;const later=ms.filter(x=>(x.index??0)>start&&Number(x[1])>n).sort((x,y)=>(x.index??0)-(y.index??0))[0];const end=later?.index??text.length;let body=cleanBody(text.slice(start,end),n);if(m[2])body=`§${m[2]}. ${body}`;if(!best||body.length>best.length)best=body}if(!best||best.length<3)throw new Error(`Empty Can. ${n} in ${url}`);out.push({number:n,text:best,sourceUrl:url})}return out}
function unitFor(n){const r=unitRanges.find(([a,b])=>n>=a&&n<=b);if(!r)throw new Error(`No unit for ${n}`);return r[2]}

const collected=[]
for(const [a,b] of pages){const {url,html}=await fetchOfficial(a,b);const part=extractPage(url,html,a,b);collected.push(...part);console.log(`${a}-${b}: ${part.length}`)}
const numbers=collected.map(x=>x.number)
if(collected.length!==420)throw new Error(`Expected 420 canons, got ${collected.length}`)
for(let n=834;n<=1253;n++){if(!numbers.includes(n))throw new Error(`Missing ${n}`)}
if(new Set(numbers).size!==420)throw new Error('Duplicate canon numbers')

const blocks=[[834,896],[897,997],[998,1054],[1055,1165],[1166,1253]]
for(const [a,b] of blocks){const data=collected.filter(x=>x.number>=a&&x.number<=b);const name=`canons.${a}-${b}.static.ts`;const p=join('apps/studio/scripts/import-cic/data',name);await mkdir(dirname(p),{recursive:true});const body=`import type {CanonInput} from '../types'\nimport {segments} from './canonSource'\n\nexport const canons${a}to${b}: CanonInput[] = ${JSON.stringify(data.map(x=>({number:x.number,structuralUnitCanonicalId:unitFor(x.number),status:amended.has(x.number)?'amended':'inForce',versions:[{versionId:`cic-1983-can-${x.number}-it-current`,versionLabel:'Testo vigente — fonte ufficiale della Santa Sede',status:'current',language:'it',text:x.text,sourceDocumentTitle:'Codice di Diritto Canonico',sourceCitation:`CIC, can. ${x.number} — testo vigente`,sourceUrl:x.sourceUrl,segments:null}]})),null,2).replace(/"segments": null/g,'"segments": []')}\n\nfor (const canon of canons${a}to${b}) {\n  for (const version of canon.versions) version.segments = segments(canon.number, version.text)\n}\n`;await writeFile(p,body,'utf8')}
console.log('STATIC_BOOK4_OK 420/420')
