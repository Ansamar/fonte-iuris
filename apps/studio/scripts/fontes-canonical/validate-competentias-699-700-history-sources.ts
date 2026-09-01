import {createHash} from 'node:crypto'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere/history-699-700')

function sha256(s:string){return createHash('sha256').update(s).digest('hex')}
function text(s:string){return s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&sect;|&#167;/gi,'§').replace(/&rsquo;|&#8217;/gi,'’').replace(/\s+/g,' ').trim()}

async function main(){
  console.log('\nVALIDAZIONE FONTI STORICHE COMPETENTIAS — CAN. 699–700')
  const manifest=JSON.parse(await readFile(join(ROOT,'manifest.json'),'utf8'))
  let errors=0
  const docs:any={}
  for(const s of manifest.sources??[]){
    const raw=await readFile(join(process.cwd(),s.path),'utf8')
    const got=sha256(raw)
    if(got!==s.sha256){console.log(`✖ ${s.key}: SHA-256 non coincide`);errors++}
    else console.log(`✔ ${s.key}: SHA-256 verificato`)
    docs[s.key]=text(raw)
  }
  const cic=docs['cic-694-704']??''
  const exp=docs['expedit-ut-iura']??''
  const res=docs['rescriptum-699-2026']??''

  const checks:[string,boolean][]=[
    ['CIC: Can. 699 presente',/Can\.\s*699/i.test(cic)],
    ['CIC: §2 vigente post-Competentias presente',/decisione circa la dimissione di un professo compete al Superiore maggiore con il consenso del suo consiglio/i.test(cic)],
    ['CIC: redazione originaria Can. 699 §2 presente',/decisione circa la dimissione compete al Vescovo diocesano/i.test(cic)],
    ['CIC: Can. 700 vigente post-Competentias presente',/Can\.\s*700/i.test(cic)&&/ha vigore nel momento in cui viene notificato/i.test(cic)],
    ['CIC: redazione originaria Can. 700 presente',/decreto di dimissione non ha vigore se non fu confermato dalla Santa Sede/i.test(cic)],
    ['Expedit: modifica dieci→trenta giorni',/dieci giorni/i.test(exp)&&/trenta giorni/i.test(exp)],
    ['Expedit: effectiveFrom 7 maggio 2023',/entrando in vigore il 7 maggio dell[’']anno 2023/i.test(exp)],
    ['Rescriptum 2026: facoltà riferita al can. 699 §2',/can\.\s*699\s*§\s*2/i.test(res)&&/facoltà/i.test(res)],
  ]
  for(const [label,ok] of checks){console.log(`${ok?'✔':'✖'} ${label}`);if(!ok)errors++}
  console.log(`\nErrori: ${errors}`)
  if(errors){console.log('✖ FONTI STORICHE 699–700 NON VALIDE');process.exitCode=1}
  else console.log('✔ FONTI STORICHE 699–700 VALIDE — provenienza ufficiale verificata')
}
main().catch(e=>{console.error(e);process.exit(1)})
