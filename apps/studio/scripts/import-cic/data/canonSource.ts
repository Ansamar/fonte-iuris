import type {CanonInput, CanonSegmentInput} from '../types'

function isParagraphStart(text: string, match: RegExpMatchArray): boolean {
  const prefix = match[1] ?? ''
  const index = match.index ?? 0
  const markerStart = index + prefix.length
  const markerEnd = markerStart + match[0].length - prefix.length
  const after = text.slice(markerEnd)

  // A formal paragraph marker must begin a paragraph and be followed by the
  // paragraph's own text. Vatican pages sometimes wrap cross-references such as
  // "can. 1333,\n\n§1." onto a new line; those are not structural divisions.
  const before = text.slice(Math.max(0, markerStart - 40), markerStart)
  if (/can\.\s*\d+\s*,?\s*$/i.test(before.replace(/\s+/g, ' '))) return false

  return /^\s*\S/.test(after)
}

export function segments(canon: number, text: string): CanonSegmentInput[] {
  const paragraphMatches = [...text.matchAll(/(^|\n\n)§\s*(\d+)\./g)].filter((match) =>
    isParagraphStart(text, match),
  )
  const result: CanonSegmentInput[] = []

  if (paragraphMatches.length === 0) {
    const numberMatches = [...text.matchAll(/(?:^|\n)(\d+)[º°)]\s/g)]
    for (let i = 0; i < numberMatches.length; i += 1) {
      const match = numberMatches[i]
      const number = Number(match[1])
      const rawIndex = match.index ?? 0
      const startOffset = rawIndex + (text[rawIndex] === '\n' ? 1 : 0)
      const next = numberMatches[i + 1]
      let endOffset = next
        ? (next.index ?? text.length) + (text[next.index ?? 0] === '\n' ? 1 : 0)
        : text.length
      while (endOffset > startOffset && /\s/.test(text[endOffset - 1])) endOffset -= 1

      result.push({
        segmentId: `can-${canon}-num-${number}`,
        segmentType: 'number',
        label: `${number})`,
        order: number,
        startOffset,
        endOffset,
        isFormalDivision: true,
      })
    }
    return result
  }

  for (let i = 0; i < paragraphMatches.length; i += 1) {
    const match = paragraphMatches[i]
    const prefix = match[1] ?? ''
    const paragraphNumber = Number(match[2])
    const startOffset = (match.index ?? 0) + prefix.length
    const nextMatch = paragraphMatches[i + 1]
    const nextParagraphOffset = nextMatch
      ? (nextMatch.index ?? text.length) + (nextMatch[1]?.length ?? 0)
      : text.length

    let endOffset = nextParagraphOffset
    while (endOffset > startOffset && /\s/.test(text[endOffset - 1])) endOffset -= 1

    const paragraphId = `can-${canon}-par-${paragraphNumber}`
    result.push({
      segmentId: paragraphId,
      segmentType: 'paragraph',
      label: `§ ${paragraphNumber}`,
      order: paragraphNumber,
      startOffset,
      endOffset,
      isFormalDivision: true,
    })

    const paragraphText = text.slice(startOffset, nextParagraphOffset)
    const numberMatches = [...paragraphText.matchAll(/(?:^|\n)(\d+)[º°)]\s/g)]
    for (let j = 0; j < numberMatches.length; j += 1) {
      const numberMatch = numberMatches[j]
      const number = Number(numberMatch[1])
      const rawIndex = numberMatch.index ?? 0
      const numberStart = startOffset + rawIndex + (paragraphText[rawIndex] === '\n' ? 1 : 0)
      const nextNumber = numberMatches[j + 1]
      const numberEnd = nextNumber
        ? startOffset + (nextNumber.index ?? paragraphText.length) +
          (paragraphText[nextNumber.index ?? 0] === '\n' ? 1 : 0)
        : nextParagraphOffset

      let trimmedEnd = numberEnd
      while (trimmedEnd > numberStart && /\s/.test(text[trimmedEnd - 1])) trimmedEnd -= 1

      result.push({
        segmentId: `can-${canon}-par-${paragraphNumber}-num-${number}`,
        segmentType: 'number',
        label: `${number})`,
        order: number,
        parentSegmentId: paragraphId,
        startOffset: numberStart,
        endOffset: trimmedEnd,
        isFormalDivision: true,
      })
    }
  }

  return result
}

export function makeCanon(
  unit: string,
  sourceUrl: string,
  number: number,
  editorialTitle: string,
  keywords: string[],
  text: string,
): CanonInput {
  return {
    number,
    editorialTitle,
    keywords,
    structuralUnitCanonicalId: unit,
    status: 'inForce',
    versions: [
      {
        versionId: `cic-1983-can-${number}-it-1983`,
        versionLabel: 'Versione originaria 1983',
        status: 'current',
        validFrom: '1983-11-27',
        language: 'it',
        text,
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: `CIC 1983, can. ${number}`,
        sourceUrl,
        segments: segments(number, text),
      },
    ],
  }
}
