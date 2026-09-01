import {createClient} from '@sanity/client'
import {readFile,writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere/history-missing')
const OUT=join(ROOT,'history-canonical.json')
const FROM='2022-02-15', UNTIL='2022-02-14', START='1983-11-27'
const CANONS=[237,242,265,1308,1310]

function ptText(blocks:any[]|undefined){return (blocks||[]).map(b=>(b.children||[]).map((c:any)=>c.text||'').join('')).filter(Boolean).join('\n').trim()}
function norm(s:string){return s.replace(/\^\{n\}/g,'').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{2,}/g,'\n').trim()}
function paragraphs(canon:number,text:string){const ms=[...text.matchAll(/(?:^|\n)§\s*(\d+)\s*[.:]?\s*/g)];return ms.map((m,i)=>{const start=(m.index??0)+(m[0].startsWith('\n')?1:0);const end=(ms[i+1]?.index??text.length);const p=Number(m[1]);return {segmentId:`can-${canon}-par-${p}`,segmentType:'paragraph',label:`§ ${p}`,order:p,startOffset:start,endOffset:Math.max(start,end-1),isFormalDivision:true}})}
function replaceP(text:string,p:number,repl:string){const ms=[...text.matchAll(/(?:^|\n)§\s*(\d+)\s*[.:]?\s*/g)];const i=ms.findIndex(m=>Number(m[1])===p);if(i<0)throw new Error(`§${p} non trovato`);const start=(ms[i].index??0)+(ms[i][0].startsWith('\n')?1:0);const end=ms[i+1]?.index??text.length;return norm(text.slice(0,start)+repl+'\n'+text.slice(end))}

const P237="§2. Non si eriga un seminario interdiocesano se prima non è stata ottenuta l'approvazione della Sede Apostolica, sia in ordine alla erezione del seminario, sia in ordine ai suoi statuti: da parte della Conferenza Episcopale, se si tratta di un seminario per tutto il territorio corrispondente, altrimenti da parte dei Vescovi interessati."
const P242="§1. In ogni nazione vi sia una Ratio di formazione sacerdotale, emanata dalla Conferenza Episcopale sulla base delle norme fissate dalla suprema autorità della Chiesa e approvata dalla Santa Sede, adattabile alle nuove situazioni con una nuova approvazione della Santa Sede; in essa vengano definiti i principi essenziali e le norme generali della formazione seminaristica, adattate alle necessità pastorali di ogni regione o provincia."
const OLD265='Ogni chierico deve essere incardinato o in una Chiesa particolare o in una prelatura personale oppure in un istituto di vita consacrata o in una società che ne abbiano la facoltà, in modo che non siano assolutamente ammessi chierici acefali o girovaghi.'
const OLD1308="§1. La riduzione degli oneri delle Messe, da farsi soltanto per causa giusta e necessaria, è riservata alla Sede Apostolica, salvo le disposizioni che seguono.\n§2. Se ciò sia espressamente stabilito nelle tavole di fondazione, l'Ordinario a causa della diminuzione dei redditi può ridurre gli oneri delle Messe.\n§3. Il Vescovo diocesano ha la potestà di ridurre a causa della diminuzione dei redditi e fintantoché tale causa perduri, le Messe dei legati o in qualsiasi modo fondate, che sono autonomi, secondo l'elemosina legittimamente vigente in diocesi, purché non vi sia persona obbligata e che possa essere efficacemente coatta a provvedere all'aumento dell'elemosina.\n§4. Al medesimo compete la potestà di ridurre gli oneri o legati di Messe che gravano su istituti ecclesiastici, se i redditi siano diventati insufficienti a conseguire convenientemente le finalità proprie dell'istituto ecclesiastico stesso.\n§5. Ha le stesse facoltà di cui nei §§3 e 4 il Moderatore supremo di un istituto religioso clericale di diritto pontificio."
const OLD1310="§1. La riduzione, il contenimento e la permuta delle volontà dei fedeli a favore di cause pie possono essere attuate soltanto per causa giusta e necessaria dall'Ordinario, se il fondatore gli abbia espressamente concesso questa potestà.\n§2. Se l'esecuzione degli oneri imposti sia diventata impossibile per la diminuzione dei redditi o per altra causa, senza che gli amministratori ne abbiano colpa alcuna, l'Ordinario, uditi gli interessati e il proprio consiglio per gli affari economici e rispettata nel miglior modo possibile la volontà del fondatore, potrà equamente diminuire gli stessi oneri, ad eccezione della riduzione delle Messe che è regolata dalle disposizioni del can. 1308.\n§3. Nei rimanenti casi si deve ricorrere alla Sede Apostolica."

