import {readFile,writeFile} from 'node:fs/promises'
import {join} from 'node:path'

const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/mitis-iudex/history')
const TXT=join(ROOT,'cic-1983-aas.pdftotext.txt')
const OUT=join(ROOT,'cic-1983-canons-1671-1691.json')

function clean(s:string){return s.replace(/\f/g,'\n').replace(/^\s*PARS III.*$/gm,'').replace(/^\s*\d+\s*$/gm,'').replace(/-\n\s*/g,'').replace(/\n\s+/g,' ').replace(/\s+/g,' ').trim()}

async function main(){
 console.log('\nMITIS IUDEX — ESTRAZIONE CANONI 1983')
 const raw=await readFile(TXT,'utf8')
 const start=raw.search(/Can\.\s*1671\s*-/)
 const end=raw.search(/Can\.\s*1692\s*-/)
 if(start<0||end<0||end<=start)throw new Error(`limiti non trovati: 1671=${start}, 1692=${end}`)
 const block=raw.slice(start,end)
 const re=/Can\.\s*(16(?:7[1-9]|8\d|9[01]))\s*-\s*([\s\S]*?)(?=\n\s*Can\.\s*16(?:7[1-9]|8\d|9[0-2])\s*-|$)/g
 const canons=[...block.matchAll(re)].map(m=>({canonNumber:Number(m[1]),language:'la',validFrom:'1983-11-27',validUntil:'2015-12-07',status:'historical',sourceKey:'cic-1983-aas',fullText:clean(m[2])}))
 const nums=canons.map(x=>x.canonNumber)
 const expected=Array.from({length:21},(_,i)=>1671+i)
 const missing=expected.filter(n=>!nums.includes(n))
 if(canons.length!==21||missing.length)throw new Error(`estrazione incompleta: ${canons.length}/21; mancanti ${missing.join(', ')||'nessuno'}`)
 for(const c of canons)if(c.fullText.length<20)throw new Error(`Can. ${c.canonNumber}: testo sospettosamente corto`)
 await writeFile(OUT,JSON.stringify({source:{key:'cic-1983-aas',authority:'Acta Apostolicae Sedis 75 (1983), Pars II',authenticLanguage:'la'},canons},null,2)+'\n','utf8')
 console.log(`✔ ${canons.length}/21 redazioni autentiche latine estratte`)
 console.log(`✔ Can. 1671: ${canons[0].fullText.length} caratteri`)
 console.log(`✔ Can. 1691: ${canons.at(-1)!.fullText.length} caratteri`)
 console.log(`✔ output: ${OUT}`)
}
main().catch(e=>{console.error('\n✖ ESTRAZIONE FALLITA');console.error(e instanceof Error?e.message:e);process.exit(1)})
