import {createClient} from '@sanity/client'

const client = createClient({
  projectId: '2rq93txn',
  dataset: 'production',
  apiVersion: '2026-03-25',
  useCdn: false,
})

type Doc = Record<string, unknown> & {_id: string; _type: string}

async function main() {
  console.log('\nPREFLIGHT FONTES — PRODUCTION — SOLA LETTURA')

  const types = ['sourceDocument', 'legalRelation', 'italianProvision']
  const counts: Record<string, number> = {}

  for (const type of types) {
    counts[type] = await client.fetch('count(*[_type == $type])', {type})
    console.log(`${type}: ${counts[type]}`)
  }

  const docs: Doc[] = await client.fetch(
    `*[_type in $types]{
      _id, _type,
      documentId, title, documentType, issuer, issuedAt, officialUrl,
      language, territorialScope, status,
      relationId, relationType, authorityLevel, source, target,
      sourceCanon, sourceSegment, targetCanon, targetSegment,
      provisionId, provisionType, legalForce, sourceDocument,
      legalVerification
    } | order(_type asc, _id asc)`,
    {types},
  )

  let risks = 0

  for (const doc of docs) {
    const missing: string[] = []
    const legacy: string[] = []

    if (doc._type === 'sourceDocument') {
      for (const field of ['documentId', 'title', 'documentType', 'issuer', 'officialUrl', 'language', 'territorialScope', 'status']) {
        if (!doc[field]) missing.push(field)
      }
    }

    if (doc._type === 'legalRelation') {
      for (const field of ['relationId', 'source', 'target', 'relationType', 'authorityLevel']) {
        if (!doc[field]) missing.push(field)
      }
      for (const field of ['sourceCanon', 'sourceSegment', 'targetCanon', 'targetSegment']) {
        if (doc[field]) legacy.push(field)
      }
    }

    if (doc._type === 'italianProvision') {
      for (const field of ['provisionId', 'title', 'provisionType', 'issuer', 'territorialScope', 'legalForce', 'status', 'sourceDocument', 'legalVerification']) {
        if (!doc[field]) missing.push(field)
      }
    }

    if (missing.length || legacy.length) {
      risks++
      console.log(`\n⚠ ${doc._type} ${doc._id}`)
      if (missing.length) console.log(`  campi richiesti mancanti: ${missing.join(', ')}`)
      if (legacy.length) console.log(`  campi legacy presenti: ${legacy.join(', ')}`)
    }
  }

  const deConcordia = await client.fetch(
    `*[
      (_type == 'sourceDocument' && documentId == $id) ||
      (_type == 'legalRelation' && relationId match $prefix) ||
      (_type == 'italianProvision' && provisionId match $prefix)
    ]{_id,_type,documentId,relationId,provisionId}`,
    {id: 'francis-2016-de-concordia-inter-codices', prefix: '*de-concordia*'},
  )

  console.log(`\nDocumenti De concordia già presenti: ${deConcordia.length}`)
  for (const doc of deConcordia) console.log(`  ${doc._type} ${doc._id}`)

  console.log(`\nDocumenti esaminati: ${docs.length}`)
  console.log(`Rischi di compatibilità: ${risks}`)

  if (risks === 0) {
    console.log('\n✔ PREFLIGHT FONTES SUPERATO')
  } else {
    console.log('\n⚠ PREFLIGHT FONTES: MIGRAZIONE/COMPATIBILITÀ DA RISOLVERE PRIMA DI SCRIVERE')
  }

  console.log('Nessuna scrittura eseguita.')
}

main().catch((error) => {
  console.error('\nERRORE TECNICO')
  console.error(error)
  process.exit(1)
})
