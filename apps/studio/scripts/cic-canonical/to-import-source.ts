import {readFile, writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import type {CanonicalBook} from './types'

const INPUT = resolve('scripts/cic-canonical/build/libro-7.json')
const OUTPUT = resolve('scripts/import-cic/data/canons.1400-1752.canonical.ts')

function structuralUnitCanonicalId(number: number) {
  if (number <= 1403) return 'cic-1983-libro-7-parte-1'
  if (number <= 1416) return 'cic-1983-libro-7-parte-1-titolo-1'
  if (number <= 1418) return 'cic-1983-libro-7-parte-1-titolo-2'
  if (number <= 1427) return 'cic-1983-libro-7-parte-1-titolo-2-capitolo-1-articolo-1'
  if (number <= 1429) return 'cic-1983-libro-7-parte-1-titolo-2-capitolo-1-articolo-2'
  if (number <= 1437) return 'cic-1983-libro-7-parte-1-titolo-2-capitolo-1-articolo-3'
  if (number <= 1441) return 'cic-1983-libro-7-parte-1-titolo-2-capitolo-2'
  if (number <= 1445) return 'cic-1983-libro-7-parte-1-titolo-2-capitolo-3'
  if (number <= 1457) return 'cic-1983-libro-7-parte-1-titolo-3-capitolo-1'
  if (number <= 1464) return 'cic-1983-libro-7-parte-1-titolo-3-capitolo-2'
  if (number <= 1467) return 'cic-1983-libro-7-parte-1-titolo-3-capitolo-3'
  if (number <= 1469) return 'cic-1983-libro-7-parte-1-titolo-3-capitolo-4'
  if (number <= 1475) return 'cic-1983-libro-7-parte-1-titolo-3-capitolo-5'
  if (number <= 1480) return 'cic-1983-libro-7-parte-1-titolo-4-capitolo-1'
  if (number <= 1490) return 'cic-1983-libro-7-parte-1-titolo-4-capitolo-2'
  if (number <= 1495) return 'cic-1983-libro-7-parte-1-titolo-5-capitolo-1'
  if (number <= 1500) return 'cic-1983-libro-7-parte-1-titolo-5-capitolo-2'
  if (number <= 1506) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-1-capitolo-1'
  if (number <= 1512) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-1-capitolo-2'
  if (number <= 1516) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-2'
  if (number <= 1525) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-3'
  if (number <= 1538) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-4-capitolo-1'
  if (number <= 1546) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-4-capitolo-2-articolo-1'
  if (number <= 1548) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-4-capitolo-2-articolo-2'
  if (number <= 1550) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-4-capitolo-3-articolo-1'
  if (number <= 1557) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-4-capitolo-3-articolo-2'
  if (number <= 1571) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-4-capitolo-3-articolo-3'
  if (number <= 1573) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-4-capitolo-3-articolo-4'
  if (number <= 1581) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-4-capitolo-4'
  if (number <= 1583) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-4-capitolo-5'
  if (number <= 1586) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-4-capitolo-6'
  if (number <= 1591) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-5'
  if (number <= 1595) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-5-capitolo-1'
  if (number <= 1597) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-5-capitolo-2'
  if (number <= 1606) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-6'
  if (number <= 1618) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-7'
  if (number <= 1627) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-8-capitolo-1'
  if (number <= 1640) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-8-capitolo-2'
  if (number <= 1644) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-9-capitolo-1'
  if (number <= 1648) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-9-capitolo-2'
  if (number === 1649) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-10'
  if (number <= 1655) return 'cic-1983-libro-7-parte-2-sezione-1-titolo-11'
  if (number <= 1670) return 'cic-1983-libro-7-parte-2-sezione-2'
  if (number <= 1673) return 'cic-1983-libro-7-parte-3-titolo-1-capitolo-1-articolo-1'
  if (number === 1674) return 'cic-1983-libro-7-parte-3-titolo-1-capitolo-1-articolo-2'
  if (number <= 1678) return 'cic-1983-libro-7-parte-3-titolo-1-capitolo-1-articolo-3'
  if (number <= 1682) return 'cic-1983-libro-7-parte-3-titolo-1-capitolo-1-articolo-4'
  if (number <= 1687) return 'cic-1983-libro-7-parte-3-titolo-1-capitolo-1-articolo-5'
  if (number <= 1690) return 'cic-1983-libro-7-parte-3-titolo-1-capitolo-1-articolo-6'
  if (number === 1691) return 'cic-1983-libro-7-parte-3-titolo-1-capitolo-1-articolo-7'
  if (number <= 1696) return 'cic-1983-libro-7-parte-3-titolo-1-capitolo-2'
  if (number <= 1706) return 'cic-1983-libro-7-parte-3-titolo-1-capitolo-3'
  if (number === 1707) return 'cic-1983-libro-7-parte-3-titolo-1-capitolo-4'
  if (number <= 1712) return 'cic-1983-libro-7-parte-3-titolo-2'
  if (number <= 1716) return 'cic-1983-libro-7-parte-3-titolo-3'
  if (number <= 1719) return 'cic-1983-libro-7-parte-4-capitolo-1'
  if (number <= 1728) return 'cic-1983-libro-7-parte-4-capitolo-2'
  if (number <= 1731) return 'cic-1983-libro-7-parte-4-capitolo-3'
  if (number <= 1739) return 'cic-1983-libro-7-parte-5-sezione-1'
  if (number <= 1747) return 'cic-1983-libro-7-parte-5-sezione-2-capitolo-1'
  return 'cic-1983-libro-7-parte-5-sezione-2-capitolo-2'
}

async function main() {
  const book = JSON.parse(await readFile(INPUT, 'utf8')) as CanonicalBook
  if (book.canons.length !== 353) throw new Error(`Libro VII incompleto: ${book.canons.length}/353`)

  const canons = book.canons.map((canon) => ({
    number: canon.number,
    structuralUnitCanonicalId: structuralUnitCanonicalId(canon.number),
    status: canon.number >= 1671 && canon.number <= 1691 ? 'amended' : 'inForce',
    versions: [
      {
        versionId: `cic-1983-can-${canon.number}-it-current`,
        versionLabel: 'Testo vigente — fonte ufficiale della Santa Sede',
        status: 'current',
        language: 'it',
        text: canon.text,
        sourceCitation: `Codice di Diritto Canonico, can. ${canon.number}`,
        sourceUrl: book.source.indexUrl,
        segments: canon.segments.map((segment) => ({
          segmentId: segment.id,
          segmentType: segment.type,
          label: segment.label,
          order: segment.order,
          ...(segment.parentId ? {parentSegmentId: segment.parentId} : {}),
          startOffset: segment.startOffset,
          endOffset: segment.endOffset,
          isFormalDivision: true,
        })),
      },
    ],
  }))

  const output = `import type {CanonInput} from '../types'\n\nexport const canons1400to1752Canonical: CanonInput[] = ${JSON.stringify(canons, null, 2)}\n`
  await writeFile(OUTPUT, output, 'utf8')
  console.log(`IMPORT_SOURCE_BOOK7_OK ${canons.length}/353`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
