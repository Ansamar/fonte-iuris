import type {StructureBuilder, StructureResolver} from 'sanity/structure'

const canonsForUnit = (S: StructureBuilder, unitId: string) =>
  S.documentList()
    .title('Canoni')
    .filter('_type == "canon" && structuralUnit._ref == $unitId')
    .params({unitId})
    .defaultOrdering([{field: 'number', direction: 'asc'}])

const unitPane = (S: StructureBuilder, unitId: string) =>
  S.list()
    .title('Unità strutturale')
    .items([
      S.document().schemaType('structuralUnit').documentId(unitId).title('Scheda unità'),
      S.listItem().title('Sottounità').child(
        S.documentList().title('Sottounità').filter('_type == "structuralUnit" && parent._ref == $unitId').params({unitId}).defaultOrdering([{field: 'order', direction: 'asc'}]).child((childId) => unitPane(S, childId)),
      ),
      S.listItem().title('Canoni').child(canonsForUnit(S, unitId)),
    ])

export const structure: StructureResolver = (S) =>
  S.list().title('Fonte Iuris').items([
    S.listItem().title('CIC 1983').child(
      S.list().title('CIC 1983').items([
        S.documentTypeListItem('corpus').title('Corpus normativo'),
        S.listItem().title('Struttura del Codice').child(
          S.documentList().title('Libri').filter('_type == "structuralUnit" && unitType == "book"').defaultOrdering([{field: 'order', direction: 'asc'}]).child((bookId) => unitPane(S, bookId)),
        ),
        S.listItem().title('Canoni per struttura').child(
          S.documentList().title('Libri').filter('_type == "structuralUnit" && unitType == "book"').defaultOrdering([{field: 'order', direction: 'asc'}]).child((bookId) => unitPane(S, bookId)),
        ),
        S.documentTypeListItem('canon').title('Tutti i canoni'),
        S.documentTypeListItem('canonVersion').title('Versioni del canone'),
        S.documentTypeListItem('canonSegment').title('Segmenti del canone'),
      ]),
    ),
    S.divider(),
    S.listItem().title('Studio').child(
      S.list().title('Studio').items([
        S.documentTypeListItem('annotation').title('Sintesi e approfondimenti'),
        S.documentTypeListItem('legalRelation').title('Relazioni giuridiche'),
        S.documentTypeListItem('legalConcept').title('Concetti giuridici'),
        S.documentTypeListItem('bibliographicItem').title('Bibliografia'),
      ]),
    ),
    S.divider(),
    S.listItem().title('Corpora documentari').child(
      S.list().title('Corpora documentari').items([
        S.documentTypeListItem('sourceDocument').title('Fonti documentali'),
        S.documentTypeListItem('italianProvision').title('Disposizioni italiane'),
        S.documentTypeListItem('pastoralDocument').title('Documenti pastorali'),
        S.documentTypeListItem('jurisprudentialDecision').title('Giurisprudenza e prassi'),
      ]),
    ),
  ])