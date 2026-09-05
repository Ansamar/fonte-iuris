import {getCliClient} from 'sanity/cli'
import {writeFileSync} from 'node:fs'
import {resolve} from 'node:path'

type Issue={severity:'high'|'medium'|'low';code:string;type:string;id:string;path:string;message:string;snippet:string}
type TextEntry={type:string;id:string;path:string;declaredLanguage?:string;value:string}

const client=getCliClient({apiVersion:'2026-03-25'}).withConfig({dataset:'production',useCdn:false})
const relevantTypes=['canon','canonVersion','sourceDocument','italianProvision','legalConcept','jurisprudentialDecision','pastoralDocument','legalRelation']
const internalKeys=new Set(['_id','_type','_rev','_createdAt','_updatedAt','_key','_ref','_weak','documentId','versionId','canonicalId','decisionId','pastoralId','slug','officialUrl','sourceUrl','url','snapshot','sha256','path','canonicalDataVersion'])
const enumKeys=new Set(['status','language','documentType','legalForce','territorialScope','publicationStatus','privacyStatus','tribunalLevel','decisionType','instanceLevel','academicLevel','pastoralType','juridicalCharacter','relationType','basis','editorialStatus','holdingType','kind','party'])
const rawEnumWords=new Set(['affirmative','negative','mixed','undetermined','pending','verified','current','superseded','historical','first','second','third','further','unknown','petitioner','respondent','bothOrUnspecified','officialReference','verifiedSecondary'])
const latinSignals=/\b(coram|dubium|caput|capita|incapacitas|assumendi|essentiales|matrimonii|obligationes|gravis|defectus|discretionis|iudicii|dolus|metus|exclusio|indissolubilitatis|bonum|coniugum|prolis|in iure|in facto|sententia|affirmative|negative)\b/i
const englishSignals=/\b(the|and|of|with|without|court|decision|judgment|petitioner|respondent|affirmative|negative|mixed|verified|pending)\b/i

function portableTextToString(v:any):string{
 if(!Array.isArray(v))return ''
 const blocks=v.filter(x=>x&&typeof x==='object'&&x._type==='block')
 return blocks.map((b:any)=>(b.children??[]).map((c:any)=>c?.text??'').join('')).filter(Boolean).join('\n\n')
}

