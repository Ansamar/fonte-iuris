import {getCliClient} from 'sanity/cli'
import {client as readClient} from '../import-cic/client'

const commitMode=process.argv.includes('--commit')
const client=commitMode?getCliClient({apiVersion:'2026-03-25'}):readClient
const SOURCE_ID='source-mitis-iudex-dominus-iesus-2015'
const ref=(_ref:string)=>({_type:'reference',_ref})

const CANONS:Record<number,number[]>={
  1:[383,529],2:[1671],3:[1671],4:[1671],5:[1671],6:[1691],7:[1672],8:[1673],9:[1673],10:[1676],11:[1676],12:[1677],13:[1678],14:[1680],15:[1685],16:[1686],17:[1687],18:[1687],19:[1672,1687],20:[1687],21:[1672,1688],
}

function decode(s:string){const named:Record<string,string>={nbsp:' ',amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',agrave:'à',aacute:'á',egrave:'è',eacute:'é',igrave:'ì',iacute:'í',ograve:'ò',oacute:'ó',ugrave:'ù',uacute:'ú',Agrave:'À',Egrave:'È',Eacute:'É',Igrave:'Ì',Ograve:'Ò',Ugrave:'Ù',laquo:'«',raquo:'»',ndash:'–',mdash:'—',hellip:'…'};return s.replace(/&([A-Za-z]+);/g,(e,n)=>named[n]??e).replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCharCode(parseInt(n,16)))}
function extract(html:string){const clean=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ');return decode(clean.replace(/<br\s*\/?>/gi,'\n').replace(/<\/p\s*>/gi,'\n\n').replace(/<\/div\s*>/gi,'\n').replace(/<\/h[1-6]\s*>/gi,'\n\n').replace(/<[^>]+>/g,' ')).replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim()}
function articles(text:string){
 const start=text.indexOf('Regole procedurali per la trattazione delle cause di nullità matrimoniale')
 if(start<0)throw new Error('Sezione Regole procedurali non trovata')
 const section=text.slice(start)
 const re=/Art\.\s*(\d{1,2})(?:\.|\s)/g;const hits=[...section.matchAll(re)]
 const out=new Map<number,string>()
 for(let i=0;i<hits.length;i++){const n=Number(hits[i][1]);if(n<1||n>21||out.has(n))continue;const a=hits[i].index!;let b=section.length;for(let j=i+1;j<hits.length;j++){const nn=Number(hits[j][1]);if(nn>=1&&nn<=21){b=hits[j].index!;break}}out.set(n,section.slice(a,b).trim())}
 return out
}
function block(text:string){return [{_type:'block',_key:'text',style:'normal',markDefs:[],children:[{_type:'span',_key:'span',text,marks:[]}]}]}

async function main(){
 console.log(`\nMITIS IUDEX — REGOLE PROCEDURALI ARTT. 1–21 — ${commitMode?'IMPORT':'DRY RUN'}`)
 const source:any=await client.fetch('*[_id==$id][0]{_id,sourceText,officialUrl}',{id:SOURCE_ID})
 if(!source?.sourceText)throw new Error('Mitis Iudex/sourceText non trovato in produzione')
 const text=extract(source.sourceText.includes('<')?source.sourceText:source.sourceText)
 const arts=articles(text)
 if(arts.size!==21)throw new Error(`Articoli estratti: ${arts.size}, attesi 21`)
 const canonNumbers=[...new Set(Object.values(CANONS).flat())]
 const canons:any[]=await client.fetch('*[_type=="canon"&&number in $numbers]{_id,number,canonicalId}',{numbers:canonNumbers})
 const byNumber=new Map(canons.map(c=>[c.number,c]))
 for(const n of canonNumbers)if(!byNumber.get(n))throw new Error(`Can. ${n} non risolto`)
 for(let n=1;n<=21;n++){const t=arts.get(n)!;if(t.length<20)throw new Error(`Art. ${n}: testo troppo breve`);console.log(`✔ Art. ${n} — ${t.length} caratteri · ${CANONS[n].map(c=>'can. '+c).join(', ')}`)}
 if(!commitMode){console.log('✔ DRY RUN COMPLETATO — 21 articoli · nessuna scrittura');return}
 let tx=client.transaction()
 for(let n=1;n<=21;n++){
   const articleId=`mitis-iudex-regola-procedurale-art-${n}`
   const primary=byNumber.get(CANONS[n][0])
   const fields={annotationType:'deepDive',canon:ref(primary._id),title:`Mitis Iudex — Regola procedurale art. ${n}`,content:block(arts.get(n)!),status:'ready'}
   tx=tx.createIfNotExists({_id:articleId,_type:'annotation',...fields}).patch(articleId,{set:fields})
   for(const canonNo of CANONS[n]){
     const target=byNumber.get(canonNo);const relationId=`mitis-iudex-regola-art-${n}-interprets-can-${canonNo}`;const id=`relation-${relationId}`
     const rel={relationId,source:ref(SOURCE_ID),target:ref(target._id),relationType:'interprets',authorityLevel:'pontifical',validFrom:'2015-12-08',sourceDocument:ref(SOURCE_ID),officialCitation:`Mitis Iudex Dominus Iesus, Regole procedurali, art. ${n}`,note:`Regola procedurale art. ${n}: collegamento applicativo al can. ${canonNo}.`,verified:true}
     tx=tx.createIfNotExists({_id:id,_type:'legalRelation',...rel}).patch(id,{set:rel})
   }
 }
 const result=await tx.commit({visibility:'sync'});console.log(`✔ Transazione completata — ${result.transactionId}`)
 const check:any=await client.fetch(`{"articles":count(*[_type=="annotation"&&_id match "mitis-iudex-regola-procedurale-art-*"]),"relations":count(*[_type=="legalRelation"&&relationId match "mitis-iudex-regola-art-*"])}`)
 const expectedRelations=Object.values(CANONS).reduce((a,b)=>a+b.length,0)
 if(check.articles!==21||check.relations!==expectedRelations)throw new Error(`Read-back: articoli=${check.articles}/21 relazioni=${check.relations}/${expectedRelations}`)
 console.log(`✔ READ-BACK SUPERATO — 21 articoli · ${expectedRelations} relazioni canoniche`)
 console.log('✔ REGOLE PROCEDURALI MITIS IUDEX COMPLETATE')
}
main().catch(e=>{console.error('\n✖ REGOLE PROCEDURALI FALLITE');console.error(e instanceof Error?e.message:e);process.exit(1)})
