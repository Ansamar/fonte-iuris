import type {CanonInput, CanonSegmentInput} from '../types'

const UNIT = 'cic-1983-book-2-part-2-section-2-title-3-chapter-1'
const SOURCE_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_460-468_it.html'

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

function canon(
  number: number,
  editorialTitle: string,
  keywords: string[],
  text: string,
): CanonInput {
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

const t460 = `Il sinodo diocesano è l'assemblea di sacerdoti e di altri fedeli della Chiesa particolare, scelti per prestare aiuto al Vescovo diocesano in ordine al bene di tutta la comunità diocesana, a norma dei canoni seguenti.`

const t461 = `§1. Il sinodo diocesano si celebri nelle singole Chiese particolari quando, a giudizio del Vescovo diocesano e sentito il consiglio presbiterale, le circostanze lo suggeriscano.

§2. Se il Vescovo ha la cura di più diocesi oppure ha la cura di una come Vescovo proprio e di un'altra come Amministratore, può convocare un solo sinodo diocesano da tutte le diocesi affidategli.`

const t462 = `§1. Convoca il sinodo diocesano solo il Vescovo diocesano, non chi presiede la diocesi interinalmente.

§2. Presiede il sinodo diocesano il Vescovo diocesano, il quale tuttavia può delegare il Vicario generale o il Vicario episcopale, a svolgere tale ufficio per le singole sessioni del sinodo.`

const t463 = `§1. Al sinodo diocesano devono essere chiamati in qualità di membri e sono tenuti all'obbligo di parteciparvi:
1) il Vescovo coadiutore e i Vescovi ausiliari;
2) i Vicari generali e i Vicari episcopali, nonché il Vicario giudiziale;
3) i canonici della chiesa cattedrale;
4) i membri del consiglio presbiterale;
5) i fedeli laici, anche membri di istituti di vita consacrata, eletti dal consiglio pastorale nel modo e nel numero da determinarsi dal Vescovo diocesano, oppure, dove tale consiglio non esiste, secondo i criteri determinati dal Vescovo diocesano;
6) il rettore del seminario maggiore diocesano;
7) i vicari foranei;
8) almeno un presbitero eletto in ciascun vicariato foraneo da tutti coloro che ivi hanno cura d'anime; inoltre deve essere eletto un altro presbitero che lo sostituisca se il primo è impedito;
9) alcuni Superiori degli istituti religiosi e delle società di vita apostolica che hanno la casa nella diocesi, i quali devono essere eletti nel numero e nel modo determinati dal Vescovo diocesano.

§2. Al sinodo diocesano possono essere chiamati in qualità di membri anche altri, sia chierici, sia membri di istituti di vita consacrata, sia fedeli laici.

§3. Il Vescovo diocesano, se lo ritiene opportuno, può invitare come osservatori alcuni ministri o membri di Chiese o comunità ecclesiali che non sono nella piena comunione con la Chiesa cattolica.`

const t464 = `Un membro del sinodo, se è trattenuto da legittimo impedimento, non può inviare un procuratore che vi partecipi in suo nome; avverta però il Vescovo diocesano di tale impedimento.`
const t465 = `Tutte le questioni proposte siano sottomesse alla libera discussione dei membri nelle sessioni del sinodo.`
const t466 = `Nel sinodo diocesano l'unico legislatore è il Vescovo diocesano, mentre gli altri membri del sinodo hanno solamente voto consultivo; lui solo sottoscrive le dichiarazioni e i decreti sinodali, che possono essere resi pubblici soltanto per la sua autorità.`
const t467 = `Il Vescovo diocesano comunichi al Metropolita e alla Conferenza Episcopale i testi delle dichiarazioni e dei decreti sinodali.`
const t468 = `§1. Spetta al Vescovo diocesano, secondo il suo prudente giudizio, sospendere e sciogliere il sinodo diocesano.

§2. Quando la sede episcopale è vacante o impedita, il sinodo diocesano si interrompe per il diritto stesso finché il Vescovo diocesano che gli succede non decreti che esso venga continuato oppure non lo dichiari estinto.`

export const canons460to468: CanonInput[] = [
  canon(460, 'Natura del sinodo diocesano', ['sinodo diocesano', 'Chiesa particolare', 'Vescovo diocesano'], t460),
  canon(461, 'Celebrazione del sinodo diocesano', ['sinodo diocesano', 'consiglio presbiterale', 'diocesi'], t461),
  canon(462, 'Convocazione e presidenza del sinodo', ['Vescovo diocesano', 'Vicario generale', 'Vicario episcopale'], t462),
  canon(463, 'Membri del sinodo diocesano', ['membri del sinodo', 'fedeli laici', 'istituti di vita consacrata'], t463),
  canon(464, 'Impedimento di un membro del sinodo', ['sinodo diocesano', 'impedimento', 'procuratore'], t464),
  canon(465, 'Discussione delle questioni sinodali', ['sinodo diocesano', 'discussione', 'membri'], t465),
  canon(466, 'Potestà legislativa nel sinodo', ['Vescovo diocesano', 'legislatore', 'voto consultivo'], t466),
  canon(467, 'Comunicazione degli atti sinodali', ['Metropolita', 'Conferenza Episcopale', 'decreti sinodali'], t467),
  canon(468, 'Sospensione e cessazione del sinodo', ['sinodo diocesano', 'sede vacante', 'sede impedita'], t468),
]
