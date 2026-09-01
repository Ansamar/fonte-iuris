import {createHash} from 'node:crypto'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/spiritus-domini')
const EFFECTIVE='2021-01-11'
const HIST_FROM='1983-11-27'
const HIST_UNTIL='2021-01-10'
const ORIGINAL='I laici di sesso maschile, che abbiano l\'età e le doti determinate con decreto dalla Conferenza Episcopale'

function fail(errors:string[],message:string){errors.push(message);console.log(`✖ ${message}`)}

async function main(){
 const errors:string[]=[]
 const data=JSON.parse(await readFile(join(ROOT,'history-canonical.json'),'utf8'))
 const manifest=JSON.parse(await readFile(join(ROOT,'manifest.json'),'utf8'))
 console.log('\nVALIDAZIONE FORTE — SPIRITUS DOMINI HISTORY')
 if(data.schemaVersion!==1)fail(errors,`schemaVersion=${data.schemaVersion}, atteso 1`)
 if(data.documentId!=='francis-2021-spiritus-domini')fail(errors,`documentId=${data.documentId}`)
 if(data.effectiveFrom!==EFFECTIVE)fail(errors,`effectiveFrom=${data.effectiveFrom}, atteso ${EFFECTIVE}`)
 if(data.historicalValidFrom!==HIST_FROM)fail(errors,`historicalValidFrom=${data.historicalValidFrom}, atteso ${HIST_FROM}`)
 if(data.historicalValidUntil!==HIST_UNTIL)fail(errors,`historicalValidUntil=${data.historicalValidUntil}, atteso ${HIST_UNTIL}`)
 if(!Array.isArray(manifest.sources)||manifest.sources.length!==3)fail(errors,'manifest: attese 3 fonti')
 for(const source of manifest.sources??[]){const bytes=await readFile(join(process.cwd(),source.path));const hash=createHash('sha256').update(bytes).digest('hex');if(hash!==source.sha256)fail(errors,`${source.key}: SHA-256 snapshot non coincide`)}
 if(!Array.isArray(data.versions)||data.versions.length!==1)fail(errors,`versioni=${data.versions?.length??0}, attesa 1`)
 const v=data.versions?.[0]
 if(v){
  if(v.canon!==230)fail(errors,`canon=${v.canon}, atteso 230`)
  if(v.versionId!=='cic-1983-can-230-it-1983')fail(errors,`versionId=${v.versionId}`)
  if(v.versionDocumentId!=='version-cic-1983-can-230-it-1983')fail(errors,'versionDocumentId non deterministico')
  if(v.status!=='historical'||v.language!=='it')fail(errors,'status/language non validi')
  if(v.validFrom!==HIST_FROM||v.validUntil!==HIST_UNTIL||v.currentValidFrom!==EFFECTIVE)fail(errors,'intervallo temporale non valido')
  if(!v.canonRef||!v.currentVersionRef||!v.currentVersionId)fail(errors,'riferimenti mancanti')
  if(typeof v.text!=='string'||!v.text.trim())fail(errors,'testo storico vuoto')
  else {
   if(!v.text.includes(ORIGINAL))fail(errors,'redazione originaria §1 non presente nel testo storico')
   if(!/^§\s*1\s*[.:]?\s+/m.test(v.text)||!/^§\s*2\s*[.:]?\s+/m.test(v.text)||!/^§\s*3\s*[.:]?\s+/m.test(v.text))fail(errors,'§1–§3 non tutti presenti nel testo storico')
   if(/\^\{n\}/.test(v.text))fail(errors,'residuo ^{n} nel testo storico')
  }
  const segs=v.segments??[];if(segs.length!==3)fail(errors,`segmenti=${segs.length}, attesi 3`)
  const ids=new Set<string>();let lastStart=-1
  for(const s of segs){if(ids.has(s.segmentId))fail(errors,`segmentId duplicato ${s.segmentId}`);ids.add(s.segmentId);if(s.segmentType!=='paragraph')fail(errors,`segmentType non valido ${s.segmentType}`);if(!Number.isInteger(s.order)||s.order<1||s.order>3)fail(errors,`order non valido ${s.segmentId}`);if(!Number.isInteger(s.startOffset)||!Number.isInteger(s.endOffset)||s.startOffset<0||s.endOffset<s.startOffset||s.endOffset>=v.text.length)fail(errors,`offset non valido ${s.segmentId}`);if(s.startOffset<lastStart)fail(errors,'ordine offset non crescente');lastStart=s.startOffset}
  for(let p=1;p<=3;p++)if(!ids.has(`can-230-par-${p}`))fail(errors,`segmento can-230-par-${p} mancante`)
  console.log(`✔ Can. 230: ${v.versionId} — ${v.text?.length??0} caratteri — ${segs.length} segmenti`)
 }
 console.log(`\nVersioni: ${data.versions?.length??0}/1`);console.log(`Segmenti: ${v?.segments?.length??0}`);console.log(`Errori: ${errors.length}`)
 if(errors.length){console.log('✖ SPIRITUS DOMINI HISTORY NON VALIDO');process.exitCode=1}else console.log('✔ SPIRITUS DOMINI HISTORY VALID — 1/1 versione — 3 segmenti — 0 errori')
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exit(1)})
