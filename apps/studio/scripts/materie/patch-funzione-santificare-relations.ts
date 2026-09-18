import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-03-25'})

const ranges = [
  ['legal-concept-funzione-santificare-sacramenti', 834, 1253],
  ['legal-concept-sacramenti', 840, 1165],
  ['legal-concept-battesimo', 849, 878],
  ['legal-concept-confermazione', 879, 896],
  ['legal-concept-eucaristia', 897, 958],
  ['legal-concept-penitenza', 959, 997],
  ['legal-concept-unzione-infermi', 998, 1007],
  ['legal-concept-ordine-sacro', 1008, 1054],
  ['legal-concept-altri-atti-culto-divino', 1166, 1204],
  ['legal-concept-sacramentali', 1166, 1172],
  ['legal-concept-liturgia-ore', 1173, 1175],
  ['legal-concept-esequie-ecclesiastiche', 1176, 1185],
  ['legal-concept-culto-santi-immagini-reliquie', 1186, 1190],
  ['legal-concept-voto-giuramento', 1191, 1204],
  ['legal-concept-luoghi-tempi-sacri', 1205, 1253],
  ['legal-concept-luoghi-sacri', 1205, 1243],
  ['legal-concept-chiese-oratori-santuari', 1214, 1234],
  ['legal-concept-altari-cimiteri', 1235, 1243],
  ['legal-concept-tempi-sacri', 1244, 1253],
] as const

async function main() {
  const tx = client.transaction()
  const expected = new Map<string, number>()

  for (const [id, from, to] of ranges) {
    const canons = await client.fetch<Array<{_id: string; number: number}>>(
      `*[_type=="canon" && number >= $from && number <= $to] | order(number asc){_id,number}`,
      {from, to},
    )

    const wanted = to - from + 1

    if (canons.length !== wanted) {
      throw new Error(
        `${id}: attesi ${wanted} canoni (${from}-${to}), trovati ${canons.length}`,
      )
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
  console.log(`\nPATCH OK · transaction ${result.transactionId}`)

  const readBack = await client.fetch<
    Array<{_id: string; label?: string; n: number}>
  >(
    `*[_id in $ids] | order(label asc){
      _id,
      label,
      "n": count(relatedCanons)
    }`,
    {ids: ranges.map(([id]) => id)},
  )

  let ok = 0

  for (const doc of readBack) {
    const wanted = expected.get(doc._id)
    const valid = doc.n === wanted

    console.log(
      `${valid ? '✔' : '✘'} ${doc.label ?? doc._id}: ${doc.n}/${wanted}`,
    )

    if (valid) ok++
  }

  if (ok !== ranges.length) {
    throw new Error(`READ-BACK FALLITO · ${ok}/${ranges.length}`)
  }

  console.log(`\nREAD-BACK OK · ${ok}/${ranges.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
