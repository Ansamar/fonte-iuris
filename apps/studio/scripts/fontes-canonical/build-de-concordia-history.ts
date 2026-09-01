import {createClient} from '@sanity/client'
import {readFile, writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/de-concordia-inter-codices')
const SOURCE=join(ROOT,'history-source')
const OUTPUT=join(ROOT,'history-canonical.json')
const EFFECTIVE='2016-12-16'
const HIST_FROM='1983-11-27'
const HIST_UNTIL='2016-12-15'
const CIC_URL='https://www.vatican.va/archive/cod-iuris-canonici/cic_index_it.html'

type Segment={segmentId:string;segmentType:'paragraph'|'number';label:string;order:number;parentSegmentId?:string;startOffset:number;endOffset:number;isFormalDivision:true}

function ptText(blocks:any[]){return (blocks||[]).map(b=>(b.children||[]).map((c:any)=>c.text||'').join('')).filter(Boolean).join('\n').trim()}
function normalize(s:string){return s.replace(/\^\{n\}/g,'').replace(/§\s+l\b/g,'§1').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{2,}/g,'\n').trim()}
function splitParts(text:string){return [...text.matchAll(/^§\s*(\d+)\.?\s*/gm)]}
function replaceParagraph(current:string,n:number,replacement:string){const ms=splitParts(current);const m=ms.find(x=>Number(x[1])===n);if(!m)throw new Error(`§${n} non trovato nel testo corrente`);const i=ms.indexOf(m);const start=m.index??0;const end=ms[i+1]?.index??current.length;return normalize(current.slice(0,start)+replacement.trim()+current.slice(end))}
function removeParagraph(current:string,n:number){const ms=splitParts(current);const m=ms.find(x=>Number(x[1])===n);if(!m)throw new Error(`§${n} non trovato nel testo corrente`);const i=ms.indexOf(m);const start=m.index??0;const end=ms[i+1]?.index??current.length;return normalize(current.slice(0,start)+current.slice(end))}
function extractOriginal(text:string,canon:number){const marker=text.search(/Redazione originaria/i);if(marker<0)throw new Error(`snapshot senza Redazione originaria per can. ${canon}`);const tail=text.slice(marker);const re=new RegExp(`Can\\.\\s*${canon}\\s*-\\s*([\\s\\S]*?)(?=\\s+Can\\.\\s*\\d+\\s*-|\\* \\* \\*|$)`,'i');const m=tail.match(re);if(!m)throw new Error(`redazione originaria Can. ${canon} non estratta`);return normalize(m[1])}
function compileSegments(canon:number,text:string):Segment[]{const result:Segment[]=[];const paragraphs=[...text.matchAll(/^§\s*(\d+)\s*[.:]?\s*/gm)];if(!paragraphs.length){addNumbers(result,canon,text,0,text.length);return result}for(let i=0;i<paragraphs.length;i++){const m=paragraphs[i];const p=Number(m[1]);const start=m.index??0;const end=paragraphs[i+1]?.index??text.length;const parent=`can-${canon}-par-${p}`;result.push({segmentId:parent,segmentType:'paragraph',label:`§ ${p}`,order:p,startOffset:start,endOffset:Math.max(start,end-1),isFormalDivision:true});addNumbers(result,canon,text.slice(start,end),start,end,parent)}return result}
function addNumbers(result:Segment[],canon:number,text:string,base:number,absoluteEnd:number,parent?:string){const nums=[...text.matchAll(/^(\d+)\s*[°º)]\s*/gm)];for(let i=0;i<nums.length;i++){const m=nums[i];const n=Number(m[1]);const start=base+(m.index??0);const next=nums[i+1]?base+(nums[i+1].index??text.length):absoluteEnd;result.push({segmentId:parent?`${parent}-num-${n}`:`can-${canon}-num-${n}`,segmentType:'number',label:`${n}°`,order:n,...(parent?{parentSegmentId:parent}:{}),startOffset:start,endOffset:Math.max(start,next-1),isFormalDivision:true})}}

