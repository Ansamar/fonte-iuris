import {readFile,writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere')

async function main(){
 const manifest=JSON.parse(await readFile(join(ROOT,'manifest.json'),'utf8'))
 const act=manifest.sources?.find((x:any)=>x.key==='act')
 if(!act)throw new Error('Manifest incompleto: fonte act assente')
 const canonical={
  canonicalDataVersion:'1.0.0',documentId:'francis-2022-competentias-quasdam-decernere',title:'Competentias quasdam decernere',shortTitle:'Competentias quasdam decernere',documentType:'motuProprio',issuer:'Franciscus PP.',issuedAt:'2022-02-11',effectiveFrom:'2022-02-15',territorialScope:'universal',legalForce:'normative',status:'inForce',language:'it',officialUrl:act.sourceUrl,snapshot:act,
  effects:[
   {article:'1',canon:237,locator:'§2',effect:'replaces'},
   {article:'2',canon:242,locator:'§1',effect:'replaces'},
   {article:'3',canon:265,locator:null,effect:'replaces'},
   {article:'4',canon:604,locator:'§3',effect:'integrates'},
   {article:'5',canon:686,locator:'§1',effect:'replaces'},
   {article:'6',canon:688,locator:'§2',effect:'replaces'},
   {article:'7',canon:699,locator:'§2',effect:'replaces'},
   {article:'7',canon:700,locator:null,effect:'replaces'},
   {article:'8',canon:775,locator:'§2',effect:'replaces'},
   {article:'9',canon:1308,locator:null,effect:'replaces'},
   {article:'10',canon:1310,locator:null,effect:'replaces'},
  ],
  juridicalVerification:{status:'verified',note:'L’atto dispone espressamente la promulgazione mediante pubblicazione su L’Osservatore Romano e l’entrata in vigore il 15 febbraio 2022.'}
 }
 await writeFile(join(ROOT,'canonical.json'),JSON.stringify(canonical,null,2)+'\n','utf8')
 console.log(`COMPETENTIAS QUASDAM DECERNERE CANONICAL BUILT — ${canonical.effects.length} effetti`)
 console.log(`effectiveFrom=${canonical.effectiveFrom}`)
 console.log(`canonical=${join(ROOT,'canonical.json')}`)
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exit(1)})
