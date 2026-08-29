import type {CanonInput, CanonSegmentInput} from '../types'

const UNIT = 'cic-1983-book-2-part-2-section-2-title-3-chapter-7'
const SOURCE_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_553-555_it.html'

function segments(canon: number, text: string): CanonSegmentInput[] {
  const paragraphMatches = [...text.matchAll(/(^|\n\n)§(\d+)\./g)]
  const result: CanonSegmentInput[] = []

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
    const numberMatches = [...paragraphText.matchAll(/(?:^|\n)(\d+)\)/g)]

    for (let j = 0; j < numberMatches.length; j += 1) {
      const numberMatch = numberMatches[j]
      const number = Number(numberMatch[1])
      const rawIndex = numberMatch.index ?? 0
      const numberStart = startOffset + rawIndex + (paragraphText[rawIndex] === '\n' ? 1 : 0)
      const nextNumber = numberMatches[j + 1]
      const numberEnd = nextNumber
        ? startOffset +
          (nextNumber.index ?? paragraphText.length) +
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

function canon(number: number, editorialTitle: string, keywords: string[], text: string): CanonInput {
  return {
    number,
    editorialTitle,
    keywords,
    structuralUnitCanonicalId: UNIT,
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
        sourceUrl: SOURCE_URL,
        segments: segments(number, text),
      },
    ],
  }
}

const t553 = `§1. Il vicario foraneo, chiamato anche decano o arciprete o con altro nome, è il sacerdote che è preposto al vicariato foraneo.

§2. A meno che il diritto particolare non stabilisca altro, il vicario foraneo è nominato dal Vescovo diocesano, dopo aver sentito, a suo prudente giudizio, i sacerdoti che svolgono il ministero nel vicariato in questione.`

const t554 = `§1. Per l'ufficio di vicario foraneo, che non è legato all'ufficio di parroco di una parrocchia determinata, il Vescovo scelga un sacerdote che avrà giudicato idoneo, valutate le circostanze di luogo e di tempo.

§2. Il vicario foraneo venga nominato a tempo determinato, stabilito dal diritto particolare.

§3. Il Vescovo diocesano per giusta causa può rimuovere liberamente dall'ufficio il vicario foraneo, secondo il suo prudente giudizio.`

const t555 = `§1. Il vicario foraneo, oltre alle facoltà che gli attribuisce legittimamente il diritto particolare, ha il dovere e il diritto:
1) di promuovere e coordinare l'attività pastorale comune nell'àmbito del vicariato;
2) di aver cura che i chierici del proprio distretto conducano una vita consona al loro stato e adempiano diligentemente i loro doveri;
3) di provvedere che le funzioni religiose siano celebrate secondo le disposizioni della sacra liturgia, che si curi il decoro e la pulizia delle chiese e della suppellettile sacra, soprattutto nella celebrazione eucaristica e nella custodia del santissimo Sacramento, che i libri parrocchiali vengano redatti accuratamente e custoditi nel debito modo, che i beni ecclesiastici siano amministrati diligentemente; infine che la casa parrocchiale sia conservata con la debita cura.

§2. Il vicario foraneo nell'àmbito del vicariato affidatogli:
1) si adoperi perché i chierici, secondo le disposizioni del diritto particolare, partecipino nei tempi stabiliti alle lezioni, ai convegni teologici o alle conferenze a norma del can. 279, §2;
2) abbia cura che siano disponibili sussidi spirituali per i presbiteri del suo distretto ed abbia parimenti la massima sollecitudine per coloro che si trovano in situazioni difficili o sono angustiati da problemi.

§3. Il vicario foraneo abbia cura che i parroci del suo distretto, che egli sappia gravemente ammalati, non manchino di aiuti spirituali e materiali e che vengano celebrate degne esequie per coloro che muoiono; faccia anche in modo che durante la loro malattia o dopo la loro morte, non vadano perduti o asportati i libri, i documenti, la suppellettile sacra e ogni altra cosa che appartiene alla chiesa.

§4. Il vicario foraneo è tenuto all'obbligo di visitare le parrocchie del suo distretto secondo quanto avrà determinato il Vescovo diocesano.`

export const canons553to555: CanonInput[] = [
  canon(553, 'Natura e nomina del vicario foraneo', ['vicario foraneo', 'decano', 'arciprete', 'Vescovo diocesano'], t553),
  canon(554, 'Nomina, durata e rimozione del vicario foraneo', ['vicario foraneo', 'nomina', 'durata', 'rimozione'], t554),
  canon(555, 'Compiti e doveri del vicario foraneo', ['vicario foraneo', 'attività pastorale', 'chierici', 'visita delle parrocchie'], t555),
]