function collectStrings(value:any,type:string,id:string,path:string,declaredLanguage:string|undefined,out:TextEntry[]){
 if(value==null)return
 if(typeof value==='string'){
  if(!value.trim()||/^https?:\/\//i.test(value))return
  out.push({type,id,path,declaredLanguage,value})
  return
 }
 if(Array.isArray(value)){
  const pt=portableTextToString(value)
  if(pt){out.push({type,id,path,declaredLanguage,value:pt});return}
  value.forEach((item,i)=>collectStrings(item,type,id,`${path}[${i}]`,declaredLanguage,out));return
 }
 if(typeof value==='object'){
  for(const [k,v] of Object.entries(value)){
   if(internalKeys.has(k)||enumKeys.has(k))continue
   collectStrings(v,type,id,path?`${path}.${k}`:k,declaredLanguage,out)
  }
 }
}

function issue(severity:Issue['severity'],code:string,e:TextEntry,message:string,snippet?:string):Issue{
 const compact=(snippet??e.value).replace(/\s+/g,' ').trim().slice(0,260)
 return {severity,code,type:e.type,id:e.id,path:e.path,message,snippet:compact}
}

function inspectText(e:TextEntry):Issue[]{
 const v=e.value
 const out:Issue[]=[]
 if(/&(?:nbsp|amp|agrave|egrave|[a-z]+);/i.test(v))out.push(issue('high','html-entity',e,'Entità HTML grezze visibili nel testo.'))
 if(/<\/?[a-z][^>]*>/i.test(v))out.push(issue('high','html-tag',e,'Tag HTML grezzi presenti nel testo utente.'))
 if(/\t/.test(v))out.push(issue('medium','tab',e,'Tabulazioni presenti: possibile impaginazione irregolare.'))
 if(/\n{3,}/.test(v))out.push(issue('medium','excess-blank-lines',e,'Tre o più righe vuote consecutive.'))
 if(/ {3,}/.test(v))out.push(issue('low','multi-space',e,'Sequenze di tre o più spazi consecutivi.'))
 const lines=v.split(/\r?\n/)
 if(v.length>1200&&lines.length<=2)out.push(issue('high','monolithic-text',e,'Testo molto lungo senza struttura in paragrafi.'))
 const longest=lines.reduce((a,b)=>b.length>a.length?b:a,'')
 if(longest.length>420)out.push(issue('medium','very-long-line',e,`Riga molto lunga (${longest.length} caratteri): probabile testo non segmentato.`,longest))
 if(/^\s|\s$/m.test(v))out.push(issue('low','edge-whitespace',e,'Spazi iniziali/finali presenti su una o più righe.'))
 if(/(^|\n)\s*(home|menu|privacy|cookie|contatti|english|français|español)\s*($|\n)/im.test(v))out.push(issue('high','navigation-noise',e,'Possibile testo di navigazione/sito acquisito insieme al documento.'))
 const pathLower=e.path.toLowerCase()
 const editorialPath=/(title|summary|definition|framework|foundation|discipline|evolution|interpretation|practice|issues|purpose|relevance|ratio|context|note|proposition|dispositive|dubium|label)/.test(pathLower)
 if(editorialPath&&e.declaredLanguage!=='la'&&latinSignals.test(v))out.push(issue('medium','latin-in-editorial-field',e,'Terminologia o frase latina in un campo editoriale destinato alla lettura italiana.'))
 if(editorialPath&&e.declaredLanguage!=='en'&&englishSignals.test(v))out.push(issue('medium','english-in-editorial-field',e,'Terminologia o frase inglese in un campo editoriale destinato alla lettura italiana.'))
 if(rawEnumWords.has(v.trim()))out.push(issue('high','raw-enum-visible',e,'Valore tecnico/enumerativo non localizzato presente in un campo testuale.'))
 return out
}

async function main(){
 const docs=await client.fetch(`*[_type in $types]`,{types:relevantTypes})
 const counts:Record<string,number>={}
 const texts:TextEntry[]=[]
 for(const doc of docs){
  counts[doc._type]=(counts[doc._type]??0)+1
  const declaredLanguage=typeof doc.language==='string'?doc.language:undefined
  collectStrings(doc,doc._type,doc._id,'',declaredLanguage,texts)
 }
 const issues=texts.flatMap(inspectText)
 const severityRank={high:0,medium:1,low:2}
 issues.sort((a,b)=>severityRank[a.severity]-severityRank[b.severity]||a.type.localeCompare(b.type)||a.id.localeCompare(b.id)||a.path.localeCompare(b.path))
 const byCode:Record<string,number>={};const bySeverity:Record<string,number>={high:0,medium:0,low:0}
 for(const i of issues){byCode[i.code]=(byCode[i.code]??0)+1;bySeverity[i.severity]++}
 const report={generatedAt:new Date().toISOString(),dataset:'production',documentCount:docs.length,counts,textFieldCount:texts.length,issueCount:issues.length,bySeverity,byCode,issues,texts}
 const outputArg=process.argv.find(a=>a.startsWith('--output='))?.slice('--output='.length)
 const output=resolve(process.cwd(),outputArg||'production-content-audit.json')
 writeFileSync(output,JSON.stringify(report,null,2),'utf8')
 console.log(`AUDIT PRODUCTION OK · ${docs.length} documenti · ${texts.length} campi testuali · ${issues.length} anomalie`)
 console.log(`ALTA ${bySeverity.high} · MEDIA ${bySeverity.medium} · BASSA ${bySeverity.low}`)
 console.log(`REPORT ${output}`)
 for(const i of issues.slice(0,40))console.log(`${i.severity.toUpperCase()} · ${i.code} · ${i.type} · ${i.id} · ${i.path} · ${i.snippet}`)
 if(issues.length>40)console.log(`… altre ${issues.length-40} anomalie nel report JSON`)
}

main().catch(error=>{console.error(error);process.exit(1)})
