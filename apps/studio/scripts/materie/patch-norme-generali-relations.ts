import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-03-25'})

const ranges: Record<string, Array<[number, number]>> = {
  'legal-concept-norme-generali': [[1, 203]],
  'legal-concept-leggi-ecclesiastiche': [[7, 22]],
  'legal-concept-promulgazione-vacatio-legis': [[7, 8]],
  'legal-concept-interpretazione-legge-canonica': [[16, 19]],
  'legal-concept-consuetudine-canonica': [[23, 28]],
  'legal-concept-decreti-generali-istruzioni': [[29, 34]],
  'legal-concept-atti-amministrativi-singolari': [[35, 93]],
  'legal-concept-decreti-precetti-singolari': [[48, 58]],
  'legal-concept-rescritti': [[59, 75]],
  'legal-concept-privilegi-dispense': [[76, 93]],
  'legal-concept-computo-del-tempo': [[200, 203]],
}

const ids = Object.keys(ranges)

const concepts = await client.fetch<Array<{_id:string; label:string}>>(
  `*[_type=="legalConcept" && _id in $ids]{_id,label}`,
  {ids},
)

if (concepts.length !== ids.length) {
  throw new Error(`Materie trovate ${concepts.length}/${ids.length}`)
}

const canons = await client.fetch<Array<{_id:string; number:number}>>(
  `*[_type=="canon" && number>=1 && number<=203]{_id,number}`,
)

const canonByNumber = new Map(canons.map(c => [c.number, c._id]))

for (let n = 1; n <= 203; n++) {
  if (!canonByNumber.has(n)) throw new Error(`Canone ${n} mancante`)
}

let tx = client.transaction()

for (const concept of concepts) {
  const numbers = ranges[concept._id]
    .flatMap(([a,b]) => Array.from({length:b-a+1}, (_,i) => a+i))

  const relatedCanons = numbers.map(number => ({
    _key: `can-${number}`,
    _type: 'reference',
    _ref: canonByNumber.get(number)!,
  }))

  tx = tx.patch(concept._id, p => p.set({relatedCanons}))
  console.log(`✔ ${concept.label}: ${relatedCanons.length} canoni`)
}

const result = await tx.commit()

console.log(`PATCH OK · transaction ${result.transactionId}`)

const check = await client.fetch<Array<{label:string; count:number}>>(
  `*[_type=="legalConcept" && _id in $ids]|order(label asc){
    label,
    "count":count(relatedCanons)
  }`,
  {ids},
)

for (const row of check) console.log(`READ-BACK · ${row.label}: ${row.count}`)
