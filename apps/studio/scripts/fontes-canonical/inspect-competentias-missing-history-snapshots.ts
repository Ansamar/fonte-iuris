import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere/history-missing')
const FILES=['cic-232-264.official.html','cic-265-272.official.html','cic-1299-1310.official.html']
const CANONS=[237,242,265,1308,1310]

function text(html:string){return html
 .replace(/&nbsp;|&#160;|&#xA0;/gi,' ')
 .replace(/&sect;|&#167;|&#xA7;/gi,'§')
 .replace(/&rsquo;|&#8217;|&#x2019;/gi,"'")
 .replace(/[’‘]/g,"'")
 .replace(/&agrave;|&#224;|&#xE0;/gi,'à').replace(/&egrave;|&#232;|&#xE8;/gi,'è')
 .replace(/&igrave;|&#236;|&#xEC;/gi,'ì').replace(/&ograve;|&#242;|&#xF2;/gi,'ò').replace(/&ugrave;|&#249;|&#xF9;/gi,'ù')
 .replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}

async function main(){
 console.log('\nISPEZIONE SNAPSHOT STORICI COMPETENTIAS — SOLA LETTURA')
 const docs=[] as {file:string;text:string}[]
 for(const file of FILES)docs.push({file,text:text(await readFile(join(ROOT,file),'utf8'))})
 for(const canon of CANONS){
  const needle=`Can. ${canon}`
  const doc=docs.find(d=>d.text.includes(needle))
  if(!doc){console.log(`\n✖ ${needle}: non trovato`);continue}
  const start=doc.text.indexOf(needle)
  const next=doc.text.indexOf(`Can. ${canon+1}`,start+needle.length)
  const chunk=doc.text.slice(start,next>start?next:Math.min(doc.text.length,start+5000))
  console.log(`\n===== ${needle} | ${doc.file} =====`)
  console.log(chunk)
 }
 console.log('\nISPEZIONE COMPLETATA — nessuna scrittura eseguita')
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exit(1)})
