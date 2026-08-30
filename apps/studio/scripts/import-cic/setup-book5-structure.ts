import {getCliClient} from 'sanity/cli'

type Unit = {
  canonicalId: string
  unitType: 'book' | 'title'
  number: string
  title: string
  canonicalLabel: string
  parentCanonicalId?: string
  order: number
}

async function main() {
  const client = getCliClient({apiVersion: '2026-03-25'})

  const corpus = await client.fetch(`*[_type=="corpus" && code=="cic-1983"][0]{_id}`)
  if (!corpus?._id) throw new Error('Corpus cic-1983 non trovato')

  const units: Unit[] = [
    {
      canonicalId: 'cic-1983-book-5',
      unitType: 'book',
      number: 'V',
      title: 'I beni temporali della Chiesa',
      canonicalLabel: 'LIBRO V — I BENI TEMPORALI DELLA CHIESA',
      order: 5,
    },
    {
      canonicalId: 'cic-1983-book-5-title-1',
      unitType: 'title',
      number: 'I',
      title: "L'acquisto dei beni",
      canonicalLabel: "TITOLO I — L'ACQUISTO DEI BENI",
      parentCanonicalId: 'cic-1983-book-5',
      order: 1,
    },
    {
      canonicalId: 'cic-1983-book-5-title-2',
      unitType: 'title',
      number: 'II',
      title: "L'amministrazione dei beni",
      canonicalLabel: "TITOLO II — L'AMMINISTRAZIONE DEI BENI",
      parentCanonicalId: 'cic-1983-book-5',
      order: 2,
    },
    {
      canonicalId: 'cic-1983-book-5-title-3',
      unitType: 'title',
      number: 'III',
      title: "I contratti e specialmente l'alienazione",
      canonicalLabel: "TITOLO III — I CONTRATTI E SPECIALMENTE L'ALIENAZIONE",
      parentCanonicalId: 'cic-1983-book-5',
      order: 3,
    },
    {
      canonicalId: 'cic-1983-book-5-title-4',
      unitType: 'title',
      number: 'IV',
      title: 'Pie volontà in genere e pie fondazioni',
      canonicalLabel: 'TITOLO IV — PIE VOLONTÀ IN GENERE E PIE FONDAZIONI',
      parentCanonicalId: 'cic-1983-book-5',
      order: 4,
    },
  ]

  const ids = new Map<string, string>()

  for (const unit of units) {
    const existing = await client.fetch(
      `*[_type=="structuralUnit" && canonicalId==$id][0]{_id}`,
      {id: unit.canonicalId},
    )

    const id = existing?._id ?? `structural-${unit.canonicalId}`
    ids.set(unit.canonicalId, id)

    const parentId = unit.parentCanonicalId ? ids.get(unit.parentCanonicalId) : undefined
    if (unit.parentCanonicalId && !parentId) {
      throw new Error(`Unità superiore non risolta: ${unit.parentCanonicalId}`)
    }

    const doc = {
      _id: id,
      _type: 'structuralUnit',
      corpus: {_type: 'reference', _ref: corpus._id},
      unitType: unit.unitType,
      number: unit.number,
      title: unit.title,
      canonicalId: unit.canonicalId,
      slug: {_type: 'slug', current: unit.canonicalId.replace(/^cic-1983-/, '')},
      ...(parentId ? {parent: {_type: 'reference', _ref: parentId}} : {}),
      order: unit.order,
      canonicalLabel: unit.canonicalLabel,
    }

    await client.createOrReplace(doc)
    console.log(`${existing ? 'UPDATE' : 'CREATE'} — ${unit.canonicalLabel}`)
  }

  console.log('STRUTTURA LIBRO V COMPLETATA — 5/5')
}

main().catch((error) => {
  console.error('\nSTRUTTURA LIBRO V FALLITA\n')
  console.error(error)
  process.exitCode = 1
})
