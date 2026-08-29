import {getCliClient} from 'sanity/cli'

const API_VERSION = '2026-03-25'
const CORPUS_CODE = 'cic-1983'

const client = getCliClient({apiVersion: API_VERSION})

type Unit = {
  canonicalId: string
  unitType: 'book' | 'part' | 'title' | 'chapter' | 'article'
  number?: string
  title: string
  canonicalLabel: string
  parentCanonicalId?: string
  order: number
}

const units: Unit[] = [
  {canonicalId:'cic-1983-book-4',unitType:'book',number:'IV',title:'La funzione di santificare della Chiesa',canonicalLabel:'LIBRO IV — LA FUNZIONE DI SANTIFICARE DELLA CHIESA',order:4},

  {canonicalId:'cic-1983-book-4-part-1',unitType:'part',number:'I',title:'I sacramenti',canonicalLabel:'PARTE I — I SACRAMENTI',parentCanonicalId:'cic-1983-book-4',order:1},
  {canonicalId:'cic-1983-book-4-part-1-title-1',unitType:'title',number:'I',title:'Il battesimo',canonicalLabel:'TITOLO I — IL BATTESIMO',parentCanonicalId:'cic-1983-book-4-part-1',order:1},
  {canonicalId:'cic-1983-book-4-part-1-title-1-chapter-1',unitType:'chapter',number:'I',title:'La celebrazione del battesimo',canonicalLabel:'CAPITOLO I — LA CELEBRAZIONE DEL BATTESIMO',parentCanonicalId:'cic-1983-book-4-part-1-title-1',order:1},
  {canonicalId:'cic-1983-book-4-part-1-title-1-chapter-2',unitType:'chapter',number:'II',title:'Il ministro del battesimo',canonicalLabel:'CAPITOLO II — IL MINISTRO DEL BATTESIMO',parentCanonicalId:'cic-1983-book-4-part-1-title-1',order:2},
  {canonicalId:'cic-1983-book-4-part-1-title-1-chapter-3',unitType:'chapter',number:'III',title:'I battezzandi',canonicalLabel:'CAPITOLO III — I BATTEZZANDI',parentCanonicalId:'cic-1983-book-4-part-1-title-1',order:3},
  {canonicalId:'cic-1983-book-4-part-1-title-1-chapter-4',unitType:'chapter',number:'IV',title:'I padrini',canonicalLabel:'CAPITOLO IV — I PADRINI',parentCanonicalId:'cic-1983-book-4-part-1-title-1',order:4},
  {canonicalId:'cic-1983-book-4-part-1-title-1-chapter-5',unitType:'chapter',number:'V',title:'Prova e annotazione del battesimo conferito',canonicalLabel:'CAPITOLO V — PROVA E ANNOTAZIONE DEL BATTESIMO CONFERITO',parentCanonicalId:'cic-1983-book-4-part-1-title-1',order:5},

  {canonicalId:'cic-1983-book-4-part-1-title-2',unitType:'title',number:'II',title:'Il sacramento della confermazione',canonicalLabel:'TITOLO II — IL SACRAMENTO DELLA CONFERMAZIONE',parentCanonicalId:'cic-1983-book-4-part-1',order:2},
  {canonicalId:'cic-1983-book-4-part-1-title-2-chapter-1',unitType:'chapter',number:'I',title:'La celebrazione della confermazione',canonicalLabel:'CAPITOLO I — LA CELEBRAZIONE DELLA CONFERMAZIONE',parentCanonicalId:'cic-1983-book-4-part-1-title-2',order:1},
  {canonicalId:'cic-1983-book-4-part-1-title-2-chapter-2',unitType:'chapter',number:'II',title:'Il ministro della confermazione',canonicalLabel:'CAPITOLO II — IL MINISTRO DELLA CONFERMAZIONE',parentCanonicalId:'cic-1983-book-4-part-1-title-2',order:2},
  {canonicalId:'cic-1983-book-4-part-1-title-2-chapter-3',unitType:'chapter',number:'III',title:'I confermandi',canonicalLabel:'CAPITOLO III — I CONFERMANDI',parentCanonicalId:'cic-1983-book-4-part-1-title-2',order:3},
  {canonicalId:'cic-1983-book-4-part-1-title-2-chapter-4',unitType:'chapter',number:'IV',title:'I padrini',canonicalLabel:'CAPITOLO IV — I PADRINI',parentCanonicalId:'cic-1983-book-4-part-1-title-2',order:4},
  {canonicalId:'cic-1983-book-4-part-1-title-2-chapter-5',unitType:'chapter',number:'V',title:'Prova e annotazione dell’avvenuta confermazione',canonicalLabel:'CAPITOLO V — PROVA E ANNOTAZIONE DELL’AVVENUTA CONFERMAZIONE',parentCanonicalId:'cic-1983-book-4-part-1-title-2',order:5},

  {canonicalId:'cic-1983-book-4-part-1-title-3',unitType:'title',number:'III',title:'La santissima Eucarestia',canonicalLabel:'TITOLO III — LA SANTISSIMA EUCARESTIA',parentCanonicalId:'cic-1983-book-4-part-1',order:3},
  {canonicalId:'cic-1983-book-4-part-1-title-3-chapter-1',unitType:'chapter',number:'I',title:'La celebrazione eucaristica',canonicalLabel:'CAPITOLO I — LA CELEBRAZIONE EUCARISTICA',parentCanonicalId:'cic-1983-book-4-part-1-title-3',order:1},
  {canonicalId:'cic-1983-book-4-part-1-title-3-chapter-1-article-1',unitType:'article',number:'1',title:'Il ministro della santissima Eucaristia',canonicalLabel:'Articolo 1 — Il ministro della santissima Eucaristia',parentCanonicalId:'cic-1983-book-4-part-1-title-3-chapter-1',order:1},
  {canonicalId:'cic-1983-book-4-part-1-title-3-chapter-1-article-2',unitType:'article',number:'2',title:'Partecipazione alla santissima Eucaristia',canonicalLabel:'Articolo 2 — Partecipazione alla santissima Eucaristia',parentCanonicalId:'cic-1983-book-4-part-1-title-3-chapter-1',order:2},
  {canonicalId:'cic-1983-book-4-part-1-title-3-chapter-1-article-3',unitType:'article',number:'3',title:'Riti e cerimonie della celebrazione eucaristica',canonicalLabel:'Articolo 3 — Riti e cerimonie della celebrazione eucaristica',parentCanonicalId:'cic-1983-book-4-part-1-title-3-chapter-1',order:3},
  {canonicalId:'cic-1983-book-4-part-1-title-3-chapter-1-article-4',unitType:'article',number:'4',title:'Tempo e luogo della celebrazione eucaristica',canonicalLabel:'Articolo 4 — Tempo e luogo della celebrazione eucaristica',parentCanonicalId:'cic-1983-book-4-part-1-title-3-chapter-1',order:4},
  {canonicalId:'cic-1983-book-4-part-1-title-3-chapter-2',unitType:'chapter',number:'II',title:'Conservazione e venerazione della santissima Eucaristia',canonicalLabel:'CAPITOLO II — CONSERVAZIONE E VENERAZIONE DELLA SANTISSIMA EUCARISTIA',parentCanonicalId:'cic-1983-book-4-part-1-title-3',order:2},
  {canonicalId:'cic-1983-book-4-part-1-title-3-chapter-3',unitType:'chapter',number:'III',title:'L’offerta data per la celebrazione della Messa',canonicalLabel:'CAPITOLO III — L’OFFERTA DATA PER LA CELEBRAZIONE DELLA MESSA',parentCanonicalId:'cic-1983-book-4-part-1-title-3',order:3},

  {canonicalId:'cic-1983-book-4-part-1-title-4',unitType:'title',number:'IV',title:'Il sacramento della penitenza',canonicalLabel:'TITOLO IV — IL SACRAMENTO DELLA PENITENZA',parentCanonicalId:'cic-1983-book-4-part-1',order:4},
  {canonicalId:'cic-1983-book-4-part-1-title-4-chapter-1',unitType:'chapter',number:'I',title:'La celebrazione del sacramento',canonicalLabel:'CAPITOLO I — LA CELEBRAZIONE DEL SACRAMENTO',parentCanonicalId:'cic-1983-book-4-part-1-title-4',order:1},
  {canonicalId:'cic-1983-book-4-part-1-title-4-chapter-2',unitType:'chapter',number:'II',title:'Il ministro del sacramento della penitenza',canonicalLabel:'CAPITOLO II — IL MINISTRO DEL SACRAMENTO DELLA PENITENZA',parentCanonicalId:'cic-1983-book-4-part-1-title-4',order:2},
  {canonicalId:'cic-1983-book-4-part-1-title-4-chapter-3',unitType:'chapter',number:'III',title:'Il penitente',canonicalLabel:'CAPITOLO III — IL PENITENTE',parentCanonicalId:'cic-1983-book-4-part-1-title-4',order:3},
  {canonicalId:'cic-1983-book-4-part-1-title-4-chapter-4',unitType:'chapter',number:'IV',title:'Le indulgenze',canonicalLabel:'CAPITOLO IV — LE INDULGENZE',parentCanonicalId:'cic-1983-book-4-part-1-title-4',order:4},

  {canonicalId:'cic-1983-book-4-part-1-title-5',unitType:'title',number:'V',title:'Il sacramento dell’unzione degli infermi',canonicalLabel:'TITOLO V — IL SACRAMENTO DELL’UNZIONE DEGLI INFERMI',parentCanonicalId:'cic-1983-book-4-part-1',order:5},
  {canonicalId:'cic-1983-book-4-part-1-title-5-chapter-1',unitType:'chapter',number:'I',title:'La celebrazione del sacramento',canonicalLabel:'CAPITOLO I — LA CELEBRAZIONE DEL SACRAMENTO',parentCanonicalId:'cic-1983-book-4-part-1-title-5',order:1},
  {canonicalId:'cic-1983-book-4-part-1-title-5-chapter-2',unitType:'chapter',number:'II',title:'Il ministro dell’unzione degli infermi',canonicalLabel:'CAPITOLO II — IL MINISTRO DELL’UNZIONE DEGLI INFERMI',parentCanonicalId:'cic-1983-book-4-part-1-title-5',order:2},
  {canonicalId:'cic-1983-book-4-part-1-title-5-chapter-3',unitType:'chapter',number:'III',title:'A chi va conferita l’unzione degli infermi',canonicalLabel:'CAPITOLO III — A CHI VA CONFERITA L’UNZIONE DEGLI INFERMI',parentCanonicalId:'cic-1983-book-4-part-1-title-5',order:3},

  {canonicalId:'cic-1983-book-4-part-1-title-6',unitType:'title',number:'VI',title:'Ordine',canonicalLabel:'TITOLO VI — ORDINE',parentCanonicalId:'cic-1983-book-4-part-1',order:6},
  {canonicalId:'cic-1983-book-4-part-1-title-6-chapter-1',unitType:'chapter',number:'I',title:'Celebrazione e ministro dell’ordinazione',canonicalLabel:'CAPITOLO I — CELEBRAZIONE E MINISTRO DELL’ORDINAZIONE',parentCanonicalId:'cic-1983-book-4-part-1-title-6',order:1},
  {canonicalId:'cic-1983-book-4-part-1-title-6-chapter-2',unitType:'chapter',number:'II',title:'Gli ordinandi',canonicalLabel:'CAPITOLO II — GLI ORDINANDI',parentCanonicalId:'cic-1983-book-4-part-1-title-6',order:2},
  {canonicalId:'cic-1983-book-4-part-1-title-6-chapter-2-article-1',unitType:'article',number:'1',title:'Requisiti negli ordinandi',canonicalLabel:'Articolo 1 — Requisiti negli ordinandi',parentCanonicalId:'cic-1983-book-4-part-1-title-6-chapter-2',order:1},
  {canonicalId:'cic-1983-book-4-part-1-title-6-chapter-2-article-2',unitType:'article',number:'2',title:'Requisiti previi all’ordinazione',canonicalLabel:'Articolo 2 — Requisiti previi all’ordinazione',parentCanonicalId:'cic-1983-book-4-part-1-title-6-chapter-2',order:2},
  {canonicalId:'cic-1983-book-4-part-1-title-6-chapter-2-article-3',unitType:'article',number:'3',title:'Irregolarità e altri impedimenti',canonicalLabel:'Articolo 3 — Irregolarità e altri impedimenti',parentCanonicalId:'cic-1983-book-4-part-1-title-6-chapter-2',order:3},
  {canonicalId:'cic-1983-book-4-part-1-title-6-chapter-2-article-4',unitType:'article',number:'4',title:'Documenti richiesti e scrutinio',canonicalLabel:'Articolo 4 — Documenti richiesti e scrutinio',parentCanonicalId:'cic-1983-book-4-part-1-title-6-chapter-2',order:4},
  {canonicalId:'cic-1983-book-4-part-1-title-6-chapter-3',unitType:'chapter',number:'III',title:'Annotazione e certificato dell’avvenuta ordinazione',canonicalLabel:'CAPITOLO III — ANNOTAZIONE E CERTIFICATO DELL’AVVENUTA ORDINAZIONE',parentCanonicalId:'cic-1983-book-4-part-1-title-6',order:3},

  {canonicalId:'cic-1983-book-4-part-1-title-7',unitType:'title',number:'VII',title:'Il matrimonio',canonicalLabel:'TITOLO VII — IL MATRIMONIO',parentCanonicalId:'cic-1983-book-4-part-1',order:7},
  {canonicalId:'cic-1983-book-4-part-1-title-7-chapter-1',unitType:'chapter',number:'I',title:'La cura pastorale e gli atti da premettere alla celebrazione del matrimonio',canonicalLabel:'CAPITOLO I — LA CURA PASTORALE E GLI ATTI DA PREMETTERE ALLA CELEBRAZIONE DEL MATRIMONIO',parentCanonicalId:'cic-1983-book-4-part-1-title-7',order:1},
  {canonicalId:'cic-1983-book-4-part-1-title-7-chapter-2',unitType:'chapter',number:'II',title:'Gli impedimenti dirimenti in genere',canonicalLabel:'CAPITOLO II — GLI IMPEDIMENTI DIRIMENTI IN GENERE',parentCanonicalId:'cic-1983-book-4-part-1-title-7',order:2},
  {canonicalId:'cic-1983-book-4-part-1-title-7-chapter-3',unitType:'chapter',number:'III',title:'Gli impedimenti dirimenti in specie',canonicalLabel:'CAPITOLO III — GLI IMPEDIMENTI DIRIMENTI IN SPECIE',parentCanonicalId:'cic-1983-book-4-part-1-title-7',order:3},
  {canonicalId:'cic-1983-book-4-part-1-title-7-chapter-4',unitType:'chapter',number:'IV',title:'Il consenso matrimoniale',canonicalLabel:'CAPITOLO IV — IL CONSENSO MATRIMONIALE',parentCanonicalId:'cic-1983-book-4-part-1-title-7',order:4},
  {canonicalId:'cic-1983-book-4-part-1-title-7-chapter-5',unitType:'chapter',number:'V',title:'La forma della celebrazione del matrimonio',canonicalLabel:'CAPITOLO V — LA FORMA DELLA CELEBRAZIONE DEL MATRIMONIO',parentCanonicalId:'cic-1983-book-4-part-1-title-7',order:5},
  {canonicalId:'cic-1983-book-4-part-1-title-7-chapter-6',unitType:'chapter',number:'VI',title:'I matrimoni misti',canonicalLabel:'CAPITOLO VI — I MATRIMONI MISTI',parentCanonicalId:'cic-1983-book-4-part-1-title-7',order:6},
  {canonicalId:'cic-1983-book-4-part-1-title-7-chapter-7',unitType:'chapter',number:'VII',title:'La celebrazione segreta del matrimonio',canonicalLabel:'CAPITOLO VII — LA CELEBRAZIONE SEGRETA DEL MATRIMONIO',parentCanonicalId:'cic-1983-book-4-part-1-title-7',order:7},
  {canonicalId:'cic-1983-book-4-part-1-title-7-chapter-8',unitType:'chapter',number:'VIII',title:'Effetti del matrimonio',canonicalLabel:'CAPITOLO VIII — EFFETTI DEL MATRIMONIO',parentCanonicalId:'cic-1983-book-4-part-1-title-7',order:8},
  {canonicalId:'cic-1983-book-4-part-1-title-7-chapter-9',unitType:'chapter',number:'IX',title:'La separazione dei coniugi',canonicalLabel:'CAPITOLO IX — LA SEPARAZIONE DEI CONIUGI',parentCanonicalId:'cic-1983-book-4-part-1-title-7',order:9},
  {canonicalId:'cic-1983-book-4-part-1-title-7-chapter-9-article-1',unitType:'article',number:'1',title:'Lo scioglimento del vincolo',canonicalLabel:'Articolo 1 — Lo scioglimento del vincolo',parentCanonicalId:'cic-1983-book-4-part-1-title-7-chapter-9',order:1},
  {canonicalId:'cic-1983-book-4-part-1-title-7-chapter-9-article-2',unitType:'article',number:'2',title:'La separazione con permanenza del vincolo',canonicalLabel:'Articolo 2 — La separazione con permanenza del vincolo',parentCanonicalId:'cic-1983-book-4-part-1-title-7-chapter-9',order:2},
  {canonicalId:'cic-1983-book-4-part-1-title-7-chapter-10',unitType:'chapter',number:'X',title:'Convalidazione del matrimonio',canonicalLabel:'CAPITOLO X — CONVALIDAZIONE DEL MATRIMONIO',parentCanonicalId:'cic-1983-book-4-part-1-title-7',order:10},
  {canonicalId:'cic-1983-book-4-part-1-title-7-chapter-10-article-1',unitType:'article',number:'1',title:'La convalidazione semplice',canonicalLabel:'Articolo 1 — La convalidazione semplice',parentCanonicalId:'cic-1983-book-4-part-1-title-7-chapter-10',order:1},
  {canonicalId:'cic-1983-book-4-part-1-title-7-chapter-10-article-2',unitType:'article',number:'2',title:'La sanazione in radice',canonicalLabel:'Articolo 2 — La sanazione in radice',parentCanonicalId:'cic-1983-book-4-part-1-title-7-chapter-10',order:2},

  {canonicalId:'cic-1983-book-4-part-2',unitType:'part',number:'II',title:'Gli altri atti del culto divino',canonicalLabel:'PARTE II — GLI ALTRI ATTI DEL CULTO DIVINO',parentCanonicalId:'cic-1983-book-4',order:2},
  {canonicalId:'cic-1983-book-4-part-2-title-1',unitType:'title',number:'I',title:'I sacramentali',canonicalLabel:'TITOLO I — I SACRAMENTALI',parentCanonicalId:'cic-1983-book-4-part-2',order:1},
  {canonicalId:'cic-1983-book-4-part-2-title-2',unitType:'title',number:'II',title:'La liturgia delle ore',canonicalLabel:'TITOLO II — LA LITURGIA DELLE ORE',parentCanonicalId:'cic-1983-book-4-part-2',order:2},
  {canonicalId:'cic-1983-book-4-part-2-title-3',unitType:'title',number:'III',title:'Le esequie ecclesiastiche',canonicalLabel:'TITOLO III — LE ESEQUIE ECCLESIASTICHE',parentCanonicalId:'cic-1983-book-4-part-2',order:3},
  {canonicalId:'cic-1983-book-4-part-2-title-3-chapter-1',unitType:'chapter',number:'I',title:'La celebrazione delle esequie',canonicalLabel:'CAPITOLO I — LA CELEBRAZIONE DELLE ESEQUIE',parentCanonicalId:'cic-1983-book-4-part-2-title-3',order:1},
  {canonicalId:'cic-1983-book-4-part-2-title-3-chapter-2',unitType:'chapter',number:'II',title:'A chi si devono concedere o negare le esequie ecclesiastiche',canonicalLabel:'CAPITOLO II — A CHI SI DEVONO CONCEDERE O NEGARE LE ESEQUIE ECCLESIASTICHE',parentCanonicalId:'cic-1983-book-4-part-2-title-3',order:2},
  {canonicalId:'cic-1983-book-4-part-2-title-4',unitType:'title',number:'IV',title:'Il culto dei santi, delle sacre immagini e delle reliquie',canonicalLabel:'TITOLO IV — IL CULTO DEI SANTI, DELLE SACRE IMMAGINI E DELLE RELIQUIE',parentCanonicalId:'cic-1983-book-4-part-2',order:4},
  {canonicalId:'cic-1983-book-4-part-2-title-5',unitType:'title',number:'V',title:'Il voto e il giuramento',canonicalLabel:'TITOLO V — IL VOTO E IL GIURAMENTO',parentCanonicalId:'cic-1983-book-4-part-2',order:5},
  {canonicalId:'cic-1983-book-4-part-2-title-5-chapter-1',unitType:'chapter',number:'I',title:'Il voto',canonicalLabel:'CAPITOLO I — IL VOTO',parentCanonicalId:'cic-1983-book-4-part-2-title-5',order:1},
  {canonicalId:'cic-1983-book-4-part-2-title-5-chapter-2',unitType:'chapter',number:'II',title:'Il giuramento',canonicalLabel:'CAPITOLO II — IL GIURAMENTO',parentCanonicalId:'cic-1983-book-4-part-2-title-5',order:2},

  {canonicalId:'cic-1983-book-4-part-3',unitType:'part',number:'III',title:'I luoghi e i tempi sacri',canonicalLabel:'PARTE III — I LUOGHI E I TEMPI SACRI',parentCanonicalId:'cic-1983-book-4',order:3},
  {canonicalId:'cic-1983-book-4-part-3-title-1',unitType:'title',number:'I',title:'I luoghi sacri',canonicalLabel:'TITOLO I — I LUOGHI SACRI',parentCanonicalId:'cic-1983-book-4-part-3',order:1},
  {canonicalId:'cic-1983-book-4-part-3-title-1-chapter-1',unitType:'chapter',number:'I',title:'Le chiese',canonicalLabel:'CAPITOLO I — LE CHIESE',parentCanonicalId:'cic-1983-book-4-part-3-title-1',order:1},
  {canonicalId:'cic-1983-book-4-part-3-title-1-chapter-2',unitType:'chapter',number:'II',title:'Gli oratori e le cappelle private',canonicalLabel:'CAPITOLO II — GLI ORATORI E LE CAPPELLE PRIVATE',parentCanonicalId:'cic-1983-book-4-part-3-title-1',order:2},
  {canonicalId:'cic-1983-book-4-part-3-title-1-chapter-3',unitType:'chapter',number:'III',title:'I santuari',canonicalLabel:'CAPITOLO III — I SANTUARI',parentCanonicalId:'cic-1983-book-4-part-3-title-1',order:3},
  {canonicalId:'cic-1983-book-4-part-3-title-1-chapter-4',unitType:'chapter',number:'IV',title:'Gli altari',canonicalLabel:'CAPITOLO IV — GLI ALTARI',parentCanonicalId:'cic-1983-book-4-part-3-title-1',order:4},
  {canonicalId:'cic-1983-book-4-part-3-title-1-chapter-5',unitType:'chapter',number:'V',title:'I cimiteri',canonicalLabel:'CAPITOLO V — I CIMITERI',parentCanonicalId:'cic-1983-book-4-part-3-title-1',order:5},
  {canonicalId:'cic-1983-book-4-part-3-title-2',unitType:'title',number:'II',title:'I tempi sacri',canonicalLabel:'TITOLO II — I TEMPI SACRI',parentCanonicalId:'cic-1983-book-4-part-3',order:2},
  {canonicalId:'cic-1983-book-4-part-3-title-2-chapter-1',unitType:'chapter',number:'I',title:'I giorni di festa',canonicalLabel:'CAPITOLO I — I GIORNI DI FESTA',parentCanonicalId:'cic-1983-book-4-part-3-title-2',order:1},
  {canonicalId:'cic-1983-book-4-part-3-title-2-chapter-2',unitType:'chapter',number:'II',title:'I giorni di penitenza',canonicalLabel:'CAPITOLO II — I GIORNI DI PENITENZA',parentCanonicalId:'cic-1983-book-4-part-3-title-2',order:2},
]

