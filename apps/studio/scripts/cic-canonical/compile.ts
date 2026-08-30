import {createHash} from 'node:crypto'
import {readFile, writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import type {CanonicalBook, CanonicalCanon, CanonicalSegment} from './types'

const FROM = 1400
const TO = 1752
const EXPECTED = TO - FROM + 1

function normalizeNewlines(value: string) {
  return value.replace(/\r\n?/g, '\n').normalize('NFC')
}

function splitCanons(source: string): CanonicalCanon[] {
  const marker = /^@@CANON\s+(\d+)\s*$/gm
  const matches = [...source.matchAll(marker)]
  const canons: CanonicalCanon[] = []

  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i]
    const number = Number(current[1])
    const bodyStart = (current.index ?? 0) + current[0].length
    const bodyEnd = matches[i + 1]?.index ?? source.length
    let text = source.slice(bodyStart, bodyEnd).trim()
    text = text.replace(/\n?@@END\s*$/m, '').trim()
    canons.push({number, text, segments: compileSegments(number, text)})
  }

  return canons
}

function compileSegments(canon: number, text: string): CanonicalSegment[] {
  const result: CanonicalSegment[] = []
  const paragraphs = [...text.matchAll(/^§\s*(\d+)\s*[.:]?\s*/gm)]

  if (paragraphs.length === 0) {
    addNumbers(result, canon, text, 0, text.length)
    return result
  }

  for (let i = 0; i < paragraphs.length; i += 1) {
    const match = paragraphs[i]
    const paragraphNumber = Number(match[1])
    const startOffset = match.index ?? 0
    const endOffset = paragraphs[i + 1]?.index ?? text.length
    const parentId = `can-${canon}-par-${paragraphNumber}`

    result.push({
      id: parentId,
      type: 'paragraph',
      label: `§ ${paragraphNumber}`,
      order: paragraphNumber,
      startOffset,
      endOffset,
    })

    addNumbers(result, canon, text.slice(startOffset, endOffset), startOffset, endOffset, parentId)
  }

  return result
}

function addNumbers(
  result: CanonicalSegment[],
  canon: number,
  text: string,
  baseOffset: number,
  absoluteEnd: number,
  parentId?: string,
) {
  const numbers = [...text.matchAll(/^(\d+)\s*[°º)]\s*/gm)]
  for (let i = 0; i < numbers.length; i += 1) {
    const match = numbers[i]
    const number = Number(match[1])
    const startOffset = baseOffset + (match.index ?? 0)
    const endOffset = numbers[i + 1]
      ? baseOffset + (numbers[i + 1].index ?? text.length)
      : absoluteEnd
    const prefix = parentId ? `${parentId}-num` : `can-${canon}-num`

    result.push({
      id: `${prefix}-${number}`,
      type: 'number',
      label: `${number}°`,
      order: number,
      ...(parentId ? {parentId} : {}),
      startOffset,
      endOffset,
    })
  }
}

async function main() {
  const sourcePath = resolve(process.argv[2] ?? 'scripts/cic-canonical/source/libro-7.source.txt')
  const outputPath = resolve(process.argv[3] ?? 'scripts/cic-canonical/build/libro-7.json')
  const raw = normalizeNewlines(await readFile(sourcePath, 'utf8'))
  const sha256 = createHash('sha256').update(raw).digest('hex')
  const canons = splitCanons(raw)

  const book: CanonicalBook = {
    schemaVersion: 1,
    corpus: 'cic-1983',
    book: 7,
    language: 'it',
    range: {from: FROM, to: TO},
    expectedCanons: EXPECTED,
    source: {
      authority: 'Santa Sede',
      indexUrl: 'https://www.vatican.va/archive/cod-iuris-canonici/cic_index_it.html',
      acquiredAt: new Date().toISOString(),
      sha256,
    },
    canons,
  }

  await writeFile(outputPath, `${JSON.stringify(book, null, 2)}\n`, 'utf8')
  console.log(`CANONICAL_BUILD ${canons.length}/${EXPECTED}`)
  console.log(`SOURCE_SHA256 ${sha256}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
