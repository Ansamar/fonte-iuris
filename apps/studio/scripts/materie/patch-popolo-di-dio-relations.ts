import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-03-25'})

const ranges: Record<string, Array<[number, number]>> = {
  'legal-concept-popolo-di-dio': [[204, 746]],
  'legal-concept-fedeli-cristiani': [[204, 329]],
  'legal-concept-diritti-doveri-fedeli': [[208, 223]],
  'legal-concept-fedeli-laici': [[224, 231]],
  'legal-concept-ministri-sacri': [[232, 293]],
  'legal-concept-prelature-personali': [[294, 297]],
  'legal-concept-associazioni-fedeli': [[298, 329]],
  'legal-concept-costituzione-gerarchica': [[330, 572]],
  'legal-concept-suprema-autorita-chiesa': [[330, 367]],
  'legal-concept-chiese-particolari': [[368, 572]],
  'legal-concept-vescovi': [[375, 430]],
  'legal-concept-organizzazione-diocesana': [[460, 572]],
  'legal-concept-vita-consacrata': [[573, 730]],
  'legal-concept-societa-vita-apostolica': [[731, 746]],
}

const ids = Object.keys(ranges)

const concepts = await client.fetch<Array<{_id: string; label: string}>>(
  `*[_type=="legalConcept" && _id in $ids]{_id,label}`,
  {ids},
)

if (concepts.length !== ids.length) {
  throw new Error(`Materie trovate ${concepts.length}/${ids.length}`)
}

const canons = await client.fetch<Array<{_id: string; number: number}>>(
  `*[_type=="canon" && number>=204 && number<=746]{_id,number}`,
)

const canonByNumber = new Map(canons.map((c) => [c.number, c._id]))

for (let n = 204; n <= 746; n++) {
  if (!canonByNumber.has(n)) throw new Error(`Canone ${n} mancante`)
}

let tx = client.transaction()

for (const concept of concepts) {
  const numbers = ranges[concept._id].flatMap(([a, b]) =>
    Array.from({length: b - a + 1}, (_, i) => a + i),
  )

  const relatedCanons = numbers.map((number) => ({
    _key: `can-${number}`,
    _type: 'reference',
    _ref: canonByNumber.get(number)!,
  }))

  tx = tx.patch(concept._id, (p) => p.set({relatedCanons}))
  console.log(`✔ ${concept.label}: ${relatedCanons.length} canoni`)
}

const result = await tx.commit()
console.log(`PATCH OK · transaction ${result.transactionId}`)

const check = await client.fetch<Array<{label: string; count: number}>>(
  `*[_type=="legalConcept" && _id in $ids]|order(label asc){
    label,
    "count":count(relatedCanons)
  }`,
  {ids},
)

for (const row of check) console.log(`READ-BACK · ${row.label}: ${row.count}`)
