import {getCliClient} from 'sanity/cli'
import {execFileSync} from 'node:child_process'
import {existsSync, readFileSync} from 'node:fs'
import {resolve} from 'node:path'

const client = getCliClient({apiVersion: '2026-03-25'})
const PDF = resolve('scripts/fontes-canonical/data/cei-decreto-matrimonio-canonico/decreto-generale-matrimonio-canonico.official.pdf')
const TXT = resolve('scripts/fontes-canonical/data/cei-decreto-matrimonio-canonico/decreto-generale-matrimonio-canonico.official.txt')
const SOURCE_ID = 'source-cei-1990-decreto-generale-matrimonio-canonico'

function normalize(s:string){return s.replace(/\r/g,'').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim()}

async function main(){
  console.log('CEI MATRIMONIO — BACKFILL TESTO UFFICIALE')
  if(!existsSync(PDF)) throw new Error(`PDF ufficiale non trovato: ${PDF}`)
  try { execFileSync('pdftotext',['-layout',PDF,TXT],{stdio:'inherit'}) }
  catch { throw new Error('pdftotext non disponibile o estrazione fallita') }
  const text=normalize(readFileSync(TXT,'utf8'))
  if(text.length<10000) throw new Error(`Testo troppo breve: ${text.length} caratteri`)
  const low=text.toLowerCase()
  for(const marker of ['matrimonio','conferenza episcopale italiana','can. 1067']){
    if(!low.includes(marker)) throw new Error(`Marker atteso assente: ${marker}`)
  }
  const doc=await client.fetch(`*[_id==$id][0]{_id,documentId}`,{id:SOURCE_ID})
  if(!doc) throw new Error(`sourceDocument non trovato: ${SOURCE_ID}`)
  await client.patch(SOURCE_ID).set({sourceText:text}).commit()
  const readback=await client.fetch(`*[_id==$id][0]{"chars":length(sourceText),sourceText}`,{id:SOURCE_ID})
  if(!readback?.sourceText || readback.sourceText.length<10000) throw new Error('Read-back fallito')
  console.log(`✔ sourceText importato: ${readback.sourceText.length} caratteri`)
  console.log(`✔ ${SOURCE_ID}`)
  console.log('✔ BACKFILL COMPLETATO')
}

main().catch(err=>{console.error(`✘ ${err instanceof Error?err.message:String(err)}`);process.exit(1)})
