import {getCliClient} from 'sanity/cli'

type Unit = {
  canonicalId: string
  unitType: 'book' | 'part' | 'title' | 'chapter'
  number: string
  title: string
  canonicalLabel: string
  parentCanonicalId?: string
  order: number
}

async function main() {
  const client = getCliClient({apiVersion: '2026-03-25'})
  const corpus = await client.fetch(`*[_type=="corpus" && code=="cic-1983"][0]{_id}`)
  if (!corpus?._id) throw new Error('Corpus cic-1983 non trovato')

  const units: Unit[] = [
    {canonicalId:'cic-1983-book-6',unitType:'book',number:'VI',title:'Le sanzioni penali nella Chiesa',canonicalLabel:'LIBRO VI — LE SANZIONI PENALI NELLA CHIESA',order:6},
    {canonicalId:'cic-1983-book-6-part-1',unitType:'part',number:'I',title:'Delitti e pene in genere',canonicalLabel:'PARTE I — DELITTI E PENE IN GENERE',parentCanonicalId:'cic-1983-book-6',order:1},
    {canonicalId:'cic-1983-book-6-part-1-title-1',unitType:'title',number:'I',title:'La punizione dei delitti in generale',canonicalLabel:'TITOLO I — LA PUNIZIONE DEI DELITTI IN GENERALE',parentCanonicalId:'cic-1983-book-6-part-1',order:1},
    {canonicalId:'cic-1983-book-6-part-1-title-2',unitType:'title',number:'II',title:'Legge penale e precetto penale',canonicalLabel:'TITOLO II — LEGGE PENALE E PRECETTO PENALE',parentCanonicalId:'cic-1983-book-6-part-1',order:2},
    {canonicalId:'cic-1983-book-6-part-1-title-3',unitType:'title',number:'III',title:'Il soggetto passivo delle sanzioni penali',canonicalLabel:'TITOLO III — IL SOGGETTO PASSIVO DELLE SANZIONI PENALI',parentCanonicalId:'cic-1983-book-6-part-1',order:3},
    {canonicalId:'cic-1983-book-6-part-1-title-4',unitType:'title',number:'IV',title:'Le pene e le altre punizioni',canonicalLabel:'TITOLO IV — LE PENE E LE ALTRE PUNIZIONI',parentCanonicalId:'cic-1983-book-6-part-1',order:4},
    {canonicalId:'cic-1983-book-6-part-1-title-4-chapter-1',unitType:'chapter',number:'I',title:'Le censure',canonicalLabel:'CAPITOLO I — LE CENSURE',parentCanonicalId:'cic-1983-book-6-part-1-title-4',order:1},
    {canonicalId:'cic-1983-book-6-part-1-title-4-chapter-2',unitType:'chapter',number:'II',title:'Le pene espiatorie',canonicalLabel:'CAPITOLO II — LE PENE ESPIATORIE',parentCanonicalId:'cic-1983-book-6-part-1-title-4',order:2},
    {canonicalId:'cic-1983-book-6-part-1-title-4-chapter-3',unitType:'chapter',number:'III',title:'Rimedi penali e penitenze',canonicalLabel:'CAPITOLO III — RIMEDI PENALI E PENITENZE',parentCanonicalId:'cic-1983-book-6-part-1-title-4',order:3},
    {canonicalId:'cic-1983-book-6-part-1-title-5',unitType:'title',number:'V',title:"L'applicazione delle pene",canonicalLabel:"TITOLO V — L'APPLICAZIONE DELLE PENE",parentCanonicalId:'cic-1983-book-6-part-1',order:5},
    {canonicalId:'cic-1983-book-6-part-1-title-6',unitType:'title',number:'VI',title:'La remissione delle pene e la prescrizione delle azioni',canonicalLabel:'TITOLO VI — LA REMISSIONE DELLE PENE E LA PRESCRIZIONE DELLE AZIONI',parentCanonicalId:'cic-1983-book-6-part-1',order:6},
    {canonicalId:'cic-1983-book-6-part-2',unitType:'part',number:'II',title:'I singoli delitti e le pene costituite per essi',canonicalLabel:'PARTE II — I SINGOLI DELITTI E LE PENE COSTITUITE PER ESSI',parentCanonicalId:'cic-1983-book-6',order:2},
    {canonicalId:'cic-1983-book-6-part-2-title-1',unitType:'title',number:'I',title:"Delitti contro la fede e l'unità della Chiesa",canonicalLabel:"TITOLO I — DELITTI CONTRO LA FEDE E L'UNITÀ DELLA CHIESA",parentCanonicalId:'cic-1983-book-6-part-2',order:1},
    {canonicalId:'cic-1983-book-6-part-2-title-2',unitType:'title',number:'II',title:"Delitti contro le autorità ecclesiastiche e l'esercizio degli incarichi",canonicalLabel:"TITOLO II — DELITTI CONTRO LE AUTORITÀ ECCLESIASTICHE E L'ESERCIZIO DEGLI INCARICHI",parentCanonicalId:'cic-1983-book-6-part-2',order:2},
    {canonicalId:'cic-1983-book-6-part-2-title-3',unitType:'title',number:'III',title:'Delitti contro i sacramenti',canonicalLabel:'TITOLO III — DELITTI CONTRO I SACRAMENTI',parentCanonicalId:'cic-1983-book-6-part-2',order:3},
    {canonicalId:'cic-1983-book-6-part-2-title-4',unitType:'title',number:'IV',title:'Delitti contro la buona fama e delitto di falso',canonicalLabel:'TITOLO IV — DELITTI CONTRO LA BUONA FAMA E DELITTO DI FALSO',parentCanonicalId:'cic-1983-book-6-part-2',order:4},
    {canonicalId:'cic-1983-book-6-part-2-title-5',unitType:'title',number:'V',title:'Delitti contro obblighi speciali',canonicalLabel:'TITOLO V — DELITTI CONTRO OBBLIGHI SPECIALI',parentCanonicalId:'cic-1983-book-6-part-2',order:5},
    {canonicalId:'cic-1983-book-6-part-2-title-6',unitType:'title',number:'VI',title:"Delitti contro la vita, la dignità e la libertà dell'uomo",canonicalLabel:"TITOLO VI — DELITTI CONTRO LA VITA, LA DIGNITÀ E LA LIBERTÀ DELL'UOMO",parentCanonicalId:'cic-1983-book-6-part-2',order:6},
    {canonicalId:'cic-1983-book-6-part-2-title-7',unitType:'title',number:'VII',title:'Norma generale',canonicalLabel:'TITOLO VII — NORMA GENERALE',parentCanonicalId:'cic-1983-book-6-part-2',order:7},
  ]

  const ids = new Map<string, string>()
  for (const unit of units) {
    const existing = await client.fetch(`*[_type=="structuralUnit" && canonicalId==$id][0]{_id}`, {id: unit.canonicalId})
    const id = existing?._id ?? `structural-${unit.canonicalId}`
    ids.set(unit.canonicalId, id)
    const parentId = unit.parentCanonicalId ? ids.get(unit.parentCanonicalId) : undefined
    if (unit.parentCanonicalId && !parentId) throw new Error(`Unità superiore non risolta: ${unit.parentCanonicalId}`)
    await client.createOrReplace({_id:id,_type:'structuralUnit',corpus:{_type:'reference',_ref:corpus._id},unitType:unit.unitType,number:unit.number,title:unit.title,canonicalId:unit.canonicalId,slug:{_type:'slug',current:unit.canonicalId.replace(/^cic-1983-/,'')},...(parentId?{parent:{_type:'reference',_ref:parentId}}:{}),order:unit.order,canonicalLabel:unit.canonicalLabel})
    console.log(`${existing ? 'UPDATE' : 'CREATE'} — ${unit.canonicalLabel}`)
  }
  console.log(`STRUTTURA LIBRO VI COMPLETATA — ${units.length}/${units.length}`)
}

main().catch((error) => { console.error('\nSTRUTTURA LIBRO VI FALLITA\n'); console.error(error); process.exitCode = 1 })