async function main(){
 console.log('\nBUILD HISTORY CANONICAL — COMPETENTIAS — CAN. 237, 242, 265, 1308, 1310')
 const manifest=JSON.parse(await readFile(join(ROOT,'manifest.json'),'utf8'))
 if(manifest.scope!=='competentias-history-missing')throw new Error('manifest scope inatteso')
 const versions:any[]=await client.fetch('*[_type=="canonVersion" && canon->number in $ns && language=="it"]{_id,versionId,status,language,validFrom,validUntil,fullText,canon->{_id,number,canonicalId}}',{ns:CANONS})
 const canons=[] as any[]
 for(const n of CANONS){
  const matches=versions.filter(v=>v.canon?.number===n)
  if(matches.length!==1)throw new Error(`Can. ${n}: attesa 1 versione IT production, trovate ${matches.length}`)
  const v=matches[0], current=norm(ptText(v.fullText));let old=''
  if(n===237)old=replaceP(current,2,P237)
  else if(n===242)old=replaceP(current,1,P242)
  else if(n===265)old=OLD265
  else if(n===1308)old=OLD1308
  else old=OLD1310
  const expectedCurrentSegments=n===265?0:n===1308?4:n===1310?2:2
  const expectedOldSegments=n===265?0:n===1308?5:n===1310?3:2
  const oldSeg=paragraphs(n,old), curSeg=paragraphs(n,current)
  if(oldSeg.length!==expectedOldSegments||curSeg.length!==expectedCurrentSegments)throw new Error(`Can. ${n}: segmentazione inattesa old=${oldSeg.length} current=${curSeg.length}`)
  canons.push({canon:n,canonRef:v.canon._id,existingCurrent:{versionRef:v._id,versionId:v.versionId},actions:[
   {action:'create-historical',versionDocumentId:`version-cic-1983-can-${n}-it-1983`,versionId:`cic-1983-can-${n}-it-1983`,versionLabel:'Redazione originaria CIC 1983',status:'historical',language:'it',validFrom:START,validUntil:UNTIL,text:old,segments:oldSeg},
   {action:'migrate-current-to-2022',fromVersionRef:v._id,fromVersionId:v.versionId,toVersionDocumentId:`version-cic-1983-can-${n}-it-2022`,toVersionId:`cic-1983-can-${n}-it-2022`,versionLabel:'Versione vigente da Competentias quasdam decernere',status:'current',language:'it',validFrom:FROM,validUntil:null,text:current,segments:curSeg}
  ]})
  console.log(`✔ Can. ${n}: 1983 (${oldSeg.length} segmenti) → 2022 corrente (${curSeg.length} segmenti)`)
 }
 const plan={schemaVersion:1,scope:'competentias-history-missing',effectiveFrom:FROM,canons,provenance:{manifest:'manifest.json',note:'Le redazioni originarie e vigenti sono attestate negli snapshot ufficiali CIC congelati e validati; Competentias quasdam decernere è la fonte normativa della modifica.'}}
 await writeFile(OUT,JSON.stringify(plan,null,2)+'\n','utf8')
 console.log(`✔ CANONICAL HISTORY COSTRUITA — ${OUT}`)
}
main().catch(e=>{console.error('\n✖ BUILD FALLITA');console.error(e instanceof Error?e.message:e);process.exit(1)})
