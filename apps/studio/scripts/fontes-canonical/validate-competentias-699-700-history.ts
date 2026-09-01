import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere/history-699-700')
const FILE=join(ROOT,'history-canonical.json')

function fail(msg:string,errors:string[]){errors.push(msg);console.log(`✖ ${msg}`)}
function ok(msg:string){console.log(`✔ ${msg}`)}

async function main(){
  console.log('\nVALIDAZIONE FORTE HISTORY CANONICAL — COMPETENTIAS CAN. 699–700')
  const errors:string[]=[]
  const data=JSON.parse(await readFile(FILE,'utf8'))

  if(data.scope!=='competentias-history-699-700') fail(`scope inatteso: ${data.scope??'∅'}`,errors); else ok('scope corretto')
  if(data.effectiveFrom!=='2022-02-15') fail(`effectiveFrom inatteso: ${data.effectiveFrom??'∅'}`,errors); else ok('effectiveFrom=2022-02-15')
  if(!Array.isArray(data.canons)||data.canons.length!==2) fail(`canons=${data.canons?.length??0}, attesi 2`,errors)

  const c699=data.canons?.find((c:any)=>c.canon===699)
  const c700=data.canons?.find((c:any)=>c.canon===700)
  if(!c699) fail('Can. 699 assente dal piano',errors)
  if(!c700) fail('Can. 700 assente dal piano',errors)

  if(c699){
    const actions=c699.actions||[]
    if(actions.length!==3) fail(`Can. 699 actions=${actions.length}, attese 3`,errors)
    const old=actions.find((a:any)=>a.action==='patch-existing'&&a.versionId==='cic-1983-can-699-it-1983')
    const current=actions.find((a:any)=>a.action==='create'&&a.versionId==='cic-1983-can-699-it-2022')
    const bad=actions.find((a:any)=>a.action==='retire-incorrect-version'&&a.versionId==='cic-1983-can-699-it-2026')
    if(!old||old.validFrom!=='1983-11-27'||old.validUntil!=='2022-02-14'||old.status!=='historical') fail('Can. 699 versione 1983/intervallo non conforme',errors)
    else ok('Can. 699: 1983-11-27 → 2022-02-14')
    if(!current||current.validFrom!=='2022-02-15'||current.validUntil!==null||current.status!=='current'||current.language!=='it') fail('Can. 699 versione 2022 corrente non conforme',errors)
    else ok('Can. 699: corrente IT dal 2022-02-15')
    if(!bad) fail('Can. 699: versione 2026 errata non marcata per ritiro',errors); else ok('Can. 699: versione testuale 2026 marcata per ritiro')
    if(!Array.isArray(old?.segments)||old.segments.length!==2) fail('Can. 699 storico: segmenti attesi=2',errors)
    if(!Array.isArray(current?.segments)||current.segments.length!==2) fail('Can. 699 corrente 2022: segmenti attesi=2',errors)
    const rel=c699.relationsLater?.find((r:any)=>r.source==='rescriptum-699-2026'&&r.relationType==='derogates'&&r.target==='can-699-par-2'&&r.effectiveFrom==='2026-03-25')
    if(!rel) fail('Can. 699: relazione successiva Rescriptum 2026 non conforme',errors); else ok('Rescriptum 2026 separato dalla storia testuale')
  }

  if(c700){
    const actions=c700.actions||[]
    if(actions.length!==3) fail(`Can. 700 actions=${actions.length}, attese 3`,errors)
    const old=actions.find((a:any)=>a.action==='patch-existing'&&a.versionId==='cic-1983-can-700-it-1983')
    const mid=actions.find((a:any)=>a.action==='create'&&a.versionId==='cic-1983-can-700-it-2022')
    const current=actions.find((a:any)=>a.action==='keep-existing-current'&&a.versionId==='cic-1983-can-700-la-2023')
    if(!old||old.validFrom!=='1983-11-27'||old.validUntil!=='2022-02-14'||old.status!=='historical') fail('Can. 700 versione 1983/intervallo non conforme',errors)
    else ok('Can. 700: IT 1983-11-27 → 2022-02-14')
    if(!mid||mid.validFrom!=='2022-02-15'||mid.validUntil!=='2023-05-06'||mid.status!=='historical'||mid.language!=='it'||!String(mid.text||'').includes('dieci giorni')) fail('Can. 700 versione IT 2022 non conforme',errors)
    else ok('Can. 700: IT 2022-02-15 → 2023-05-06')
    if(!current||current.validFrom!=='2023-05-07'||current.validUntil!==null||current.status!=='current'||current.language!=='la'||!String(current.text||'').includes('triginta dies')) fail('Can. 700 versione LA 2023 corrente non conforme',errors)
    else ok('Can. 700: LA corrente dal 2023-05-07')
  }

  console.log(`\nErrori: ${errors.length}`)
  if(errors.length){console.log('✖ HISTORY CANONICAL 699–700 NON VALIDA');process.exitCode=1}
  else console.log('✔ HISTORY CANONICAL 699–700 VALIDA — 0 errori')
}

main().catch(e=>{console.error('\n✖ VALIDAZIONE HISTORY 699–700 FALLITA');console.error(e instanceof Error?e.message:e);process.exit(1)})
