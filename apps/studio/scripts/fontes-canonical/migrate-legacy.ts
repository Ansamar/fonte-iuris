import {createClient} from '@sanity/client'

const client = createClient({
  projectId: '2rq93txn',
  dataset: 'production',
  apiVersion: '2026-03-25',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN,
})

const CIC_SOURCE_ID = 'a45cf4b1-e16b-49db-857f-0b19c1f69663'
const PASCITE_ID = 'source-pascite-gregem-dei-2021'
const LEGACY_RELATION_ID = 'cbf1f4e9-80df-408f-958b-230bcc24b6a0'

async function main() {
  console.log('\nMIGRAZIONE FONTES LEGACY — PRODUCTION')

  if (!process.env.SANITY_AUTH_TOKEN) {
    throw new Error('SANITY_AUTH_TOKEN non disponibile: nessuna scrittura eseguita.')
  }

  const [cic, pascite, relation] = await Promise.all([
    client.fetch('*[_id == $id][0]', {id: CIC_SOURCE_ID}),
    client.fetch('*[_id == $id][0]', {id: PASCITE_ID}),
    client.fetch('*[_id == $id][0]', {id: LEGACY_RELATION_ID}),
  ])
  if (!cic || !pascite || !relation) throw new Error('Documenti legacy attesi non trovati.')

  const sourceCanonId = relation.source?._ref ?? relation.sourceCanon?._ref
  const targetCanonId = relation.target?._ref ?? relation.targetCanon?._ref
  if (!sourceCanonId || !targetCanonId) throw new Error('Endpoint della relazione non risolvibili.')

  const canons = await client.fetch('*[_id in $ids]{_id,number,canonicalId}', {ids: [sourceCanonId, targetCanonId]})
  const byId = new Map(canons.map((canon: any) => [canon._id, canon]))
  const sourceCanon = byId.get(sourceCanonId) as any
  const targetCanon = byId.get(targetCanonId) as any
  if (sourceCanon?.number !== 368 || targetCanon?.number !== 369) {
    throw new Error(`Relazione inattesa: Can. ${sourceCanon?.number ?? '?'} → Can. ${targetCanon?.number ?? '?'}`)
  }
  if (sourceCanon.canonicalId !== 'cic-1983-can-368' || targetCanon.canonicalId !== 'cic-1983-can-369') {
    throw new Error('canonicalId dei cann. 368/369 non coerenti.')
  }

  const identifiers = {
    cic: 'cic-1983',
    pascite: 'francis-2021-pascite-gregem-dei',
    relation: 'cic-1983-can-368-concordance-can-369',
  }
  const duplicates = await Promise.all([
    client.fetch('count(*[_type == "sourceDocument" && documentId == $value && _id != $id])', {value: identifiers.cic, id: CIC_SOURCE_ID}),
    client.fetch('count(*[_type == "sourceDocument" && documentId == $value && _id != $id])', {value: identifiers.pascite, id: PASCITE_ID}),
    client.fetch('count(*[_type == "legalRelation" && relationId == $value && _id != $id])', {value: identifiers.relation, id: LEGACY_RELATION_ID}),
  ])
  if (duplicates.some((count) => count > 0)) throw new Error('Conflitto sugli identificatori deterministici: nessuna scrittura eseguita.')

  console.log('✔ Preflight interno superato')
  console.log('✔ Can. 368 → Can. 369 verificati')

  const tx = client.transaction()
    .patch(CIC_SOURCE_ID, (patch) => patch.set({
      documentId: identifiers.cic,
      officialUrl: 'https://www.vatican.va/archive/cod-iuris-canonici/cic_index_lt.html',
      territorialScope: 'universal',
      status: 'inForce',
    }))
    .patch(PASCITE_ID, (patch) => patch.set({
      documentId: identifiers.pascite,
      territorialScope: 'universal',
      status: 'inForce',
    }))
    .patch(LEGACY_RELATION_ID, (patch) => patch
      .set({
        relationId: identifiers.relation,
        source: {_type: 'reference', _ref: sourceCanonId},
        target: {_type: 'reference', _ref: targetCanonId},
      })
      .unset(['sourceCanon', 'sourceSegment', 'targetCanon', 'targetSegment']))

  await tx.commit({visibility: 'sync'})
  console.log('✔ Transazione completata')

  const readBack = await client.fetch(
    '*[_id in $ids]{_id,_type,documentId,officialUrl,territorialScope,status,relationId,source,target,sourceCanon,targetCanon}',
    {ids: [CIC_SOURCE_ID, PASCITE_ID, LEGACY_RELATION_ID]},
  )

  const rb = new Map(readBack.map((doc: any) => [doc._id, doc]))
  const cicRb: any = rb.get(CIC_SOURCE_ID)
  const pasciteRb: any = rb.get(PASCITE_ID)
  const relationRb: any = rb.get(LEGACY_RELATION_ID)

  const errors: string[] = []
  if (cicRb?.documentId !== identifiers.cic || cicRb?.territorialScope !== 'universal' || cicRb?.status !== 'inForce' || !cicRb?.officialUrl) errors.push('CIC 1983 read-back non conforme')
  if (pasciteRb?.documentId !== identifiers.pascite || pasciteRb?.territorialScope !== 'universal' || pasciteRb?.status !== 'inForce') errors.push('Pascite gregem Dei read-back non conforme')
  if (relationRb?.relationId !== identifiers.relation || relationRb?.source?._ref !== sourceCanonId || relationRb?.target?._ref !== targetCanonId || relationRb?.sourceCanon || relationRb?.targetCanon) errors.push('legalRelation read-back non conforme')

  if (errors.length) {
    console.error('\n✖ READ-BACK FALLITO')
    for (const error of errors) console.error(`- ${error}`)
    process.exit(1)
  }

  console.log('✔ READ-BACK SUPERATO — 3/3 documenti conformi')
  console.log('✔ MIGRAZIONE FONTES LEGACY COMPLETATA')
}

main().catch((error) => {
  console.error('\n✖ MIGRAZIONE FALLITA')
  console.error(error)
  process.exit(1)
})
