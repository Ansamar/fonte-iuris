import {getCliClient} from 'sanity/cli'
import {readFileSync, existsSync} from 'node:fs'
import {resolve} from 'node:path'

const client=getCliClient({apiVersion:'2026-03-25'})
const TXT=resolve('scripts/fontes-canonical/data/mitis-iudex/history/cic-1983-aas.pdftotext.txt')
const ID='a45cf4b1-e16b-49db-857f-0b19c1f69663'

async function main(){
  console.log('CIC 1983 — BACKFILL TESTO FONTE UFFICIALE')
  if(!existsSync(TXT)) throw new Error(`Testo ufficiale già estratto non trovato: ${TXT}`)
  const text=readFileSync(TXT,'utf8').replace(/\r/g,'').trim()
  if(text.length<200000) throw new Error(`Testo CIC troppo breve: ${text.length} caratteri`)
  const low=text.toLowerCase()
  if(!low.includes('codex iuris canonici')) throw new Error('Marker "Codex Iuris Canonici" assente')
  if(!/can\.\s*1\b/i.test(text)) throw new Error('Can. 1 non riconosciuto')
  if(!/can\.\s*1752\b/i.test(text)) throw new Error('Can. 1752 non riconosciuto')
  const doc=await client.fetch(`*[_id==$id][0]{_id,title,documentId}`,{id:ID})
  if(!doc) throw new Error(`sourceDocument CIC non trovato: ${ID}`)
  await client.patch(ID).set({sourceText:text}).commit()
  const r=await client.fetch(`*[_id==$id][0]{sourceText}`,{id:ID})
  if(!r?.sourceText||r.sourceText.length<200000) throw new Error('Read-back fallito')
  console.log(`✔ sourceText importato: ${r.sourceText.length} caratteri`)
  console.log(`✔ ${ID}`)
  console.log('✔ BACKFILL COMPLETATO')
}
main().catch(e=>{console.error(`✘ ${e instanceof Error?e.message:String(e)}`);process.exit(1)})
