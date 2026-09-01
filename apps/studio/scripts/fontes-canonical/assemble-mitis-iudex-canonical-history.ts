import {readFile,writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/mitis-iudex/history')

async function json(name:string){return JSON.parse(await readFile(join(ROOT,name),'utf8'))}
async function main(){
 console.log('\nMITIS IUDEX — ASSEMBLAGGIO CANONICAL HISTORY')
 const base=await json('canonical-history.json')
 const old=await json('cic-1983-canons-1671-1691.json')
 const oldMap=new Map(old.canons.map((x:any)=>[x.canonNumber,x]))
 const rows=(base.canons??base).map((x:any)=>{
  const n=x.canonNumber
  const h=oldMap.get(n) as any
  if(!h)throw new Error(`Can. ${n}: redazione 1983 mancante`)
  const current=x.reformed??x.current??x.post2015??x
  const text=current.fullText??current.text
  if(!text||typeof text!=='string')throw new Error(`Can. ${n}: redazione 2015 mancante`)
  return {canonNumber:n,versions:[
   {...h,versionId:`cic-1983-can-${n}-la-1983`,versionLabel:'CIC 1983 — redazione originaria'},
   {canonNumber:n,language:current.language??'it',validFrom:'2015-12-08',validUntil:null,status:'current',sourceKey:'mitis-iudex',versionId:`cic-1983-can-${n}-${current.language??'it'}-2015`,versionLabel:'Mitis Iudex — redazione vigente dal 2015-12-08',fullText:text}
  ]}
 })
 if(rows.length!==21)throw new Error(`attesi 21 canoni, trovati ${rows.length}`)
 const versions=rows.flatMap((x:any)=>x.versions)
 if(versions.length!==42)throw new Error(`attese 42 versioni, trovate ${versions.length}`)
 await writeFile(join(ROOT,'mitis-iudex-canonical-history.json'),JSON.stringify({scope:{fromCanon:1671,toCanon:1691,reformEffectiveFrom:'2015-12-08'},canons:rows},null,2)+'\n')
 console.log('✔ 21/21 canoni assemblati')
 console.log('✔ 42 versioni temporali')
 console.log('✔ 1983-11-27 → 2015-12-07: testimone autentico latino AAS')
 console.log('✔ 2015-12-08 → ∞: redazione Mitis Iudex')
 console.log(`✔ output: ${join(ROOT,'mitis-iudex-canonical-history.json')}`)
}
main().catch(e=>{console.error('\n✖ ASSEMBLAGGIO FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
