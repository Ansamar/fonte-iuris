import {createHash} from 'node:crypto'
import {readFile} from 'node:fs/promises'
import {join,basename} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/spiritus-domini')
const EFFECTIVE='2021-01-11'

function fail(errors:string[],message:string){errors.push(message);console.log(`✖ ${message}`)}

async function main(){
  const errors:string[]=[]
  const manifest=JSON.parse(await readFile(join(ROOT,'manifest.json'),'utf8'))
  const data=JSON.parse(await readFile(join(ROOT,'canonical.json'),'utf8'))
  console.log('\nVALIDAZIONE FORTE — SPIRITUS DOMINI')
  if(manifest.documentId!=='francis-2021-spiritus-domini')fail(errors,'manifest documentId inatteso')
  if(!Array.isArray(manifest.sources)||manifest.sources.length!==3)fail(errors,'manifest: attese 3 fonti')
  for(const source of manifest.sources??[]){
    const path=join(process.cwd(),source.path)
    const bytes=await readFile(path)
    const hash=createHash('sha256').update(bytes).digest('hex')
    if(hash!==source.sha256)fail(errors,`${source.key}: SHA-256 non coincide`)
    else console.log(`✔ ${source.key}: ${basename(path)} — SHA-256 verificato`)
  }
  if(data.documentId!=='francis-2021-spiritus-domini')fail(errors,`documentId=${data.documentId}`)
  if(data.documentType!=='motuProprio')fail(errors,`documentType=${data.documentType}`)
  if(data.issuer!=='Franciscus PP.')fail(errors,`issuer=${data.issuer}`)
  if(data.issuedAt!=='2021-01-10')fail(errors,`issuedAt=${data.issuedAt}`)
  if(data.effectiveFrom!==EFFECTIVE)fail(errors,`effectiveFrom=${data.effectiveFrom}, atteso ${EFFECTIVE}`)
  if(data.legalForce!=='normative'||data.status!=='inForce'||data.territorialScope!=='universal')fail(errors,'forza/stato/ambito non coerenti')
  if(!/^https:\/\/(?:[a-z0-9-]+\.)*vatican\.va\//i.test(data.officialUrl??''))fail(errors,'officialUrl non appartenente a un dominio ufficiale vatican.va')
  if(data.juridicalVerification?.status!=='verified')fail(errors,'verifica giuridica non marcata verified')
  if(!Array.isArray(data.effects)||data.effects.length!==1)fail(errors,`effetti=${data.effects?.length??0}, atteso 1`)
  const effect=data.effects?.[0]
  if(effect?.canon!==230||effect?.locator!=='§1'||effect?.effect!=='replaces')fail(errors,'effetto canonico inatteso: atteso Can. 230 §1 replaces')
  console.log(`\nDocumento: ${data.title}`)
  console.log(`effectiveFrom: ${data.effectiveFrom}`)
  console.log(`Effetti: ${data.effects?.length??0}`)
  console.log(`Errori: ${errors.length}`)
  if(errors.length){console.log('✖ SPIRITUS DOMINI NON VALIDO');process.exitCode=1}else console.log('✔ SPIRITUS DOMINI VALID — 1 effetto — 0 errori')
}

main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exit(1)})
