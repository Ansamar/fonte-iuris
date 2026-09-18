import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-03-25'})

const ranges: Record<string, [number, number]> = {
  'legal-concept-sanzioni-penali-chiesa': [1311, 1399],
  'legal-concept-delitti-pene-genere': [1311, 1363],
  'legal-concept-punizione-delitti-generale': [1311, 1312],
  'legal-concept-legge-precetto-penale': [1313, 1320],
  'legal-concept-soggetto-passivo-sanzioni-penali': [1321, 1330],
  'legal-concept-pene-altre-punizioni': [1331, 1340],
  'legal-concept-censure': [1331, 1335],
  'legal-concept-pene-espiatorie': [1336, 1338],
  'legal-concept-rimedi-penali-penitenze': [1339, 1340],
  'legal-concept-applicazione-pene': [1341, 1353],
  'legal-concept-remissione-pene-prescrizione': [1354, 1363],
  'legal-concept-singoli-delitti-pene': [1364, 1399],
  'legal-concept-delitti-fede-unita-chiesa': [1364, 1369],
  'legal-concept-delitti-autorita-incarichi': [1370, 1378],
  'legal-concept-delitti-sacramenti': [1379, 1389],
  'legal-concept-delitti-buona-fama-falso': [1390, 1391],
  'legal-concept-delitti-obblighi-speciali': [1392, 1396],
  'legal-concept-delitti-vita-dignita-liberta': [1397, 1398],
  'legal-concept-norma-generale-penale': [1399, 1399],
}

async function main() {
  const tx = client.transaction()

  for (const [id, [from, to]] of Object.entries(ranges)) {
    const canons = await client.fetch<Array<{_id: string; number: number}>>(
      `*[_type=="canon" && number >= $from && number <= $to] | order(number asc){_id,number}`,
      {from, to},
    )

    const wanted = to - from + 1

    if (canons.length !== wanted) {
      throw new Error(`${id}: attesi ${wanted}, trovati ${canons.length}`)
    }

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

  if (readBack.length !== Object.keys(ranges).length) {
    throw new Error(
      `READ-BACK INCOMPLETO · ${readBack.length}/${Object.keys(ranges).length}`,
    )
  }

  console.log(`READ-BACK OK · ${readBack.length}/${Object.keys(ranges).length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
