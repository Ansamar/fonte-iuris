import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-03-25'})

const ranges: Record<string, [number, number]> = {
  'legal-concept-funzione-insegnare': [747, 833],
  'legal-concept-ministero-parola': [756, 780],
  'legal-concept-predicazione': [762, 772],
  'legal-concept-catechesi': [773, 780],
  'legal-concept-azione-missionaria': [781, 792],
  'legal-concept-educazione-cattolica': [793, 821],
  'legal-concept-scuole-cattoliche': [796, 806],
  'legal-concept-universita-cattoliche': [807, 814],
  'legal-concept-universita-facolta-ecclesiastiche': [815, 821],
  'legal-concept-comunicazione-libri': [822, 832],
  'legal-concept-professione-fede': [833, 833],
}

const ids = Object.keys(ranges)

const concepts = await client.fetch<
  Array<{_id: string; label?: string}>
>(`*[_type=="legalConcept" && _id in $ids]{_id,label}`, {ids})

if (concepts.length !== ids.length) {
  const found = new Set(concepts.map((x) => x._id))
  const missing = ids.filter((id) => !found.has(id))
  throw new Error(`Materie mancanti: ${missing.join(', ')}`)
}

const tx = client.transaction()

for (const concept of concepts) {
  const [from, to] = ranges[concept._id]

  const canons = await client.fetch<Array<{_id: string; number: number}>>(
    `*[_type=="canon" && number >= $from && number <= $to] | order(number asc){_id,number}`,
    {from, to},
  )

  const expected = to - from + 1

  if (canons.length !== expected) {
    throw new Error(
      `${concept.label ?? concept._id}: attesi ${expected} canoni (${from}-${to}), trovati ${canons.length}`,
    )
  }

  tx.patch(concept._id, {
    set: {
      relatedCanons: canons.map((canon) => ({
        _type: 'reference',
        _ref: canon._id,
        _key: `can-${canon.number}`,
      })),
    },
  })

  console.log(
    `✔ ${concept.label ?? concept._id}: ${canons.length} canoni (${from}-${to})`,
  )
}

const result = await tx.commit()

console.log(`PATCH OK · transaction ${result.transactionId}`)

const readBack = await client.fetch<
  Array<{_id: string; label?: string; count: number}>
>(
  `*[_type=="legalConcept" && _id in $ids]{
    _id,
    label,
    "count": count(relatedCanons)
  }`,
  {ids},
)

for (const item of readBack) {
  const [from, to] = ranges[item._id]
  const expected = to - from + 1

  if (item.count !== expected) {
    throw new Error(
      `READ-BACK FALLITO · ${item.label ?? item._id}: attesi ${expected}, trovati ${item.count}`,
    )
  }

  console.log(`✔ READ-BACK · ${item.label ?? item._id}: ${item.count}`)
}

console.log(`READ-BACK OK · ${readBack.length}/${ids.length}`)
