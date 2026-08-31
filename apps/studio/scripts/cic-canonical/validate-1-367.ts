import {readFile} from 'node:fs/promises'
import {resolve} from 'node:path'

type Segment={id:string;type:string;label:string;order:number;parentId?:string;startOffset:number;endOffset:number}
type Canon={number:number;text:string;segments:Segment[]}
type Payload={expectedCanons:number;range:{from:number;to:number};canons:Canon[]}

async function main(){
 const file=resolve('scripts/cic-canonical/build/canoni-1-367.json')
 const data=JSON.parse(await readFile(file,'utf8')) as Payload
 const errors:string[]=[]
 const numbers=data.canons.map(c=>c.number)
 const unique=new Set(numbers)
 if(data.canons.length!==367)errors.push(`Numero canoni: ${data.canons.length}/367`)
 if(unique.size!==367)errors.push(`Canoni duplicati: ${367-unique.size}`)
 for(let n=1;n<=367;n++)if(!unique.has(n))errors.push(`Can. ${n} mancante`)
 for(const canon of data.canons){
  if(canon.number<1||canon.number>367)errors.push(`Can. ${canon.number}: fuori intervallo`)
  if(!canon.text.trim())errors.push(`Can. ${canon.number}: testo vuoto`)
  const ids=new Set<string>()
  const segmentIds=new Set(canon.segments.map(s=>s.id))
  for(const s of canon.segments){
   if(ids.has(s.id))errors.push(`Can. ${canon.number}: segmentId duplicato ${s.id}`)
   ids.add(s.id)
   if(s.startOffset<0||s.endOffset<=s.startOffset||s.endOffset>canon.text.length)errors.push(`Can. ${canon.number}: offset non valido ${s.id}`)
   if(s.parentId&&!segmentIds.has(s.parentId))errors.push(`Can. ${canon.number}: parent mancante ${s.parentId}`)
  }
 }
 const checks=[1,22,96,111,204,208,330,367]
 for(const n of checks){const c=data.canons.find(x=>x.number===n);if(!c||!c.text.trim())errors.push(`Regressione Can. ${n}`)}
 const segments=data.canons.reduce((sum,c)=>sum+c.segments.length,0)
 console.log(`Canoni: ${data.canons.length}/367`)
 console.log(`Segmenti: ${segments}`)
 if(errors.length){for(const e of errors)console.error(`✖ ${e}`);throw new Error(`${errors.length} errori`)}
 console.log('✔ CANONICAL 1–367 VALID — 0 errori')
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exitCode=1})
