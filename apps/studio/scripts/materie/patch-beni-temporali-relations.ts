import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-03-25'})

const ranges: Record<string, [number, number]> = {
  'legal-concept-beni-temporali-chiesa': [1254, 1310],
  'legal-concept-acquisto-beni': [1259, 1272],
  'legal-concept-amministrazione-beni': [1273, 1289],
  'legal-concept-contratti-alienazione': [1290, 1298],
  'legal-concept-pie-volonta-fondazioni': [1299, 1310],
}

async function main() {
  const tx = client.transaction()
  const expected = new Map<string, number>()

  for (const [id, [from, to]] of Object.entries(ranges)) {
    const canons = await client.fetch<Array<{_id: string; number: number}>>(
      `*[_type=="canon" && number >= $from && number <= $to] | order(number asc){_id,number}`,
      {from, to},
    )

    const wanted = to - from + 1

    if (canons.length !== wanted) {
      throw new Error(`${id}: attesi ${wanted}, trovati ${canons.length}`)
    }

    expected.set(id, wanted)

    tx.patch(id, {
      set: {
        relatedCanons: canons.map((canon) => ({
          _type: 'reference',
          _key: `can-${canon.number}`,
          _ref: canon._id,
        })),
      },
    })

    console.log(`✔ ${id}: ${canons.length} canoni (${from}-${to})`)
  }

  const result = await tx.commit()
  console.log(`PATCH OK · transaction ${result.transactionId}`)

  const readBack = await client.fetch<
    Array<{_id: string; label: string; count: number}>
  >(
    `*[_id in $ids]|order(label asc){
      _id,
      label,
      "count":count(relatedCanons)
    }`,
    {ids: Object.keys(ranges)},
  )

  for (const item of readBack) {
    const [from, to] = ranges[item._id]
    const wanted = to - from + 1

    if (item.count !== wanted) {
      throw new Error(
        `READ-BACK FALLITO · ${item.label}: ${item.count}/${wanted}`,
      )
    }

    console.log(`✔ READ-BACK · ${item.label}: ${item.count}`)
  }

  console.log(`READ-BACK OK · ${readBack.length}/${Object.keys(ranges).length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
