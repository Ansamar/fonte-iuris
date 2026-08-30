import {getCliClient} from 'sanity/cli'

type UnitType = 'book' | 'part' | 'section' | 'title' | 'chapter' | 'article'
type Unit = {canonicalId:string; unitType:UnitType; number?:string; title:string; canonicalLabel:string; parentCanonicalId?:string; order:number}

const units: Unit[] = []
const add = (canonicalId:string, unitType:UnitType, number:string|undefined, title:string, parentCanonicalId:string|undefined, order:number) => units.push({canonicalId,unitType,number,title,canonicalLabel:`${unitType==='book'?'LIBRO':unitType==='part'?'PARTE':unitType==='section'?'SEZIONE':unitType==='title'?'TITOLO':unitType==='chapter'?'CAPITOLO':'ARTICOLO'}${number?` ${number}`:''} — ${title.toUpperCase()}`,parentCanonicalId,order})

const b='cic-1983-book-7'
add(b,'book','VII','I processi',undefined,7)

const p1=`${b}-part-1`; add(p1,'part','I','I giudizi in generale',b,1)
add(`${p1}-title-1`,'title','I','Il tribunale competente',p1,1)
const p1t2=`${p1}-title-2`; add(p1t2,'title','II','Differenti gradi e specie di tribunali',p1,2)
const p1t2c1=`${p1t2}-chapter-1`; add(p1t2c1,'chapter','I','Il tribunale di prima istanza',p1t2,1)
add(`${p1t2c1}-article-1`,'article','1','Il giudice',p1t2c1,1)
add(`${p1t2c1}-article-2`,'article','2','Uditori e relatori',p1t2c1,2)
add(`${p1t2c1}-article-3`,'article','3','Promotore di giustizia, difensore del vincolo e notaio',p1t2c1,3)
add(`${p1t2}-chapter-2`,'chapter','II','Il tribunale di seconda istanza',p1t2,2)
add(`${p1t2}-chapter-3`,'chapter','III','I tribunali della Sede Apostolica',p1t2,3)
const p1t3=`${p1}-title-3`; add(p1t3,'title','III','La disciplina che deve essere osservata nei tribunali',p1,3)
;['L’ufficio dei giudici e dei ministri del tribunale','L’ordine da seguire nel giudicare le cause','Termini e dilazioni','Il luogo del giudizio','Le persone da ammettersi in aula, modalità per la redazione e la conservazione degli atti'].forEach((x,i)=>add(`${p1t3}-chapter-${i+1}`,'chapter',['I','II','III','IV','V'][i],x,p1t3,i+1))
const p1t4=`${p1}-title-4`; add(p1t4,'title','IV','Le parti nella causa',p1,4)
add(`${p1t4}-chapter-1`,'chapter','I','Attore e convenuto',p1t4,1); add(`${p1t4}-chapter-2`,'chapter','II','Procuratori alle liti e avvocati',p1t4,2)
const p1t5=`${p1}-title-5`; add(p1t5,'title','V','Azioni ed eccezioni',p1,5)
add(`${p1t5}-chapter-1`,'chapter','I','Azioni ed eccezioni in genere',p1t5,1); add(`${p1t5}-chapter-2`,'chapter','II','Azioni ed eccezioni in specie',p1t5,2)

const p2=`${b}-part-2`; add(p2,'part','II','Il giudizio contenzioso',b,2)
const s1=`${p2}-section-1`; add(s1,'section','I','Il giudizio contenzioso ordinario',p2,1)
const s1t1=`${s1}-title-1`; add(s1t1,'title','I','L’introduzione della causa',s1,1)
add(`${s1t1}-chapter-1`,'chapter','I','Il libello introduttorio della lite',s1t1,1); add(`${s1t1}-chapter-2`,'chapter','II','Citazione e intimazione degli atti giudiziari',s1t1,2)
add(`${s1}-title-2`,'title','II','La contestazione della lite',s1,2)
add(`${s1}-title-3`,'title','III','L’istanza della lite',s1,3)
const s1t4=`${s1}-title-4`; add(s1t4,'title','IV','Le prove',s1,4)
add(`${s1t4}-chapter-1`,'chapter','I','Le dichiarazioni delle parti',s1t4,1)
const s1t4c2=`${s1t4}-chapter-2`; add(s1t4c2,'chapter','II','Prova documentale',s1t4,2)
add(`${s1t4c2}-article-1`,'article','1','Natura e forza probante dei documenti',s1t4c2,1); add(`${s1t4c2}-article-2`,'article','2','Produzione dei documenti',s1t4c2,2)
const s1t4c3=`${s1t4}-chapter-3`; add(s1t4c3,'chapter','III','Testimoni e testimonianze',s1t4,3)
;['Chi può essere testimone','Presentazione ed esclusione dei testimoni','L’esame dei testimoni','Forza probante delle testimonianze'].forEach((x,i)=>add(`${s1t4c3}-article-${i+1}`,'article',String(i+1),x,s1t4c3,i+1))
add(`${s1t4}-chapter-4`,'chapter','IV','I periti',s1t4,4); add(`${s1t4}-chapter-5`,'chapter','V','Accesso ed ispezione giudiziaria',s1t4,5); add(`${s1t4}-chapter-6`,'chapter','VI','Le presunzioni',s1t4,6)
const s1t5=`${s1}-title-5`; add(s1t5,'title','V','Le cause incidentali',s1,5)
add(`${s1t5}-chapter-1`,'chapter','I','Le parti che non si presentano in giudizio',s1t5,1); add(`${s1t5}-chapter-2`,'chapter','II','L’intervento di un terzo nella causa',s1t5,2)
add(`${s1}-title-6`,'title','VI','La pubblicazione degli atti, la conclusione in causa e la discussione della causa',s1,6)
add(`${s1}-title-7`,'title','VII','I pronunciamenti del giudice',s1,7)
const s1t8=`${s1}-title-8`; add(s1t8,'title','VIII','Impugnazione della sentenza',s1,8)
add(`${s1t8}-chapter-1`,'chapter','I','Querela di nullità contro la sentenza',s1t8,1); add(`${s1t8}-chapter-2`,'chapter','II','L’appello',s1t8,2)
const s1t9=`${s1}-title-9`; add(s1t9,'title','IX','La cosa giudicata e la restitutio in integrum',s1,9)
add(`${s1t9}-chapter-1`,'chapter','I','La cosa giudicata',s1t9,1); add(`${s1t9}-chapter-2`,'chapter','II','La restitutio in integrum',s1t9,2)
add(`${s1}-title-10`,'title','X','Spese giudiziarie e gratuito patrocinio',s1,10)
add(`${s1}-title-11`,'title','XI','L’esecuzione della sentenza',s1,11)
add(`${p2}-section-2`,'section','II','Il processo contenzioso orale',p2,2)

