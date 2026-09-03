import {getCliClient} from 'sanity/cli'
import {client as readClient} from '../import-cic/client'

const commitMode=process.argv.includes('--commit')
const client=commitMode?getCliClient({apiVersion:'2026-03-25'}):readClient
const SOURCE_ID='source-francesco-rescritto-processo-matrimoniale-2015'
const DOCUMENT_ID='francesco-rescritto-processo-matrimoniale-2015'
const OFFICIAL_URL='https://www.vatican.va/content/francesco/it/letters/2015/documents/papa-francesco_20151207_rescritto-processo-matrimoniale.html'
const MITIS_ID='source-mitis-iudex-dominus-iesus-2015'
const ref=(_ref:string)=>({_type:'reference',_ref})

function decode(s:string){
 const named:Record<string,string>={nbsp:' ',amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',agrave:'à',aacute:'á',egrave:'è',eacute:'é',igrave:'ì',iacute:'í',ograve:'ò',oacute:'ó',ugrave:'ù',uacute:'ú',Agrave:'À',Egrave:'È',Eacute:'É',Igrave:'Ì',Ograve:'Ò',Ugrave:'Ù',laquo:'«',raquo:'»',ndash:'–',mdash:'—',hellip:'…'}
 return s.replace(/&([A-Za-z]+);/g,(e,n)=>named[n]??e).replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCharCode(parseInt(n,16)))
}
function extract(html:string){
 const clean=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
 return decode(clean.replace(/<br\s*\/?>/gi,'\n').replace(/<\/p\s*>/gi,'\n\n').replace(/<\/div\s*>/gi,'\n').replace(/<\/h[1-6]\s*>/gi,'\n\n').replace(/<[^>]+>/g,' ')).replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim()
}
async function main(){
 console.log(`\nRESCRITTO PROCESSO MATRIMONIALE 2015 — ${commitMode?'IMPORT':'DRY RUN'}`)
 const response=await fetch(OFFICIAL_URL)
 if(!response.ok)throw new Error(`Fonte vaticana non raggiungibile: HTTP ${response.status}`)
 const sourceText=extract(await response.text())
 const low=sourceText.toLowerCase()
 for(const marker of ['rescritto del santo padre francesco','nuova legge del processo matrimoniale','rota romana','7 dicembre 2015'])if(!low.includes(marker))throw new Error(`Marker ufficiale assente: ${marker}`)
 if(sourceText.length<4000)throw new Error(`Testo ufficiale troppo breve: ${sourceText.length}`)
 const mitis:any=await client.fetch('*[_id==$id][0]{_id}',{id:MITIS_ID})
 if(!mitis)throw new Error('Mitis Iudex non trovato in produzione')
 const fields={documentId:DOCUMENT_ID,title:"Rescritto sul compimento e l’osservanza della nuova legge del processo matrimoniale",shortTitle:'Rescritto processo matrimoniale',documentType:'rescript',issuer:'Francesco',issuedAt:'2015-12-07',publishedAt:'2015-12-11',effectiveFrom:'2015-12-08',territorialScope:'Chiesa universale',legalForce:'Rescritto pontificio',status:'inForce',language:'it',officialCitation:'Francesco, Rescritto sul compimento e l’osservanza della nuova legge del processo matrimoniale, 7 dicembre 2015; AAS 108 (2016) 5-6',officialUrl:OFFICIAL_URL,sourceText,canonicalDataVersion:'1.0.0',notes:'Fonte ufficiale vaticana. Il n. I stabilisce che le leggi di riforma del processo matrimoniale abrogano o derogano ogni legge o norma contraria; il n. II disciplina specificamente profili delle cause davanti alla Rota Romana.'}
 const relationId='rescritto-2015-applies-mitis-iudex'
 const relationDocId=`relation-${relationId}`
 const relation={relationId,source:ref(SOURCE_ID),target:ref(MITIS_ID),relationType:'specifies',authorityLevel:'pontifical',validFrom:'2015-12-08',sourceDocument:ref(SOURCE_ID),officialCitation:'Francesco, Rescritto sul compimento e l’osservanza della nuova legge del processo matrimoniale, I-II, 7 dicembre 2015',note:'Il Rescritto completa e specifica l’applicazione della riforma processuale matrimoniale introdotta da Mitis Iudex, con particolare disciplina della Rota Romana.',verified:true}
 console.log(`✔ testo ufficiale Vaticano: ${sourceText.length} caratteri`)
 console.log(`✔ sourceDocument — ${fields.title}`)
 console.log('✔ legalRelation — specifies → Mitis Iudex Dominus Iesus')
 if(!commitMode){console.log('✔ DRY RUN COMPLETATO — nessuna scrittura effettuata');return}
 let tx=client.transaction()
 tx=tx.createIfNotExists({_id:SOURCE_ID,_type:'sourceDocument',...fields}).patch(SOURCE_ID,{set:fields})
 tx=tx.createIfNotExists({_id:relationDocId,_type:'legalRelation',...relation}).patch(relationDocId,{set:relation})
 const result=await tx.commit({visibility:'sync'})
 console.log(`✔ Transazione completata — ${result.transactionId}`)
 const check:any=await client.fetch(`{"source":*[_id==$source][0]{documentId,title,issuedAt,effectiveFrom,officialUrl,sourceText},"relation":*[_id==$relation][0]{relationId,relationType,validFrom,verified,"target":target->_id}}`,{source:SOURCE_ID,relation:relationDocId})
 const errors:string[]=[]
 if(check.source?.documentId!==DOCUMENT_ID||check.source?.issuedAt!=='2015-12-07'||check.source?.effectiveFrom!=='2015-12-08'||!check.source?.sourceText?.toLowerCase().includes('rota romana'))errors.push('sourceDocument non conforme')
 if(check.relation?.relationId!==relationId||check.relation?.relationType!=='specifies'||check.relation?.verified!==true||check.relation?.target!==MITIS_ID)errors.push('legalRelation non conforme')
 if(errors.length){errors.forEach(e=>console.error(`✖ ${e}`));process.exit(1)}
 console.log('✔ READ-BACK SUPERATO — 1 sourceDocument · 1 legalRelation')
 console.log('✔ IMPORT RESCRITTO 2015 COMPLETATO')
}
main().catch(e=>{console.error('\n✖ RESCRITTO 2015 FALLITO');console.error(e instanceof Error?e.message:e);process.exit(1)})
