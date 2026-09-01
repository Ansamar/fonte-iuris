import {createClient} from '@sanity/client'
import {readFile,writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere')
const HIST_ROOT=join(ROOT,'history-699-700')
const OUTPUT=join(HIST_ROOT,'history-canonical.json')

const COMPETENTIAS_FROM='2022-02-15'
const PRE_COMPETENTIAS_UNTIL='2022-02-14'
const EXPEDIT_FROM='2023-05-07'
const PRE_EXPEDIT_UNTIL='2023-05-06'

const CAN699_P2_2022='§2. Nei monasteri sui iuris, di cui al can. 615, la decisione circa la dimissione di un professo compete al Superiore maggiore con il consenso del suo consiglio.'
const CAN700_2022="Il decreto di dimissione emesso nei confronti di un professo ha vigore nel momento in cui viene notificato all’interessato. Il decreto tuttavia per avere valore, deve indicare il diritto, di cui gode il religioso dimesso, di ricorrere all’autorità competente entro dieci giorni dalla ricezione della notifica. Il ricorso ha effetto sospensivo."

function ptText(blocks:any[]|undefined){return (blocks||[]).map(b=>(b.children||[]).map((c:any)=>c.text||'').join('')).filter(Boolean).join('\n').trim()}
function normalize(s:string){return s.replace(/\^\{n\}/g,'').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{2,}/g,'\n').trim()}
function normalizeHtml(s:string){return s.replace(/&nbsp;|&#160;|&#xA0;/gi,' ').replace(/&sect;|&#167;|&#xA7;/gi,'§').replace(/&rsquo;|&#8217;|&#x2019;/gi,'’').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
function replaceParagraph(current:string,n:number,replacement:string){const matches=[...current.matchAll(/^§\s*(\d+)\.?\s*/gm)];const m=matches.find(x=>Number(x[1])===n);if(!m)throw new Error(`§${n} non trovato`);const i=matches.indexOf(m);const start=m.index??0;const end=matches[i+1]?.index??current.length;return normalize(current.slice(0,start)+replacement.trim()+'\n'+current.slice(end))}
function compileParagraphs(canon:number,text:string){const out:any[]=[];const matches=[...text.matchAll(/^§\s*(\d+)\s*[.:]?\s*/gm)];for(let i=0;i<matches.length;i++){const m=matches[i];const p=Number(m[1]);const start=m.index??0;const end=matches[i+1]?.index??text.length;out.push({segmentId:`can-${canon}-par-${p}`,segmentType:'paragraph',label:`§ ${p}`,order:p,startOffset:start,endOffset:Math.max(start,end-1),isFormalDivision:true})}return out}

async function getCanon(n:number){const c:any=await client.fetch('*[_type=="canon"&&number==$n][0]{_id,number,canonicalId}',{n});if(!c)throw new Error(`Can. ${n} assente`);return c}
async function getVersion(id:string){return client.fetch('*[_type=="canonVersion"&&versionId==$id][0]{_id,versionId,status,language,validFrom,validUntil,fullText}',{id})}

async function main(){
 console.log('\nBUILD HISTORY CANONICAL — COMPETENTIAS CAN. 699–700')
 const canonical=JSON.parse(await readFile(join(ROOT,'canonical.json'),'utf8'))
 if(canonical.effectiveFrom!==COMPETENTIAS_FROM)throw new Error(`effectiveFrom inatteso: ${canonical.effectiveFrom}`)
 const manifest=JSON.parse(await readFile(join(HIST_ROOT,'manifest.json'),'utf8'))
 const cicSource=manifest.sources?.find((x:any)=>x.key==='cic-694-704')
 const expeditSource=manifest.sources?.find((x:any)=>x.key==='expedit-ut-iura')
 const rescriptSource=manifest.sources?.find((x:any)=>x.key==='rescriptum-699-2026')
 if(!cicSource||!expeditSource||!rescriptSource)throw new Error('manifest storico 699–700 incompleto')
 const cicHtml=normalizeHtml(await readFile(join(process.cwd(),cicSource.path),'utf8'))
 const expeditHtml=normalizeHtml(await readFile(join(process.cwd(),expeditSource.path),'utf8'))
 if(!cicHtml.includes('Redazione originaria')||!cicHtml.includes(CAN699_P2_2022.replace(/^§2\.\s*/,''))||!cicHtml.includes(CAN700_2022))throw new Error('snapshot CIC non contiene le redazioni 699–700 attese')
 if(!expeditHtml.includes('trenta giorni')||!expeditHtml.includes('can. 1734'))throw new Error('snapshot Expedit non contiene la modifica 2023 attesa')

 const c699=await getCanon(699), c700=await getCanon(700)
 const v699old:any=await getVersion('cic-1983-can-699-it-1983')
 const v699bad:any=await getVersion('cic-1983-can-699-it-2026')
 const v700old:any=await getVersion('cic-1983-can-700-it-1983')
 const v700la2023:any=await getVersion('cic-1983-can-700-la-2023')
 if(!v699old||!v699bad||!v700old||!v700la2023)throw new Error('versioni production 699–700 attese non tutte presenti')

 const old699=normalize(ptText(v699old.fullText));const post699=replaceParagraph(old699,2,CAN699_P2_2022)
 const old700=normalize(ptText(v700old.fullText));const la700current=normalize(ptText(v700la2023.fullText))
 if(!old699.includes('Vescovo diocesano'))throw new Error('Can. 699 1983 non riconosciuto')
 if(!post699.includes('Superiore maggiore con il consenso del suo consiglio'))throw new Error('Can. 699 2022 non ricostruito')
 if(!old700.includes('non ha vigore se non fu confermato dalla Santa Sede'))throw new Error('Can. 700 1983 non riconosciuto')
 if(!la700current.includes('triginta dies')||!la700current.includes('can. 1734'))throw new Error('Can. 700 LA 2023 non riconosciuto')

 const plan={
  schemaVersion:1,
  scope:'competentias-history-699-700',
  effectiveFrom:COMPETENTIAS_FROM,
  notes:[
   'Can. 699: il Rescriptum 2026 è una facoltà speciale collegata al §2 e non genera una nuova versione testuale del canone.',
   'Can. 700: Expedit ut iura (2023) pubblica la nuova formulazione autentica in latino; non viene fabbricata una versione italiana corrente non attestata come testo normativo ufficiale.'
  ],
  canons:[
   {
    canon:699,canonRef:c699._id,
    actions:[
     {action:'patch-existing',versionRef:v699old._id,versionId:v699old.versionId,status:'historical',validFrom:'1983-11-27',validUntil:PRE_COMPETENTIAS_UNTIL,text:old699,segments:compileParagraphs(699,old699)},
     {action:'create',versionId:'cic-1983-can-699-it-2022',versionDocumentId:'version-cic-1983-can-699-it-2022',versionLabel:'Versione vigente da Competentias quasdam decernere',status:'current',language:'it',validFrom:COMPETENTIAS_FROM,validUntil:null,text:post699,segments:compileParagraphs(699,post699),sourceUrl:cicSource.sourceUrl},
     {action:'retire-incorrect-version',versionRef:v699bad._id,versionId:v699bad.versionId,reason:'Il Rescriptum 2026 non sostituisce il testo del can. 699 §2; introduce una facoltà speciale.'}
    ],
    relationsLater:[{source:'rescriptum-699-2026',relationType:'derogates',target:'can-699-par-2',effectiveFrom:'2026-03-25'}]
   },
   {
    canon:700,canonRef:c700._id,
    actions:[
     {action:'patch-existing',versionRef:v700old._id,versionId:v700old.versionId,status:'historical',validFrom:'1983-11-27',validUntil:PRE_COMPETENTIAS_UNTIL,text:old700,segments:[]},
     {action:'create',versionId:'cic-1983-can-700-it-2022',versionDocumentId:'version-cic-1983-can-700-it-2022',versionLabel:'Versione da Competentias quasdam decernere a Expedit ut iura',status:'historical',language:'it',validFrom:COMPETENTIAS_FROM,validUntil:PRE_EXPEDIT_UNTIL,text:CAN700_2022,segments:[],sourceUrl:cicSource.sourceUrl},
     {action:'keep-existing-current',versionRef:v700la2023._id,versionId:v700la2023.versionId,status:'current',language:'la',validFrom:EXPEDIT_FROM,validUntil:null,text:la700current,segments:[],sourceUrl:expeditSource.sourceUrl}
    ]
   }
  ]
 }
 await writeFile(OUTPUT,JSON.stringify(plan,null,2)+'\n','utf8')
 console.log('✔ Can. 699: 1983 → 2022 corrente; falsa versione testuale 2026 marcata per rimozione/ritiro')
 console.log('✔ Can. 700: 1983 → IT 2022 → LA 2023 corrente')
 console.log('✔ Rescriptum 2026 separato dalla storia testuale del Can. 699')
 console.log(`canonical=${OUTPUT}`)
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exit(1)})