const p3=`${b}-part-3`; add(p3,'part','III','Alcuni processi speciali',b,3)
const p3t1=`${p3}-title-1`; add(p3t1,'title','I','I processi matrimoniali',p3,1)
const p3t1c1=`${p3t1}-chapter-1`; add(p3t1c1,'chapter','I','Le cause per la dichiarazione di nullità del matrimonio',p3t1,1)
;['Il foro competente e i tribunali','Il diritto di impugnare il matrimonio','L’introduzione e l’istruzione della causa','La sentenza, le sue impugnazioni e la sua esecuzione','Il processo matrimoniale più breve davanti al Vescovo','Il processo documentale','Norme generali'].forEach((x,i)=>add(`${p3t1c1}-article-${i+1}`,'article',String(i+1),x,p3t1c1,i+1))
add(`${p3t1}-chapter-2`,'chapter','II','Cause di separazione dei coniugi',p3t1,2)
add(`${p3t1}-chapter-3`,'chapter','III','Processo per la dispensa dal matrimonio rato e non consumato',p3t1,3)
add(`${p3t1}-chapter-4`,'chapter','IV','Processo di morte presunta del coniuge',p3t1,4)
add(`${p3}-title-2`,'title','II','Cause per la dichiarazione di nullità della sacra ordinazione',p3,2)
add(`${p3}-title-3`,'title','III','Modi per evitare i giudizi',p3,3)

const p4=`${b}-part-4`; add(p4,'part','IV','Il processo penale',b,4)
add(`${p4}-chapter-1`,'chapter','I','L’indagine previa',p4,1); add(`${p4}-chapter-2`,'chapter','II','Lo svolgimento del processo',p4,2); add(`${p4}-chapter-3`,'chapter','III','L’azione per la riparazione dei danni',p4,3)

const p5=`${b}-part-5`; add(p5,'part','V','Il modo di procedere nei ricorsi amministrativi e nella rimozione o nel trasferimento dei parroci',b,5)
add(`${p5}-section-1`,'section','I','Il ricorso contro i decreti amministrativi',p5,1)
const p5s2=`${p5}-section-2`; add(p5s2,'section','II','Procedura per la rimozione e il trasferimento dei parroci',p5,2)
add(`${p5s2}-chapter-1`,'chapter','I','Modo di procedere nella rimozione dei parroci',p5s2,1); add(`${p5s2}-chapter-2`,'chapter','II','Modo di procedere nel trasferimento dei parroci',p5s2,2)

async function main() {
  const client=getCliClient({apiVersion:'2026-03-25'})
  const corpus=await client.fetch(`*[_type=="corpus" && code=="cic-1983"][0]{_id}`)
  if(!corpus?._id) throw new Error('Corpus cic-1983 non trovato')
  const ids=new Map<string,string>()
  for(const unit of units){
    const existing=await client.fetch(`*[_type=="structuralUnit" && canonicalId==$id][0]{_id}`,{id:unit.canonicalId})
    const id=existing?._id ?? `structural-${unit.canonicalId}`
    ids.set(unit.canonicalId,id)
    const parentId=unit.parentCanonicalId?ids.get(unit.parentCanonicalId):undefined
    if(unit.parentCanonicalId&&!parentId) throw new Error(`Unità superiore non risolta: ${unit.parentCanonicalId}`)
    await client.createOrReplace({_id:id,_type:'structuralUnit',corpus:{_type:'reference',_ref:corpus._id},unitType:unit.unitType,...(unit.number?{number:unit.number}:{}),title:unit.title,canonicalId:unit.canonicalId,slug:{_type:'slug',current:unit.canonicalId.replace(/^cic-1983-/,'')},...(parentId?{parent:{_type:'reference',_ref:parentId}}:{}),order:unit.order,canonicalLabel:unit.canonicalLabel})
    console.log(`${existing?'UPDATE':'CREATE'} — ${unit.canonicalLabel}`)
  }
  console.log(`STRUTTURA LIBRO VII COMPLETATA — ${units.length}/${units.length}`)
}
main().catch((error)=>{console.error('\nSTRUTTURA LIBRO VII FALLITA\n');console.error(error);process.exitCode=1})
