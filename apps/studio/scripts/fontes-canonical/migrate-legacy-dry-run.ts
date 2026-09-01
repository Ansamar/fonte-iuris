import {createClient} from '@sanity/client'

const client = createClient({
  projectId: '2rq93txn',
  dataset: 'production',
  apiVersion: '2026-03-25',
  useCdn: false,
})

const CIC_SOURCE_ID = 'a45cf4b1-e16b-49db-857f-0b19c1f69663'
const PASCITE_ID = 'source-pascite-gregem-dei-2021'
const LEGACY_RELATION_ID = 'cbf1f4e9-80df-408f-958b-230bcc24b6a0'

function clean<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T
}

async function main() {
  console.log('\nMIGRAZIONE FONTES LEGACY — DRY RUN — NESSUNA SCRITTURA')

  const [cic, pascite, relation] = await Promise.all([
    client.fetch('*[_id == $id][0]', {id: CIC_SOURCE_ID}),
    client.fetch('*[_id == $id][0]', {id: PASCITE_ID}),
    client.fetch('*[_id == $id][0]', {id: LEGACY_RELATION_ID}),
  ])

  if (!cic || !pascite || !relation) {
    throw new Error('Uno o più documenti legacy attesi non sono presenti in production.')
  }

  const sourceCanonId = relation.sourceCanon?._ref
  const targetCanonId = relation.targetCanon?._ref
  if (!sourceCanonId || !targetCanonId) {
    throw new Error('La legalRelation legacy non contiene sourceCanon/targetCanon risolvibili.')
  }

  const canons = await client.fetch(
    '*[_id in $ids]{_id,_type,number,canonicalId}',
    {ids: [sourceCanonId, targetCanonId]},
  )
  const byId = new Map(canons.map((canon: any) => [canon._id, canon]))
  const sourceCanon = byId.get(sourceCanonId) as any
  const targetCanon = byId.get(targetCanonId) as any

  if (!sourceCanon || !targetCanon) throw new Error('Riferimenti canonici legacy non risolvibili.')
  if (sourceCanon.number !== 368 || targetCanon.number !== 369) {
    throw new Error(`Relazione inattesa: Can. ${sourceCanon.number ?? '?'} → Can. ${targetCanon.number ?? '?'}`)
  }
  if (sourceCanon.canonicalId !== 'cic-1983-can-368' || targetCanon.canonicalId !== 'cic-1983-can-369') {
    throw new Error('canonicalId dei cann. 368/369 non coerenti con il modello CIC.')
  }

  const cicAfter = clean({
    ...cic,
    documentId: 'cic-1983',
    officialUrl: 'https://www.vatican.va/archive/cod-iuris-canonici/cic_index_lt.html',
    territorialScope: 'universal',
    status: 'inForce',
  })

  const pasciteAfter = clean({
    ...pascite,
    documentId: 'francis-2021-pascite-gregem-dei',
    territorialScope: 'universal',
    status: 'inForce',
  })

  const relationAfter = clean({
    ...relation,
    relationId: 'cic-1983-can-368-concordance-can-369',
    source: {_type: 'reference', _ref: sourceCanonId},
    target: {_type: 'reference', _ref: targetCanonId},
    sourceCanon: undefined,
    sourceSegment: undefined,
    targetCanon: undefined,
    targetSegment: undefined,
  })

  const duplicateChecks = await Promise.all([
    client.fetch('count(*[_type == "sourceDocument" && documentId == $id && _id != $exclude])', {id: cicAfter.documentId, exclude: CIC_SOURCE_ID}),
    client.fetch('count(*[_type == "sourceDocument" && documentId == $id && _id != $exclude])', {id: pasciteAfter.documentId, exclude: PASCITE_ID}),
    client.fetch('count(*[_type == "legalRelation" && relationId == $id && _id != $exclude])', {id: relationAfter.relationId, exclude: LEGACY_RELATION_ID}),
  ])
  if (duplicateChecks.some((count) => count > 0)) throw new Error('Conflitto: uno degli identificatori deterministici proposti è già usato.')

  console.log('\n✔ Riferimenti verificati: Can. 368 → Can. 369')
  console.log('✔ Nessun conflitto sugli identificatori proposti')

  for (const item of [
    {label: 'sourceDocument CIC 1983', before: cic, after: cicAfter},
    {label: 'sourceDocument Pascite gregem Dei', before: pascite, after: pasciteAfter},
    {label: 'legalRelation Can. 368 → Can. 369', before: relation, after: relationAfter},
  ]) {
    console.log(`\n=== ${item.label} ===`)
    console.log('PRIMA')
    console.log(JSON.stringify(item.before, null, 2))
    console.log('DOPO')
    console.log(JSON.stringify(item.after, null, 2))
  }

  console.log('\n✔ DRY RUN COMPLETATO')
  console.log('0 scritture eseguite su production.')
}

main().catch((error) => {
  console.error('\n✖ DRY RUN FALLITO')
  console.error(error)
  process.exit(1)
})
