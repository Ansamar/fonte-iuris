import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-03-25'})

const DOCUMENT_ID = 'source-pascite-gregem-dei-2021'

const document = {
  _id: DOCUMENT_ID,
  _type: 'sourceDocument',
  title: 'Costituzione Apostolica Pascite gregem Dei',
  documentType: 'apostolicConstitution',
  issuer: 'Francesco',
  promulgatedAt: '2021-05-23',
  effectiveFrom: '2021-12-08',
  officialCitation: 'Francesco, Costituzione Apostolica Pascite gregem Dei, 23 maggio 2021',
  officialUrl:
    'https://www.vatican.va/content/francesco/it/apost_constitutions/documents/papa-francesco_costituzione-ap_20210523_pascite-gregem-dei.html',
  language: 'it',
  notes:
    'Promulga il testo riformato del Libro VI del Codice di Diritto Canonico. Il nuovo Libro VI entra in vigore l’8 dicembre 2021 e da tale data è abrogato il previgente Libro VI del CIC 1983.',
}

async function main() {
  const duplicates = await client.fetch(
    `*[_type == "sourceDocument" && title == $title]{_id, title}`,
    {title: document.title},
  )

  const conflicting = duplicates.filter((item: {_id: string}) => item._id !== DOCUMENT_ID)
  if (conflicting.length > 0) {
    throw new Error(
      `Esiste già una Fonte normativa con titolo "${document.title}" e ID diverso: ${conflicting
        .map((item: {_id: string}) => item._id)
        .join(', ')}`,
    )
  }

  const existing = await client.fetch(`*[_id == $id][0]{_id}`, {id: DOCUMENT_ID})
  const action = existing ? 'UPDATE' : 'CREATE'

  const result = await client
    .transaction()
    .createIfNotExists(document)
    .patch(DOCUMENT_ID, {set: document})
    .commit({autoGenerateArrayKeys: true})

  console.log(`${action} SOURCE — ${document.title}`)
  console.log(`COMMIT OK — transactionId: ${result.transactionId}`)
  console.log('PASCITE_SOURCE_OK 1/1')
}

main().catch((error) => {
  console.error('\nSETUP FONTE FALLITO\n')
  console.error(error)
  process.exit(1)
})
