import {getCliClient} from 'sanity/cli'
import {createHash} from 'node:crypto'
import {readFileSync, existsSync, writeFileSync} from 'node:fs'
import {resolve} from 'node:path'

const client=getCliClient({apiVersion:'2026-03-25'})
const HTML=resolve('scripts/fontes-canonical/data/pascite-gregem-dei/act.official.html')
const HASH=resolve('scripts/fontes-canonical/data/pascite-gregem-dei/act.official.sha256')
const ID='source-pascite-gregem-dei-2021'
function decode(s:string){return s.replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCharCode(parseInt(n,16)))}
function extract(html:string){const c=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ');return decode(c.replace(/<br\s*\/?>/gi,'\n').replace(/<\/p\s*>/gi,'\n\n').replace(/<\/div\s*>/gi,'\n').replace(/<\/h[1-6]\s*>/gi,'\n\n').replace(/<[^>]+>/g,' ')).replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim()}
async function main(){
 console.log('PASCITE GREGEM DEI — HASH + BACKFILL TESTO UFFICIALE')
 if(!existsSync(HTML)) throw new Error(`Snapshot ufficiale non trovato: ${HTML}`)
 const raw=readFileSync(HTML); const sha=createHash('sha256').update(raw).digest('hex'); writeFileSync(HASH,`${sha}  act.official.html\n`)
 const text=extract(raw.toString('utf8')); if(text.length<8000) throw new Error(`Testo estratto troppo breve: ${text.length} caratteri`)
 const low=text.toLowerCase(); for(const m of ['pascite gregem dei','libro vi','codice di diritto canonico']) if(!low.includes(m)) throw new Error(`Marker atteso assente: ${m}`)
 const doc=await client.fetch(`*[_id==$id][0]{_id,title}`,{id:ID}); if(!doc) throw new Error(`sourceDocument non trovato: ${ID}`)
 await client.patch(ID).set({sourceText:text}).commit()
 const r=await client.fetch(`*[_id==$id][0]{sourceText}`,{id:ID}); if(!r?.sourceText||r.sourceText.length<8000) throw new Error('Read-back fallito')
 console.log(`✔ SHA-256: ${sha}`); console.log(`✔ sourceText importato: ${r.sourceText.length} caratteri`); console.log(`✔ ${ID}`); console.log('✔ BACKFILL COMPLETATO')
}
main().catch(e=>{console.error(`✘ ${e instanceof Error?e.message:String(e)}`);process.exit(1)})
