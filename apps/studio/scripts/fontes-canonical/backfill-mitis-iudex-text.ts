import {getCliClient} from 'sanity/cli'
import {readFileSync, existsSync} from 'node:fs'
import {resolve} from 'node:path'

const client = getCliClient({apiVersion: '2026-03-25'})
const HTML = resolve('scripts/fontes-canonical/data/mitis-iudex/history/mitis-iudex.official.html')
const SOURCE_ID = 'source-mitis-iudex-dominus-iesus-2015'

function decode(s:string){
  const named:Record<string,string>={
    nbsp:' ',amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',agrave:'à',aacute:'á',egrave:'è',eacute:'é',igrave:'ì',iacute:'í',ograve:'ò',oacute:'ó',ugrave:'ù',uacute:'ú',Agrave:'À',Aacute:'Á',Egrave:'È',Eacute:'É',Igrave:'Ì',Iacute:'Í',Ograve:'Ò',Oacute:'Ó',Ugrave:'Ù',Uacute:'Ú',laquo:'«',raquo:'»',ndash:'–',mdash:'—',hellip:'…'
  }
  return s.replace(/&([A-Za-z]+);/g,(entity,name)=>named[name]??entity)
    .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCharCode(parseInt(n,16)))
}
function extract(html:string){
  const withoutNoise=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
  const text=decode(withoutNoise.replace(/<br\s*\/?>/gi,'\n').replace(/<\/p\s*>/gi,'\n\n').replace(/<\/div\s*>/gi,'\n').replace(/<\/h[1-6]\s*>/gi,'\n\n').replace(/<[^>]+>/g,' '))
  return text.replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim()
}

async function main(){
  console.log('MITIS IUDEX — BACKFILL TESTO UFFICIALE')
  if(!existsSync(HTML)) throw new Error(`Snapshot ufficiale non trovato: ${HTML}`)
  const text=extract(readFileSync(HTML,'utf8'))
  if(text.length<15000) throw new Error(`Testo estratto troppo breve: ${text.length} caratteri`)
  const low=text.toLowerCase()
  for(const marker of ['mitis iudex dominus iesus','processo canonico','matrimonio','nullità']) if(!low.includes(marker)) throw new Error(`Marker atteso assente: ${marker}`)
  const doc=await client.fetch(`*[_id==$id][0]{_id,documentId}`,{id:SOURCE_ID})
  if(!doc) throw new Error(`sourceDocument non trovato: ${SOURCE_ID}`)
  await client.patch(SOURCE_ID).set({sourceText:text}).commit()
  const readback=await client.fetch(`*[_id==$id][0]{sourceText}`,{id:SOURCE_ID})
  if(!readback?.sourceText || readback.sourceText.length<15000 || !readback.sourceText.toLowerCase().includes('nullità')) throw new Error('Read-back fallito')
  console.log(`✔ sourceText importato: ${readback.sourceText.length} caratteri`)
  console.log('✔ marker nullità verificato nel read-back')
  console.log(`✔ ${SOURCE_ID}`)
  console.log('✔ BACKFILL COMPLETATO')
}
main().catch(err=>{console.error(`✘ ${err instanceof Error?err.message:String(err)}`);process.exit(1)})
