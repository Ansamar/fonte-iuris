import {getCliClient} from 'sanity/cli'

const client=getCliClient({apiVersion:'2026-03-25'})
type U={id:string;type:'book'|'part'|'section'|'title'|'chapter'|'article';number?:string;title:string;parent?:string;order:number}
const u=(id:U['id'],type:U['type'],number:string|undefined,title:string,parent:string|undefined,order:number):U=>({id,type,number,title,parent,order})
const units:U[]=[
 u('cic-1983-book-1','book','I','Norme generali',undefined,1),
 ...[['1','Le leggi ecclesiastiche'],['2','La consuetudine'],['3','I decreti generali e le istruzioni'],['4','Gli atti amministrativi singolari'],['5','Gli statuti e i regolamenti'],['6','Le persone fisiche e giuridiche'],['7','Gli atti giuridici'],['8','La potestà di governo'],['9','Gli uffici ecclesiastici'],['10','La prescrizione'],['11','Il computo del tempo']].map((x,i)=>u(`cic-1983-book-1-title-${x[0]}`,'title',['I','II','III','IV','V','VI','VII','VIII','IX','X','XI'][i],x[1],'cic-1983-book-1',i+1)),
 ...['Norme comuni','I decreti e precetti singolari','I rescritti','I privilegi','Le dispense'].map((t,i)=>u(`cic-1983-book-1-title-4-chapter-${i+1}`,'chapter',['I','II','III','IV','V'][i],t,'cic-1983-book-1-title-4',i+1)),
 u('cic-1983-book-1-title-6-chapter-1','chapter','I','La condizione canonica delle persone fisiche','cic-1983-book-1-title-6',1),u('cic-1983-book-1-title-6-chapter-2','chapter','II','Le persone giuridiche','cic-1983-book-1-title-6',2),
 u('cic-1983-book-1-title-9-chapter-1','chapter','I',"Provvisione dell'ufficio ecclesiastico",'cic-1983-book-1-title-9',1),u('cic-1983-book-1-title-9-chapter-2','chapter','II',"Perdita dell'ufficio ecclesiastico",'cic-1983-book-1-title-9',2),
 ...['Libero conferimento','Presentazione','Elezione','Postulazione'].map((t,i)=>u(`cic-1983-book-1-title-9-chapter-1-article-${i+1}`,'article',String(i+1),t,'cic-1983-book-1-title-9-chapter-1',i+1)),
 ...['Rinuncia','Trasferimento','Rimozione','Privazione'].map((t,i)=>u(`cic-1983-book-1-title-9-chapter-2-article-${i+1}`,'article',String(i+1),t,'cic-1983-book-1-title-9-chapter-2',i+1)),
 u('cic-1983-book-2','book','II','Il popolo di Dio',undefined,2),u('cic-1983-book-2-part-1','part','I','I fedeli cristiani','cic-1983-book-2',1),
 ...[['1','Obblighi e diritti di tutti i fedeli'],['2','Obblighi e diritti dei fedeli laici'],['3','I ministri sacri o chierici'],['4','Le prelature personali'],['5','Le associazioni dei fedeli']].map((x,i)=>u(`cic-1983-book-2-part-1-title-${x[0]}`,'title',['I','II','III','IV','V'][i],x[1],'cic-1983-book-2-part-1',i+1)),
 ...['La formazione dei chierici',"L'ascrizione dei chierici o incardinazione",'Obblighi e diritti dei chierici','La perdita dello stato clericale'].map((t,i)=>u(`cic-1983-book-2-part-1-title-3-chapter-${i+1}`,'chapter',['I','II','III','IV'][i],t,'cic-1983-book-2-part-1-title-3',i+1)),
 ...['Norme comuni','Associazioni pubbliche di fedeli','Associazioni private di fedeli','Norme speciali per le associazioni di laici'].map((t,i)=>u(`cic-1983-book-2-part-1-title-5-chapter-${i+1}`,'chapter',['I','II','III','IV'][i],t,'cic-1983-book-2-part-1-title-5',i+1)),
 u('cic-1983-book-2-part-2','part','II','La costituzione gerarchica della Chiesa','cic-1983-book-2',2),u('cic-1983-book-2-part-2-section-1','section','I','La suprema autorità della Chiesa','cic-1983-book-2-part-2',1),
 ...['Il Romano Pontefice e il Collegio dei Vescovi','Il Sinodo dei Vescovi','I Cardinali di Santa Romana Chiesa','La Curia Romana','I Legati del Romano Pontefice'].map((t,i)=>u(`cic-1983-book-2-part-2-section-1-chapter-${i+1}`,'chapter',['I','II','III','IV','V'][i],t,'cic-1983-book-2-part-2-section-1',i+1)),
 u('cic-1983-book-2-part-2-section-1-chapter-1-article-1','article','1','Il Romano Pontefice','cic-1983-book-2-part-2-section-1-chapter-1',1),u('cic-1983-book-2-part-2-section-1-chapter-1-article-2','article','2','Il Collegio dei Vescovi','cic-1983-book-2-part-2-section-1-chapter-1',2),
]
async function main(){for(const x of units){await client.createOrReplace({_id:x.id,_type:'structuralUnit',corpus:{_type:'reference',_ref:'cic-1983'},unitType:x.type,...(x.number?{number:x.number}:{}),title:x.title,canonicalId:x.id,canonicalLabel:`${x.type.toUpperCase()}${x.number?` ${x.number}`:''} — ${x.title}`,...(x.parent?{parent:{_type:'reference',_ref:x.parent}}:{}),order:x.order})}console.log(`STRUTTURA_1_367_OK ${units.length}/${units.length}`)}
main().catch(e=>{console.error(e);process.exitCode=1})
