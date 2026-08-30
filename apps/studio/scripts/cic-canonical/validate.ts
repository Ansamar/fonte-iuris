import {readFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import type {CanonicalBook, CanonicalCanon} from './types'

const errors: string[] = []
const fail = (message: string) => errors.push(message)

function validateCanon(canon: CanonicalCanon) {
  if (!canon.text.trim()) fail(`Can. ${canon.number}: testo vuoto`)

  const ids = new Set<string>()
  for (const segment of canon.segments) {
    if (ids.has(segment.id)) fail(`Can. ${canon.number}: segmentId duplicato ${segment.id}`)
    ids.add(segment.id)
    if (segment.startOffset < 0 || segment.endOffset > canon.text.length || segment.endOffset <= segment.startOffset) {
      fail(`Can. ${canon.number}: range invalido ${segment.id}`)
    }
  }

  for (const segment of canon.segments) {
    if (segment.parentId && !ids.has(segment.parentId)) {
      fail(`Can. ${canon.number}: parent inesistente ${segment.parentId}`)
    }
  }
}

function regression(book: CanonicalBook) {
  const get = (number: number) => book.canons.find((canon) => canon.number === number)
  for (const number of [1405, 1422, 1423, 1445]) {
    if (!get(number)) fail(`REGRESSION Can. ${number}: assente`)
  }

  const c1405 = get(1405)
  if (c1405 && new Set(c1405.segments.map((s) => s.id)).size !== c1405.segments.length) {
    fail('REGRESSION Can. 1405: segmenti duplicati')
  }

  const c1445 = get(1445)
  if (c1445 && new Set(c1445.segments.map((s) => s.id)).size !== c1445.segments.length) {
    fail('REGRESSION Can. 1445: segmenti duplicati')
  }

  const c1422 = get(1422)
  if (c1422?.segments.some((s) => s.id === 'can-1422-par-5')) {
    fail('REGRESSION Can. 1422: riferimento §5 promosso a paragrafo')
  }

  const c1423 = get(1423)
  if (c1423) {
    const paragraphIds = c1423.segments.filter((s) => s.type === 'paragraph').map((s) => s.id)
    if (paragraphIds.join('|') !== 'can-1423-par-1|can-1423-par-2') {
      fail(`REGRESSION Can. 1423: paragrafi inattesi ${paragraphIds.join(', ')}`)
    }
  }
}

async function main() {
  const path = resolve(process.argv[2] ?? 'scripts/cic-canonical/build/libro-7.json')
  const book = JSON.parse(await readFile(path, 'utf8')) as CanonicalBook

  if (book.book !== 7) fail('book deve essere 7')
  if (book.range.from !== 1400 || book.range.to !== 1752) fail('range deve essere 1400-1752')
  if (book.expectedCanons !== 353) fail('expectedCanons deve essere 353')
  if (book.canons.length !== 353) fail(`canoni: attesi 353, trovati ${book.canons.length}`)

  const numbers = book.canons.map((canon) => canon.number)
  const unique = new Set(numbers)
  if (unique.size !== numbers.length) fail('numeri di canone duplicati')
  for (let number = 1400; number <= 1752; number += 1) {
    if (!unique.has(number)) fail(`Can. ${number}: mancante`)
  }
  for (const number of numbers) {
    if (number < 1400 || number > 1752) fail(`Can. ${number}: fuori range`)
  }

  book.canons.forEach(validateCanon)
  regression(book)

  console.log('\nVALIDAZIONE CANONICAL CIC — LIBRO VII')
  console.log(`Canoni: ${book.canons.length}/353`)
  console.log(`Segmenti: ${book.canons.reduce((sum, canon) => sum + canon.segments.length, 0)}`)
  console.log(`SHA256 sorgente: ${book.source.sha256}`)

  if (errors.length) {
    console.error(`✖ ${errors.length} errori`)
    errors.forEach((error) => console.error(`- ${error}`))
    process.exitCode = 1
    return
  }

  console.log('✔ CANONICAL BOOK VII VALID — 0 errori')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
