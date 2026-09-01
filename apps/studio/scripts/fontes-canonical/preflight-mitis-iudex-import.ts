import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/mitis-iudex/history')
async function main(){
 console.log('\nMITIS IUDEX — PREFLIGHT IMPORT')
 const d=JSON.parse(await readFile(join(ROOT,'mitis-iudex-canonical-history.json'),'utf8'))
 const errors:string[]=[]
 if(d.canons?.length!==21)errors.push(`canoni: ${d.canons?.length??0}/21`)
 for(const row of d.canons??[]){
  const n=row.canonNumber,v=row.versions??[]
  if(v.length!==2)errors.push(`Can. ${n}: ${v.length} versioni`)
  const old=v.find((x:any)=>x.validUntil==='2015-12-07')
  const cur=v.find((x:any)=>x.validFrom==='2015-12-08'&&x.validUntil==null)
  if(!old||old.language!=='la'||old.status!=='historical'||!old.fullText)errors.push(`Can. ${n}: storico 1983 non conforme`)
  if(!cur||cur.language!=='it'||cur.status!=='current'||!cur.fullText)errors.push(`Can. ${n}: vigente 2015 non conforme`)
  if(old?.versionId===cur?.versionId)errors.push(`Can. ${n}: versionId duplicato`)
 }
 const ids=(d.canons??[]).flatMap((r:any)=>r.versions.map((v:any)=>v.versionId))
 if(new Set(ids).size!==ids.length)errors.push('versionId non univoci')
 if(errors.length){console.error(errors.map(x=>`✖ ${x}`).join('\n'));process.exit(1)}
 console.log('✔ 21/21 canoni')
 console.log('✔ 42/42 versioni')
 console.log('✔ intervalli temporali contigui e non sovrapposti')
 console.log('✔ provenienza linguistica coerente: LA 1983 / IT 2015')
 console.log('✔ versionId univoci')
 console.log('✔ PREFLIGHT SUPERATO — canonical history pronta per dry-run Sanity')
}
main().catch(e=>{console.error('\n✖ PREFLIGHT FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
