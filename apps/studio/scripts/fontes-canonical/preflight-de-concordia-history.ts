import {createClient} from '@sanity/client'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

const client=createClient({projectId:'2rq93txn',dataset:'production',apiVersion:'2026-03-25',useCdn:false})
const ROOT=join(process.cwd(),'scripts/fontes-canonical/data/de-concordia-inter-codices')
const SOURCE=join(ROOT,'history-source')
const EFFECTIVE='2016-12-16'
const LAST_OLD_DAY='2016-12-15'
const specs=[
 {canon:111,page:'96-112',mode:'replace-whole',locator:null,needsOriginal:true},
 {canon:112,page:'96-112',mode:'replace-whole',locator:null,needsOriginal:true},
 {canon:535,page:'515-552',mode:'replace',locator:'§2',needsOriginal:true},
 {canon:868,page:'864-871',mode:'replace+remove-added',locator:'§1, 2°; §3',needsOriginal:true},
 {canon:1108,page:'1108-1123',mode:'remove-added',locator:'§3',needsOriginal:false},
 {canon:1109,page:'1108-1123',mode:'replace-whole',locator:null,needsOriginal:true},
 {canon:1111,page:'1108-1123',mode:'replace',locator:'§1',needsOriginal:true},
 {canon:1112,page:'1108-1123',mode:'replace',locator:'§1',needsOriginal:true},
 {canon:1116,page:'1108-1123',mode:'remove-added',locator:'§3',needsOriginal:false},
 {canon:1127,page:'1124-1129',mode:'replace',locator:'§1',needsOriginal:true},
] as const
function ptText(blocks:any[]){return (blocks||[]).map(b=>(b.children||[]).map((c:any)=>c.text||'').join('')).filter(Boolean).join('\n')}
async function main(){console.log('\nPREFLIGHT STORICO DE CONCORDIA — PRODUCTION — SOLA LETTURA');let errors=0;let warnings=0
const canonical=JSON.parse(await readFile(join(ROOT,'canonical.json'),'utf8'));if(canonical.effectiveFrom!==EFFECTIVE){console.log(`✖ effectiveFrom atteso ${EFFECTIVE}, trovato ${canonical.effectiveFrom??'∅'}`);errors++}else console.log(`✔ effectiveFrom=${EFFECTIVE}`)
const manifest=JSON.parse(await readFile(join(SOURCE,'manifest.json'),'utf8'));if(!Array.isArray(manifest.pages)||manifest.pages.length!==5){console.log('✖ manifest storico incompleto');errors++}else console.log('✔ 5 snapshot ufficiali storici presenti')
const texts=new Map<string,string>();for(const p of manifest.pages??[]){const t=await readFile(join(SOURCE,p.text),'utf8');if(!/Redazione originaria/i.test(t)){console.log(`✖ ${p.key}: sezione Redazione originaria assente`);errors++}texts.set(p.key,t)}
console.log('\nVERSIONI TEMPORALI CANDIDATE')
for(const s of specs){const canon:any=await client.fetch('*[_type=="canon"&&number==$n][0]{_id,number,canonicalId}',{n:s.canon});if(!canon){console.log(`✖ Can. ${s.canon}: canon assente`);errors++;continue}const current:any[]=await client.fetch('*[_type=="canonVersion"&&canon._ref==$id&&language=="it"&&status=="current"]{_id,versionId,validFrom,validUntil,previousVersion,fullText}',{id:canon._id});if(current.length!==1){console.log(`✖ Can. ${s.canon}: versioni current IT=${current.length}, attesa 1`);errors++;continue}const v=current[0];const historicalId=`cic-1983-can-${s.canon}-it-1983`;const collisions:number=await client.fetch('count(*[_type=="canonVersion"&&(_id==$id||versionId==$versionId)])',{id:`version-${historicalId}`,versionId:historicalId});if(collisions){console.log(`✖ Can. ${s.canon}: collisione ${historicalId}`);errors++}const source=texts.get(s.page)??'';const hist=source.slice(Math.max(0,source.search(/Redazione originaria/i)));if(s.needsOriginal&&!new RegExp(`Can\\.\\s*${s.canon}\\b`,'i').test(hist)){console.log(`✖ Can. ${s.canon}: redazione originaria non individuata nello snapshot ${s.page}`);errors++}const txt=ptText(v.fullText);if(!txt.trim()){console.log(`✖ Can. ${s.canon}: testo current vuoto`);errors++}console.log(`Can. ${s.canon}: ${historicalId} | historical → ${LAST_OLD_DAY}; current ${v.versionId} → dal ${EFFECTIVE}`);console.log(`  ricostruzione=${s.mode}${s.locator?` (${s.locator})`:''} | collisioni=${collisions} | currentDates=${v.validFrom??'∅'}→${v.validUntil??'∅'}`);if(v.validFrom&&v.validFrom!==EFFECTIVE){console.log(`  ⚠ current validFrom già valorizzato a ${v.validFrom}`);warnings++}}
console.log(`\nErrori bloccanti: ${errors}`);console.log(`Avvisi: ${warnings}`);console.log(errors?'✖ PREFLIGHT STORICO NON SUPERATO':'✔ PREFLIGHT STORICO SUPERATO — nessuna scrittura eseguita');if(errors)process.exitCode=1}
main().catch(e=>{console.error(e);process.exit(1)})
