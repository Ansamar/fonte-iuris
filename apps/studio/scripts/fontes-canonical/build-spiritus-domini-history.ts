import {createClient} from '@sanity/client'
import {readFile, writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/spiritus-domini')
const OUTPUT=join(ROOT,'history-canonical.json')
const EFFECTIVE='2021-01-11'
const HIST_FROM='1983-11-27'
const HIST_UNTIL='2021-01-10'
const CIC_URL='https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_224-231_it.html'
const ORIGINAL_P1="§1. I laici di sesso maschile, che abbiano l'età e le doti determinate con decreto dalla Conferenza Episcopale, possono essere assunti stabilmente, mediante il rito liturgico stabilito, ai ministeri di lettori e di accoliti; tuttavia tale conferimento non attribuisce loro il diritto al sostentamento o alla rimunerazione da parte della Chiesa."

type Segment={segmentId:string;segmentType:'paragraph';label:string;order:number;startOffset:number;endOffset:number;isFormalDivision:true}

function ptText(blocks:any[]){return (blocks||[]).map(b=>(b.children||[]).map((c:any)=>c.text||'').join('')).filter(Boolean).join('\n').trim()}
function normalize(s:string){return s.replace(/\^\{n\}/g,'').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{2,}/g,'\n').trim()}
function normalizeHtml(s:string){return s.replace(/&nbsp;|&#160;|&#xA0;/gi,' ').replace(/&sect;|&#167;|&#xA7;/gi,'§').replace(/&rsquo;|&#8217;|&#x2019;/gi,'’').replace(/&agrave;|&#224;|&#xE0;/gi,'à').replace(/&egrave;|&#232;|&#xE8;/gi,'è').replace(/&igrave;|&#236;|&#xEC;/gi,'ì').replace(/&ograve;|&#242;|&#xF2;/gi,'ò').replace(/&ugrave;|&#249;|&#xF9;/gi,'ù').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
function replaceParagraph(current:string,n:number,replacement:string){const matches=[...current.matchAll(/^§\s*(\d+)\.?\s*/gm)];const m=matches.find(x=>Number(x[1])===n);if(!m)throw new Error(`§${n} non trovato nel testo corrente`);const i=matches.indexOf(m);const start=m.index??0;const end=matches[i+1]?.index??current.length;return normalize(current.slice(0,start)+replacement.trim()+'\n'+current.slice(end))}
function compileSegments(text:string):Segment[]{const result:Segment[]=[];const matches=[...text.matchAll(/^§\s*(\d+)\s*[.:]?\s*/gm)];for(let i=0;i<matches.length;i++){const m=matches[i];const p=Number(m[1]);const start=m.index??0;const end=matches[i+1]?.index??text.length;result.push({segmentId:`can-230-par-${p}`,segmentType:'paragraph',label:`§ ${p}`,order:p,startOffset:start,endOffset:Math.max(start,end-1),isFormalDivision:true})}return result}

async function main(){
 const canonical=JSON.parse(await readFile(join(ROOT,'canonical.json'),'utf8'));if(canonical.effectiveFrom!==EFFECTIVE)throw new Error(`effectiveFrom inatteso: ${canonical.effectiveFrom}`)
 const manifest=JSON.parse(await readFile(join(ROOT,'manifest.json'),'utf8'));const canonSource=manifest.sources?.find((x:any)=>x.key==='canon-230');if(!canonSource)throw new Error('snapshot canon-230 assente dal manifest')
 const html=await readFile(join(process.cwd(),canonSource.path),'utf8');const visible=normalizeHtml(html);if(!visible.includes('Redazione originaria')||!visible.includes(ORIGINAL_P1.replace(/^§1\.\s*/,'')))throw new Error('redazione originaria del can. 230 §1 non verificata nello snapshot ufficiale')
 const canon:any=await client.fetch('*[_type=="canon"&&number==230][0]{_id,number}');if(!canon)throw new Error('Can. 230 assente')
 const currents:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id&&language=="it"&&status=="current"]{_id,versionId,fullText}',{id:canon._id});if(currents.length!==1)throw new Error(`Can. 230: current IT=${currents.length}`)
 const current=currents[0];const currentText=normalize(ptText(current.fullText));const historical=replaceParagraph(currentText,1,ORIGINAL_P1)
 if(!historical||historical===currentText)throw new Error('Can. 230: ricostruzione storica non differisce dal vigente')
 const versionId='cic-1983-can-230-it-1983';const version={canon:230,canonRef:canon._id,versionId,versionDocumentId:`version-${versionId}`,versionLabel:'Testo previgente — fino al 10 gennaio 2021',status:'historical',language:'it',validFrom:HIST_FROM,validUntil:HIST_UNTIL,text:historical,sourceCitation:'Codice di Diritto Canonico, can. 230 — redazione previgente a Spiritus Domini',sourceUrl:CIC_URL,currentVersionRef:current._id,currentVersionId:current.versionId,currentValidFrom:EFFECTIVE,segments:compileSegments(historical)}
 const output={schemaVersion:1,documentId:canonical.documentId,effectiveFrom:EFFECTIVE,historicalValidFrom:HIST_FROM,historicalValidUntil:HIST_UNTIL,sourceManifest:'manifest.json',versions:[version]}
 await writeFile(OUTPUT,JSON.stringify(output,null,2)+'\n','utf8')
 console.log(`✔ Can. 230: storico costruito — ${historical.length} caratteri — ${version.segments.length} segmenti`)
 console.log(`SPIRITUS DOMINI HISTORY CANONICAL BUILT — 1/1 versione — ${version.segments.length} segmenti`)
 console.log(`canonical=${OUTPUT}`)
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exitCode=1})
