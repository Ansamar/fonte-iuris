import {createHash} from 'node:crypto'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/de-concordia-inter-codices')
const EXPECTED=[111,112,535,868,1108,1109,1111,1112,1116,1127]
const EFFECTIVE='2016-12-16'
const HIST_FROM='1983-11-27'
const HIST_UNTIL='2016-12-15'

function fail(errors:string[],message:string){errors.push(message);console.log(`✖ ${message}`)}
async function main(){
 const errors:string[]=[]
 const raw=await readFile(join(ROOT,'history-canonical.json'),'utf8')
 const data=JSON.parse(raw)
 const manifest=JSON.parse(await readFile(join(ROOT,'history-source/manifest.json'),'utf8'))
 console.log('\nVALIDAZIONE FORTE — DE CONCORDIA HISTORY')
 if(data.schemaVersion!==1)fail(errors,`schemaVersion=${data.schemaVersion}, atteso 1`)
 if(data.effectiveFrom!==EFFECTIVE)fail(errors,`effectiveFrom=${data.effectiveFrom}, atteso ${EFFECTIVE}`)
 if(data.historicalValidFrom!==HIST_FROM)fail(errors,`historicalValidFrom=${data.historicalValidFrom}, atteso ${HIST_FROM}`)
 if(data.historicalValidUntil!==HIST_UNTIL)fail(errors,`historicalValidUntil=${data.historicalValidUntil}, atteso ${HIST_UNTIL}`)
 if(!Array.isArray(manifest.pages)||manifest.pages.length!==5)fail(errors,'manifest storico: attese 5 pagine')
 for(const p of manifest.pages??[]){const html=await readFile(join(ROOT,'history-source',p.html));const hash=createHash('sha256').update(html).digest('hex');if(hash!==p.sha256)fail(errors,`${p.key}: SHA-256 snapshot non coincide`)}
 if(!Array.isArray(data.versions)||data.versions.length!==10)fail(errors,`versioni=${data.versions?.length??0}, attese 10`)
 const seenCanon=new Set<number>(),seenVersion=new Set<string>(),seenDoc=new Set<string>()
 let segmentCount=0
 for(const v of data.versions??[]){
  if(!EXPECTED.includes(v.canon))fail(errors,`Can. ${v.canon}: non previsto`)
  if(seenCanon.has(v.canon))fail(errors,`Can. ${v.canon}: duplicato`);seenCanon.add(v.canon)
  const expectedId=`cic-1983-can-${v.canon}-it-1983`
  if(v.versionId!==expectedId)fail(errors,`Can. ${v.canon}: versionId ${v.versionId} != ${expectedId}`)
  if(v.versionDocumentId!==`version-${expectedId}`)fail(errors,`Can. ${v.canon}: versionDocumentId non deterministico`)
  if(seenVersion.has(v.versionId))fail(errors,`${v.versionId}: duplicato`);seenVersion.add(v.versionId)
  if(seenDoc.has(v.versionDocumentId))fail(errors,`${v.versionDocumentId}: duplicato`);seenDoc.add(v.versionDocumentId)
  if(v.status!=='historical'||v.language!=='it')fail(errors,`Can. ${v.canon}: status/language non validi`)
  if(v.validFrom!==HIST_FROM||v.validUntil!==HIST_UNTIL||v.currentValidFrom!==EFFECTIVE)fail(errors,`Can. ${v.canon}: intervallo temporale non valido`)
  if(!v.canonRef||!v.currentVersionRef||!v.currentVersionId)fail(errors,`Can. ${v.canon}: riferimenti mancanti`)
  if(typeof v.text!=='string'||!v.text.trim())fail(errors,`Can. ${v.canon}: testo storico vuoto`)
  if(/\^\{n\}/.test(v.text))fail(errors,`Can. ${v.canon}: residuo ^{n} nel testo storico`)
  const segIds=new Set<string>();let lastStart=-1
  for(const s of v.segments??[]){segmentCount++;if(segIds.has(s.segmentId))fail(errors,`Can. ${v.canon}: segmentId duplicato ${s.segmentId}`);segIds.add(s.segmentId);if(!['paragraph','number'].includes(s.segmentType))fail(errors,`Can. ${v.canon}: segmentType non valido ${s.segmentType}`);if(!s.label)fail(errors,`Can. ${v.canon}: label segmento mancante`);if(!Number.isInteger(s.order)||s.order<0)fail(errors,`Can. ${v.canon}: order segmento non valido`);if(!Number.isInteger(s.startOffset)||!Number.isInteger(s.endOffset)||s.startOffset<0||s.endOffset<s.startOffset||s.endOffset>=v.text.length)fail(errors,`Can. ${v.canon}: offset non valido ${s.segmentId}`);if(s.startOffset<lastStart)fail(errors,`Can. ${v.canon}: ordine offset non crescente`);lastStart=s.startOffset;if(s.parentSegmentId&&!segIds.has(s.parentSegmentId))fail(errors,`Can. ${v.canon}: parent ${s.parentSegmentId} non precede il figlio`)}
  console.log(`✔ Can. ${v.canon}: ${v.versionId} — ${v.text.length} caratteri — ${(v.segments??[]).length} segmenti`)
 }
 for(const n of EXPECTED)if(!seenCanon.has(n))fail(errors,`Can. ${n}: versione storica mancante`)
 console.log(`\nVersioni: ${data.versions?.length??0}/10`);console.log(`Segmenti: ${segmentCount}`);console.log(`Errori: ${errors.length}`)
 if(errors.length){console.log('✖ DE CONCORDIA HISTORY NON VALIDO');process.exitCode=1}else console.log('✔ DE CONCORDIA HISTORY VALID — 10/10 versioni — 0 errori')
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exit(1)})
