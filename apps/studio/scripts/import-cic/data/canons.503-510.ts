import type {CanonInput, CanonSegmentInput} from '../types'

const UNIT = 'cic-1983-book-2-part-2-section-2-title-3-chapter-4'
const SOURCE_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_503-510_it.html'

function segments(canon: number, text: string): CanonSegmentInput[] {
  const paragraphMatches = [...text.matchAll(/(^|\n\n)§(\d+)\./g)]
  const result: CanonSegmentInput[] = []

  if (paragraphMatches.length === 0) {
    const numberMatches = [...text.matchAll(/(?:^|\n)(\d+)\)/g)]
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

const t503 = `Il capitolo dei canonici, sia cattedrale sia collegiale, è il collegio di sacerdoti al quale spetta assolvere alle funzioni liturgiche più solenni nella chiesa cattedrale o collegiale; spetta inoltre al capitolo cattedrale adempiere i cómpiti che gli vengono affidati dal diritto o dal Vescovo diocesano.`

const t504 = `L'erezione, la modifica o la soppressione del capitolo cattedrale è riservata alla Sede Apostolica.`

const t505 = `Ogni capitolo, sia cattedrale sia collegiale, abbia propri statuti, costituiti mediante un legittimo atto capitolare e approvati dal Vescovo diocesano; tali statuti non vengano modificati o abrogati se non con l'approvazione dello stesso Vescovo diocesano.`

const t506 = `§1. Gli statuti del capitolo, salve sempre le leggi di fondazione, determinino la stessa costituzione del capitolo e il numero dei canonici; definiscano quali cómpiti debbano essere svolti dal capitolo e dai singoli canonici in ordine alla celebrazione del culto divino e all'esercizio del ministero; regolino le riunioni in cui vengono trattate le questioni riguardanti il capitolo e, salve le disposizioni del diritto universale, determinino le condizioni richieste per la validità e la liceità degli atti.

§2. Negli statuti vengano determinate anche le retribuzioni dei canonici, sia quelle stabili, sia quelle da versare in occasione dell'adempimento di un incarico; inoltre siano determinate le loro insegne, tenendo presenti le norme emanate dalla Santa Sede.`

const t507 = `§1. Vi sia fra i canonici chi presiede il capitolo e vengano pure costituiti gli altri uffici, a norma degli statuti, tenendo anche conto degli usi vigenti nella regione.

§2. Ai chierici che non appartengono al capitolo possono essere affidati altri uffici mediante i quali, a norma degli statuti, prestano aiuto ai canonici.`

const t508 = `§1. Il canonico penitenziere, sia della chiesa cattedrale sia della chiesa collegiale, ha in forza dell'ufficio la facoltà ordinaria che però non è delegabile, di assolvere in foro sacramentale dalle censure latae sententiae non dichiarate, non riservate alla Sede Apostolica; tale facoltà riguarda, in diocesi, anche gli estranei e i diocesani anche fuori del territorio della diocesi.

§2. Dove manca il capitolo il Vescovo diocesano costituisca un sacerdote a compiere il medesimo incarico.`

const t509 = `§1. Spetta al Vescovo diocesano udito il capitolo, ma non all'Amministratore diocesano, conferire tutti e singoli i canonicati, sia nella chiesa cattedrale sia nella chiesa collegiale, revocato ogni privilegio contrario; spetta ancora al Vescovo confermare colui che è eletto dal capitolo stesso per presiederlo.

§2. Il Vescovo diocesano conferisca i canonicati solo a sacerdoti che si distinguono per dottrina e integrità di vita e che abbiano esercitato lodevolmente il ministero.`

const t510 = `§1. Le parrocchie non siano più unite al capitolo dei canonici; quelle che sono tuttora unite ad un capitolo, ne siano separate da parte del Vescovo diocesano.

§2. Nella chiesa che sia insieme parrocchiale e capitolare, venga costituito un parroco, scelto fra i capitolari o meno; questi è tenuto a tutti i doveri e possiede i diritti e le facoltà che, a norma del diritto, sono proprie del parroco.

§3. Spetta al Vescovo diocesano stabilire norme precise mediante le quali possano essere debitamente armonizzati i doveri pastorali del parroco e le funzioni proprie del capitolo, facendo in modo che il parroco non sia di impedimento alle funzioni capitolari e il capitolo non sia di impedimento a quelle parrocchiali; se sorge un conflitto, lo dirima il Vescovo diocesano il quale deve curare innanzi tutto che si provveda in modo adeguato alle necessità pastorali dei fedeli.

§4. Le offerte che vengono elargite ad una chiesa contemporaneamente parrocchiale e capitolare, si presumono elargite alla parrocchia, se non consti altro.`

export const canons503to510: CanonInput[] = [
  canon(503, 'Natura e compiti del capitolo dei canonici', ['capitolo dei canonici', 'capitolo cattedrale', 'capitolo collegiale'], t503),
  canon(504, 'Erezione, modifica e soppressione del capitolo cattedrale', ['capitolo cattedrale', 'Sede Apostolica', 'erezione'], t504),
  canon(505, 'Statuti del capitolo', ['statuti', 'capitolo dei canonici', 'Vescovo diocesano'], t505),
  canon(506, 'Contenuto degli statuti capitolari', ['statuti', 'canonici', 'culto divino'], t506),
  canon(507, 'Presidente e uffici del capitolo', ['presidente del capitolo', 'uffici', 'canonici'], t507),
  canon(508, 'Canonico penitenziere', ['canonico penitenziere', 'foro sacramentale', 'censure'], t508),
  canon(509, 'Conferimento dei canonicati', ['canonicati', 'Vescovo diocesano', 'capitolo'], t509),
  canon(510, 'Parrocchie e capitoli dei canonici', ['parrocchia', 'capitolo dei canonici', 'parroco'], t510),
]
