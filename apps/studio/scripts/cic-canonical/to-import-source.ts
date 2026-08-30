import {readFile, writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import type {CanonicalBook} from './types'

const INPUT = resolve('scripts/cic-canonical/build/libro-7.json')
const OUTPUT = resolve('scripts/import-cic/data/canons.1400-1752.canonical.ts')

const b = 'cic-1983-book-7'
const id = (...parts: string[]) => [b, ...parts].join('-')

function structuralUnitCanonicalId(number: number) {
  if (number <= 1403) return id('part','1')
  if (number <= 1416) return id('part','1','title','1')
  if (number <= 1418) return id('part','1','title','2')
  if (number <= 1427) return id('part','1','title','2','chapter','1','article','1')
  if (number <= 1429) return id('part','1','title','2','chapter','1','article','2')
  if (number <= 1437) return id('part','1','title','2','chapter','1','article','3')
  if (number <= 1441) return id('part','1','title','2','chapter','2')
  if (number <= 1445) return id('part','1','title','2','chapter','3')
  if (number <= 1457) return id('part','1','title','3','chapter','1')
  if (number <= 1464) return id('part','1','title','3','chapter','2')
  if (number <= 1467) return id('part','1','title','3','chapter','3')
  if (number <= 1469) return id('part','1','title','3','chapter','4')
  if (number <= 1475) return id('part','1','title','3','chapter','5')
  if (number <= 1480) return id('part','1','title','4','chapter','1')
  if (number <= 1490) return id('part','1','title','4','chapter','2')
  if (number <= 1495) return id('part','1','title','5','chapter','1')
  if (number <= 1500) return id('part','1','title','5','chapter','2')
  if (number <= 1506) return id('part','2','section','1','title','1','chapter','1')
  if (number <= 1512) return id('part','2','section','1','title','1','chapter','2')
  if (number <= 1516) return id('part','2','section','1','title','2')
  if (number <= 1525) return id('part','2','section','1','title','3')
  if (number <= 1538) return id('part','2','section','1','title','4','chapter','1')
  if (number <= 1546) return id('part','2','section','1','title','4','chapter','2','article','1')
  if (number <= 1548) return id('part','2','section','1','title','4','chapter','2','article','2')
  if (number <= 1550) return id('part','2','section','1','title','4','chapter','3','article','1')
  if (number <= 1557) return id('part','2','section','1','title','4','chapter','3','article','2')
  if (number <= 1571) return id('part','2','section','1','title','4','chapter','3','article','3')
  if (number <= 1573) return id('part','2','section','1','title','4','chapter','3','article','4')
  if (number <= 1581) return id('part','2','section','1','title','4','chapter','4')
  if (number <= 1583) return id('part','2','section','1','title','4','chapter','5')
  if (number <= 1586) return id('part','2','section','1','title','4','chapter','6')
  if (number <= 1591) return id('part','2','section','1','title','5')
  if (number <= 1595) return id('part','2','section','1','title','5','chapter','1')
  if (number <= 1597) return id('part','2','section','1','title','5','chapter','2')
  if (number <= 1606) return id('part','2','section','1','title','6')
  if (number <= 1618) return id('part','2','section','1','title','7')
  if (number <= 1627) return id('part','2','section','1','title','8','chapter','1')
  if (number <= 1640) return id('part','2','section','1','title','8','chapter','2')
  if (number <= 1644) return id('part','2','section','1','title','9','chapter','1')
  if (number <= 1648) return id('part','2','section','1','title','9','chapter','2')
  if (number === 1649) return id('part','2','section','1','title','10')
  if (number <= 1655) return id('part','2','section','1','title','11')
  if (number <= 1670) return id('part','2','section','2')
  if (number <= 1673) return id('part','3','title','1','chapter','1','article','1')
  if (number === 1674) return id('part','3','title','1','chapter','1','article','2')
  if (number <= 1678) return id('part','3','title','1','chapter','1','article','3')
  if (number <= 1682) return id('part','3','title','1','chapter','1','article','4')
  if (number <= 1687) return id('part','3','title','1','chapter','1','article','5')
  if (number <= 1690) return id('part','3','title','1','chapter','1','article','6')
  if (number === 1691) return id('part','3','title','1','chapter','1','article','7')
  if (number <= 1696) return id('part','3','title','1','chapter','2')
  if (number <= 1706) return id('part','3','title','1','chapter','3')
  if (number === 1707) return id('part','3','title','1','chapter','4')
  if (number <= 1712) return id('part','3','title','2')
  if (number <= 1716) return id('part','3','title','3')
  if (number <= 1719) return id('part','4','chapter','1')
  if (number <= 1728) return id('part','4','chapter','2')
  if (number <= 1731) return id('part','4','chapter','3')
  if (number <= 1739) return id('part','5','section','1')
  if (number <= 1747) return id('part','5','section','2','chapter','1')
  return id('part','5','section','2','chapter','2')
}

async function main() {
  const book = JSON.parse(await readFile(INPUT, 'utf8')) as CanonicalBook
  if (book.canons.length !== 353) throw new Error(`Libro VII incompleto: ${book.canons.length}/353`)

  const canons = book.canons.map((canon) => ({
    number: canon.number,
    structuralUnitCanonicalId: structuralUnitCanonicalId(canon.number),
    status: canon.number >= 1671 && canon.number <= 1691 ? 'amended' : 'inForce',
    versions: [{
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
    }],
  }))

  const output = `import type {CanonInput} from '../types'\n\nexport const canons1400to1752Canonical: CanonInput[] = ${JSON.stringify(canons, null, 2)}\n`
  await writeFile(OUTPUT, output, 'utf8')
  console.log(`IMPORT_SOURCE_BOOK7_OK ${canons.length}/353`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
