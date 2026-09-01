import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere/history-missing')
const FILE=join(ROOT,'history-canonical.json')
const EXPECTED=[237,242,265,1308,1310]
const START='1983-11-27', CUT='2022-02-14', FROM='2022-02-15'

const COUNTS:any={237:[2,2],242:[2,2],265:[0,0],1308:[5,4],1310:[3,2]}
const MARKERS:any={
  237:{old:["approvazione della Sede Apostolica"],cur:["conferma della Sede Apostolica"]},
  242:{old:["approvata dalla Santa Sede","nuova approvazione della Santa Sede"],cur:["confermata dalla Santa Sede","nuova confermazione della Santa Sede"]},
  265:{old:["prelatura personale","acefali o girovaghi"],cur:["Associazione pubblica clericale","Sede Apostolica"]},
  1308:{old:["riservata alla Sede Apostolica","§5.","istituto religioso clericale di diritto pontificio"],cur:["riservata al Vescovo diocesano","§4.","società di vita apostolica clericali"]},
  1310:{old:["se il fondatore gli abbia espressamente concesso questa potestà","§3. Nei rimanenti casi si deve ricorrere alla Sede Apostolica"],cur:["uditi gli interessati e il proprio consiglio per gli affari economici","Nei rimanenti casi si deve ricorrere alla Sede Apostolica"]},
}

function fail(errors:string[],msg:string){errors.push(msg);console.log(`✖ ${msg}`)}
function ok(msg:string){console.log(`✔ ${msg}`)}
function validateVersionLocalSegmentIds(errors:string[],n:number,label:string,segments:any[]){
 const ids=(segments||[]).map((s:any)=>s.segmentId)
 if(new Set(ids).size!==ids.length)fail(errors,`Can. ${n} ${label}: segmentId duplicati nella stessa versione`)
 for(const s of segments||[]){
  if(!s.segmentId?.startsWith(`can-${n}-`))fail(errors,`Can. ${n} ${label}: segmentId non coerente ${s.segmentId}`)
  if(typeof s.startOffset!=='number'||typeof s.endOffset!=='number'||s.startOffset<0||s.endOffset<s.startOffset)fail(errors,`Can. ${n} ${label}: offset segmento non validi ${s.segmentId}`)
 }
}

async function main(){
 console.log('\nVALIDAZIONE FORTE HISTORY CANONICAL — COMPETENTIAS — CAN. 237, 242, 265, 1308, 1310')
 const errors:string[]=[]
 const plan=JSON.parse(await readFile(FILE,'utf8'))
 if(plan.scope==='competentias-history-missing')ok('scope corretto');else fail(errors,`scope inatteso: ${plan.scope}`)
 if(plan.effectiveFrom===FROM)ok(`effectiveFrom=${FROM}`);else fail(errors,`effectiveFrom inatteso: ${plan.effectiveFrom}`)
 const nums=(plan.canons||[]).map((x:any)=>x.canon).sort((a:number,b:number)=>a-b)
 if(JSON.stringify(nums)===JSON.stringify(EXPECTED))ok(`canoni corretti: ${EXPECTED.join(', ')}`);else fail(errors,`scope canoni inatteso: ${nums.join(', ')}`)

 for(const n of EXPECTED){
  const c=plan.canons?.find((x:any)=>x.canon===n)
  if(!c){fail(errors,`Can. ${n}: assente`);continue}
  const old=c.actions?.find((a:any)=>a.action==='create-historical')
  const cur=c.actions?.find((a:any)=>a.action==='migrate-current-to-2022')
  if(!old||!cur){fail(errors,`Can. ${n}: azioni canoniche incomplete`);continue}
  const [oldCount,curCount]=COUNTS[n]
  if(old.validFrom!==START||old.validUntil!==CUT||old.status!=='historical'||old.language!=='it')fail(errors,`Can. ${n}: intervallo/stato storico errato`)
  else ok(`Can. ${n}: storico ${START} → ${CUT}`)
  if(cur.validFrom!==FROM||cur.validUntil!==null||cur.status!=='current'||cur.language!=='it')fail(errors,`Can. ${n}: intervallo/stato corrente errato`)
  else ok(`Can. ${n}: corrente dal ${FROM}`)
  if((old.segments||[]).length!==oldCount)fail(errors,`Can. ${n}: segmenti storici ${(old.segments||[]).length}, attesi ${oldCount}`)
  if((cur.segments||[]).length!==curCount)fail(errors,`Can. ${n}: segmenti correnti ${(cur.segments||[]).length}, attesi ${curCount}`)
  for(const m of MARKERS[n].old)if(!old.text.includes(m))fail(errors,`Can. ${n} storico: manca marcatore «${m}»`)
  for(const m of MARKERS[n].cur)if(!cur.text.includes(m))fail(errors,`Can. ${n} corrente: manca marcatore «${m}»`)
  if(old.versionDocumentId!==`version-cic-1983-can-${n}-it-1983`||old.versionId!==`cic-1983-can-${n}-it-1983`)fail(errors,`Can. ${n}: ID storico non deterministico`)
  if(cur.toVersionDocumentId!==`version-cic-1983-can-${n}-it-2022`||cur.toVersionId!==`cic-1983-can-${n}-it-2022`)fail(errors,`Can. ${n}: ID 2022 non deterministico`)
  validateVersionLocalSegmentIds(errors,n,'storico',old.segments||[])
  validateVersionLocalSegmentIds(errors,n,'corrente',cur.segments||[])
 }

 console.log(`\nErrori: ${errors.length}`)
 if(errors.length){console.error('✖ HISTORY CANONICAL COMPETENTIAS MANCANTE NON VALIDA');process.exit(1)}
 console.log('✔ HISTORY CANONICAL COMPETENTIAS MANCANTE VALIDA — 0 errori')
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exit(1)})
