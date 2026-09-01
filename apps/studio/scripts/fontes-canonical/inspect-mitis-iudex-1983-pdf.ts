import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {execFileSync} from 'node:child_process'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/mitis-iudex/history')
const PDF=join(ROOT,'cic-1983-aas.official.pdf')
const TXT=join(ROOT,'cic-1983-aas.pdftotext.txt')

async function main(){
 console.log('\nMITIS IUDEX — ISPEZIONE TESTIMONE CIC 1983')
 try{execFileSync('pdftotext',['-layout',PDF,TXT],{stdio:'inherit'})}catch{throw new Error('pdftotext non disponibile: installare poppler oppure usare un estrattore PDF equivalente')}
 const raw=await readFile(TXT,'utf8')
 const hits=[...raw.matchAll(/(?:Can\.?|CAN\.?|can\.?)\s*1671\b/g)]
 console.log(`✔ testo estratto: ${raw.length} caratteri`)
 console.log(`✔ occorrenze Can. 1671: ${hits.length}`)
 if(!hits.length)throw new Error('Can. 1671 non trovato nel testo estratto')
 for(const [i,m] of hits.entries()){
  const start=Math.max(0,(m.index??0)-300),end=Math.min(raw.length,(m.index??0)+1800)
  console.log(`\n--- OCCORRENZA ${i+1} ---\n${raw.slice(start,end).replace(/\n{3,}/g,'\n\n')}`)
 }
 console.log('\n✔ testimone 1983 leggibile: possiamo estrarre 1671–1691 senza OCR')
}
main().catch(e=>{console.error('\n✖ ISPEZIONE FALLITA');console.error(e instanceof Error?e.message:e);process.exit(1)})