async function main(){
 const canonical=JSON.parse(await readFile(join(ROOT,'canonical.json'),'utf8'));if(canonical.effectiveFrom!==EFFECTIVE)throw new Error(`effectiveFrom inatteso: ${canonical.effectiveFrom}`)
 const manifest=JSON.parse(await readFile(join(SOURCE,'manifest.json'),'utf8'));const texts=new Map<string,string>();for(const p of manifest.pages)texts.set(p.key,await readFile(join(SOURCE,p.text),'utf8'))
 const specs=[
  {canon:111,page:'96-112',mode:'whole'}, {canon:112,page:'96-112',mode:'whole'}, {canon:535,page:'515-552',mode:'p2'},
  {canon:868,page:'864-871',mode:'868'}, {canon:1108,page:'1108-1123',mode:'drop3'}, {canon:1109,page:'1108-1123',mode:'whole'},
  {canon:1111,page:'1108-1123',mode:'p1'}, {canon:1112,page:'1108-1123',mode:'p1'}, {canon:1116,page:'1108-1123',mode:'drop3'}, {canon:1127,page:'1124-1129',mode:'p1'},
 ] as const
 const versions:any[]=[]
 for(const s of specs){
  const canon:any=await client.fetch('*[_type=="canon"&&number==$n][0]{_id,number}',{n:s.canon});if(!canon)throw new Error(`Can. ${s.canon} assente`)
  const current:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id&&language=="it"&&status=="current"]{_id,versionId,fullText}',{id:canon._id});if(current.length!==1)throw new Error(`Can. ${s.canon}: current IT=${current.length}`)
  const currentText=normalize(ptText(current[0].fullText));const source=texts.get(s.page)??'';let historical=''
  if(s.mode==='whole') historical=extractOriginal(source,s.canon)
  else if(s.mode==='p2') historical=replaceParagraph(currentText,2,extractOriginal(source,s.canon))
  else if(s.mode==='p1') historical=replaceParagraph(currentText,1,extractOriginal(source,s.canon))
  else if(s.mode==='drop3') historical=removeParagraph(currentText,3)
  else {historical=removeParagraph(currentText,3).replace(/\s*fermo restando il §3\s*;?/i,';');historical=normalize(historical)}
  if(!historical||historical===currentText)throw new Error(`Can. ${s.canon}: ricostruzione storica non differisce dal vigente`)
  const versionId=`cic-1983-can-${s.canon}-it-1983`
  versions.push({canon:s.canon,canonRef:canon._id,versionId,versionDocumentId:`version-${versionId}`,versionLabel:'Testo previgente — fino al 15 dicembre 2016',status:'historical',language:'it',validFrom:HIST_FROM,validUntil:HIST_UNTIL,text:historical,sourceCitation:`Codice di Diritto Canonico, can. ${s.canon} — redazione previgente a De concordia inter Codices`,sourceUrl:CIC_URL,currentVersionRef:current[0]._id,currentVersionId:current[0].versionId,currentValidFrom:EFFECTIVE,segments:compileSegments(s.canon,historical)})
  console.log(`✔ Can. ${s.canon}: storico costruito — ${historical.length} caratteri — ${versions.at(-1).segments.length} segmenti`)
 }
 const output={schemaVersion:1,documentId:canonical.documentId,effectiveFrom:EFFECTIVE,historicalValidFrom:HIST_FROM,historicalValidUntil:HIST_UNTIL,sourceManifest:'history-source/manifest.json',versions}
 await writeFile(OUTPUT,JSON.stringify(output,null,2)+'\n','utf8');console.log(`DE CONCORDIA HISTORY CANONICAL BUILT — ${versions.length}/10 versioni — ${versions.reduce((n,v)=>n+v.segments.length,0)} segmenti`);console.log(`canonical=${OUTPUT}`)
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exitCode=1})
