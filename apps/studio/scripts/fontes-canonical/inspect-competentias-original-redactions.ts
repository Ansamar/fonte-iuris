import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/competentias-quasdam-decernere/history-missing')
const FILES=['cic-232-264.official.html','cic-265-272.official.html','cic-1299-1310.official.html']
const TARGETS=[237,242,265,1308,1310]

function normalizeHtml(value:string){return value
 .replace(/&nbsp;|&#160;|&#xA0;/gi,' ')
 .replace(/&sect;|&#167;|&#xA7;/gi,'§')
 .replace(/&rsquo;|&#8217;|&#x2019;/gi,"'")
 .replace(/[’‘]/g,"'")
 .replace(/&agrave;|&#224;|&#xE0;/gi,'à').replace(/&egrave;|&#232;|&#xE8;/gi,'è')
 .replace(/&igrave;|&#236;|&#xEC;/gi,'ì').replace(/&ograve;|&#242;|&#xF2;/gi,'ò').replace(/&ugrave;|&#249;|&#xF9;/gi,'ù')
 .replace(/&eacute;|&#233;|&#xE9;/gi,'é')
 .replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}

async function main(){
 console.log('\nISPEZIONE REDAZIONI ORIGINARIE — COMPETENTIAS — SOLA LETTURA')
 for(const file of FILES){
  const txt=normalizeHtml(await readFile(join(ROOT,file),'utf8'))
  const origin=txt.toLocaleLowerCase('it').indexOf('redazione originaria')
  if(origin<0){console.log(`\n✖ ${file}: Redazione originaria non trovata`);continue}
  const tail=txt.slice(origin)
  console.log(`\n### ${file}`)
  for(const canon of TARGETS){
   const re=new RegExp(`Can\\.\\s*${canon}\\b`,'i')
   const m=re.exec(tail)
   if(!m)continue
   const start=m.index
   const after=tail.slice(start+m[0].length)
   const next=/Can\.\s*\d+\b/i.exec(after)
   const end=next?start+m[0].length+next.index:tail.length
   console.log(`\n===== Can. ${canon} — REDAZIONE ORIGINARIA =====`)
   console.log(tail.slice(start,end).trim())
  }
 }
 console.log('\nISPEZIONE COMPLETATA — nessuna scrittura eseguita')
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exit(1)})
