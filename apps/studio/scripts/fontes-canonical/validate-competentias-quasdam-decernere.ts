import {createHash} from 'node:crypto'
import {readFile} from 'node:fs/promises'
import {join,basename} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere')
const DOCUMENT_ID='francis-2022-competentias-quasdam-decernere'
const EFFECTIVE='2022-02-15'

function fail(errors:string[],message:string){errors.push(message);console.log(`✖ ${message}`)}

async function main(){
  const errors:string[]=[]
  const manifest=JSON.parse(await readFile(join(ROOT,'manifest.json'),'utf8'))
  const data=JSON.parse(await readFile(join(ROOT,'canonical.json'),'utf8'))

  console.log('\nVALIDAZIONE FORTE — COMPETENTIAS QUASDAM DECERNERE')

  if(manifest.documentId!==DOCUMENT_ID)fail(errors,'manifest documentId inatteso')
  if(!Array.isArray(manifest.sources)||manifest.sources.length!==1)fail(errors,`manifest: attesa 1 fonte, trovate ${manifest.sources?.length??0}`)

  for(const source of manifest.sources??[]){
    const path=join(process.cwd(),source.path)
    const bytes=await readFile(path)
    const hash=createHash('sha256').update(bytes).digest('hex')
    if(!/^[a-f0-9]{64}$/i.test(source.sha256??''))fail(errors,`${source.key}: SHA-256 non valido`)
    if(hash!==source.sha256)fail(errors,`${source.key}: SHA-256 non coincide`)
    else console.log(`✔ ${source.key}: ${basename(path)} — SHA-256 verificato`)
  }

  if(data.documentId!==DOCUMENT_ID)fail(errors,`documentId=${data.documentId}`)
  if(data.title!=='Competentias quasdam decernere')fail(errors,`title=${data.title}`)
  if(data.documentType!=='motuProprio')fail(errors,`documentType=${data.documentType}`)
  if(data.issuer!=='Franciscus PP.')fail(errors,`issuer=${data.issuer}`)
  if(data.issuedAt!=='2022-02-11')fail(errors,`issuedAt=${data.issuedAt}`)
  if(data.effectiveFrom!==EFFECTIVE)fail(errors,`effectiveFrom=${data.effectiveFrom}, atteso ${EFFECTIVE}`)
  if(data.legalForce!=='normative'||data.status!=='inForce'||data.territorialScope!=='universal')fail(errors,'forza/stato/ambito non coerenti')
  if(data.language!=='it')fail(errors,`language=${data.language}`)
  if(!/^https:\/\/(?:[a-z0-9-]+\.)*vatican\.va\//i.test(data.officialUrl??''))fail(errors,'officialUrl non appartenente a un dominio ufficiale vatican.va')
  if(data.juridicalVerification?.status!=='verified')fail(errors,'verifica giuridica non marcata verified')

  const expected=[
    ['1',237,'§2','replaces'],
    ['2',242,'§1','replaces'],
    ['3',265,null,'replaces'],
    ['4',604,'§3','integrates'],
    ['5',686,'§1','replaces'],
    ['6',688,'§2','replaces'],
    ['7',699,'§2','replaces'],
    ['7',700,null,'replaces'],
    ['8',775,'§2','replaces'],
    ['9',1308,null,'replaces'],
    ['10',1310,null,'replaces'],
  ] as const

  if(!Array.isArray(data.effects)||data.effects.length!==expected.length){
    fail(errors,`effetti=${data.effects?.length??0}, attesi ${expected.length}`)
  }else{
    for(let i=0;i<expected.length;i++){
      const [article,canon,locator,effect]=expected[i]
      const actual=data.effects[i]
      if(actual?.article!==article||actual?.canon!==canon||actual?.locator!==locator||actual?.effect!==effect){
        fail(errors,`effetto ${i+1} inatteso: atteso art. ${article}, Can. ${canon}${locator?` ${locator}`:''}, ${effect}`)
      }
    }
  }

  if(data.snapshot?.key!=='act')fail(errors,'snapshot canonico non punta alla fonte act')
  if(data.snapshot?.sha256!==manifest.sources?.[0]?.sha256)fail(errors,'snapshot SHA-256 diverso dal manifest')
  if(data.snapshot?.sourceUrl!==manifest.sources?.[0]?.sourceUrl)fail(errors,'snapshot sourceUrl diverso dal manifest')
  if(data.snapshot?.path!==manifest.sources?.[0]?.path)fail(errors,'snapshot path diverso dal manifest')

  console.log(`\nDocumento: ${data.title}`)
  console.log(`effectiveFrom: ${data.effectiveFrom}`)
  console.log(`Effetti: ${data.effects?.length??0}`)
  console.log(`Errori: ${errors.length}`)
  if(errors.length){
    console.log('✖ COMPETENTIAS QUASDAM DECERNERE NON VALIDO')
    process.exitCode=1
  }else{
    console.log('✔ COMPETENTIAS QUASDAM DECERNERE VALID — 11 effetti — 0 errori')
  }
}

main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exit(1)})
