import {createHash} from 'node:crypto'
import {mkdir,writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/mitis-iudex/history')
const URL='https://www.vatican.va/archive/aas/documents/AAS-75-1983-II-ocr.pdf'

async function main(){
 await mkdir(ROOT,{recursive:true})
 console.log('\nACQUISIZIONE MITIS IUDEX HISTORY — TESTIMONE UFFICIALE CIC 1983')
 const r=await fetch(URL,{headers:{'user-agent':'Fonte-Iuris/1.0 canonical-source-acquisition'}})
 if(!r.ok)throw new Error(`AAS CIC 1983: HTTP ${r.status}`)
 const bytes=Buffer.from(await r.arrayBuffer())
 if(bytes.length<1_000_000)throw new Error(`AAS CIC 1983: PDF troppo piccolo (${bytes.length} bytes)`)
 if(bytes.subarray(0,5).toString('ascii')!=='%PDF-')throw new Error('AAS CIC 1983: risposta non PDF')
 const sha256=createHash('sha256').update(bytes).digest('hex')
 const filename='cic-1983-aas-75-II.official.pdf'
 await writeFile(join(ROOT,filename),bytes)
 const record={key:'cic-1983-aas',sourceUrl:URL,capturedAt:new Date().toISOString(),sha256,path:`scripts/fontes-canonical/data/mitis-iudex/history/${filename}`,authority:'Acta Apostolicae Sedis 75 (1983), Pars II',purpose:'Authentic promulgated 1983 Latin CIC witness for reconstruction of cann. 1671–1691 before Mitis Iudex.'}
 await writeFile(join(ROOT,'cic-1983-source.json'),JSON.stringify(record,null,2)+'\n','utf8')
 console.log(`✔ cic-1983-aas: ${sha256}`)
 console.log(`✔ ${bytes.length} bytes — testimone ufficiale CIC 1983 congelato`)
}
main().catch(e=>{console.error('\n✖ ACQUISIZIONE CIC 1983 FALLITA');console.error(e instanceof Error?e.message:e);process.exit(1)})