function deterministicId(value: string) {
  return value.replace(/[^A-Za-z0-9_.-]/g, '-')
}

async function getSingle(canonicalId: string) {
  const docs = await client.fetch(
    `*[_type == "structuralUnit" && canonicalId == $canonicalId]{_id, canonicalId}`,
    {canonicalId},
  )
  if (docs.length > 1) throw new Error(`${canonicalId}: trovate ${docs.length} unità strutturali.`)
  return docs[0] ?? null
}

async function main() {
  const corpus = await client.fetch(
    `*[_type == "corpus" && code == $code][0]{_id, title}`,
    {code: CORPUS_CODE},
  )
  if (!corpus) throw new Error(`Corpus ${CORPUS_CODE} non trovato.`)

  const resolved = new Map<string, string>()
  console.log(`\nSTRUTTURA LIBRO IV — ${units.length} unità`)

  for (const unit of units) {
    let parentId: string | undefined
    if (unit.parentCanonicalId) {
      parentId = resolved.get(unit.parentCanonicalId)
      if (!parentId) parentId = (await getSingle(unit.parentCanonicalId))?._id
      if (!parentId) throw new Error(`${unit.canonicalId}: parent non trovato: ${unit.parentCanonicalId}`)
    }

    const existing = await getSingle(unit.canonicalId)
    const documentId = existing?._id ?? deterministicId(`structural-${unit.canonicalId}`)
    const fields = {
      corpus: {_type: 'reference', _ref: corpus._id},
      unitType: unit.unitType,
      ...(unit.number ? {number: unit.number} : {}),
      title: unit.title,
      canonicalId: unit.canonicalId,
      slug: {_type: 'slug', current: unit.canonicalId},
      ...(parentId ? {parent: {_type: 'reference', _ref: parentId}} : {}),
      order: unit.order,
      canonicalLabel: unit.canonicalLabel,
    }

    let transaction = client.transaction()
    if (!existing) {
      transaction = transaction.createIfNotExists({_id: documentId, _type: 'structuralUnit', ...fields})
    }
    transaction = transaction.patch(documentId, {set: fields})
    await transaction.commit({autoGenerateArrayKeys: true})
    resolved.set(unit.canonicalId, documentId)
    console.log(`${existing ? 'UPDATE' : 'CREATE'} — ${unit.canonicalLabel}`)
  }

  console.log('\nSTRUTTURA LIBRO IV COMPLETATA')
}

main().catch((error) => {
  console.error('\nSTRUTTURA LIBRO IV FALLITA')
  console.error(error)
  process.exit(1)
})
