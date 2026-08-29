import type {CanonInput, CanonSegmentInput} from '../types'

const UNIT = 'cic-1983-book-2-part-2-section-2-title-3-chapter-3'
const SOURCE_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_495-502_it.html'

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

const t495 = `§1. In ogni diocesi si costituisca il consiglio presbiterale, cioè un gruppo di sacerdoti che, rappresentando il presbiterio, sia come il senato del Vescovo; spetta al consiglio presbiterale coadiuvare il Vescovo nel governo della diocesi, a norma del diritto, affinché venga promosso nel modo più efficace il bene pastorale della porzione di popolo di Dio a lui affidata.

§2. Nei vicariati e nelle prefetture apostoliche il Vicario o il Prefetto costituiscano un consiglio composto da almeno tre presbiteri missionari e sentano il loro parere, espresso anche per lettera, negli affari più importanti.`

const t496 = `Il consiglio presbiterale abbia propri statuti approvati dal Vescovo diocesano, attese le norme emanate dalla Conferenza Episcopale.`

const t497 = `Per quanto riguarda la designazione dei membri del consiglio presbiterale:
1) circa la metà venga liberamente eletta dagli stessi sacerdoti a norma dei canoni seguenti e degli statuti;
2) alcuni sacerdoti, a norma degli statuti, devono essere membri di diritto, tali cioè che appartengano al consiglio per l'ufficio loro affidato;
3) il Vescovo diocesano è libero di nominarne alcuni.`

const t498 = `§1. Hanno diritto attivo e passivo di elezione in ordine alla costituzione del consiglio presbiterale:
1) tutti i sacerdoti secolari incardinati nella diocesi;
2) i sacerdoti secolari non incardinati nella diocesi e i sacerdoti membri di un istituto religioso o di una società di vita apostolica i quali, dimorando nella diocesi, esercitano in suo favore qualche ufficio.

§2. Per quanto gli statuti lo prevedono, lo stesso diritto di elezione può essere conferito ad altri sacerdoti che abbiano nella diocesi il domicilio o il quasi-domicilio.`

const t499 = `Il modo di eleggere i membri del consiglio presbiterale deve essere determinato dagli statuti, però in modo tale che, per quanto è possibile, i sacerdoti del presbiterio siano rappresentati soprattutto in ragione dei diversi ministeri e delle diverse zone della diocesi.`

const t500 = `§1. Spetta al Vescovo diocesano convocare il consiglio presbiterale, presiederlo e determinare le questioni da trattare oppure accogliere quelle proposte dai membri.

§2. Il consiglio presbiterale ha solamente voto consultivo; il Vescovo diocesano lo ascolti negli affari di maggiore importanza, ma ha bisogno del suo consenso solo nei casi espressamente previsti dal diritto.

§3. Il consiglio presbiterale non può mai agire senza il Vescovo diocesano al quale soltanto spetta la responsabilità di far conoscere ciò che è stato stabilito a norma del §2.`

const t501 = `§1. I membri del consiglio presbiterale siano designati per il tempo determinato dagli statuti, però in modo tale che entro un quinquennio si rinnovi tutto il consiglio o una parte di esso.

§2. Quando la sede diventa vacante, il consiglio presbiterale cessa e i suoi compiti sono svolti dal collegio dei consultori; entro un anno dalla presa di possesso, il Vescovo deve costituire nuovamente il consiglio presbiterale.

§3. Se il consiglio presbiterale non adempie il compito affidatogli per il bene della diocesi oppure ne abusa gravemente, il Vescovo diocesano, consultato il Metropolita, o, se si tratta della stessa sede metropolitana, il Vescovo suffraganeo più anziano per promozione, può scioglierlo, ma entro un anno deve costituirlo nuovamente.`

const t502 = `§1. Fra i membri del consiglio presbiterale il Vescovo diocesano nomina liberamente alcuni sacerdoti, in numero non minore di sei e non maggiore di dodici, i quali costituiscono per un quinquennio il collegio dei consultori, con i compiti determinati dal diritto; tuttavia al termine del quinquennio esso continua ad esercitare le sue funzioni finché non viene costituito il nuovo collegio.

§2. Il collegio dei consultori è presieduto dal Vescovo diocesano; mentre poi la sede è impedita o vacante, è presieduto da colui che sostituisce interinalmente il Vescovo oppure, se costui non è ancora stato costituito, dal sacerdote più anziano di ordinazione nel collegio dei consultori.

§3. La Conferenza Episcopale può stabilire che i compiti del collegio dei consultori siano affidati al capitolo cattedrale.

§4. Nel vicariato e nella prefettura apostolica i compiti del collegio dei consultori spettano al consiglio della missione di cui al can. 495, §2, a meno che il diritto non stabilisca diversamente.`

export const canons495to502: CanonInput[] = [
  canon(495, 'Natura e funzione del consiglio presbiterale', ['consiglio presbiterale', 'presbiterio', 'Vescovo diocesano'], t495),
  canon(496, 'Statuti del consiglio presbiterale', ['statuti', 'consiglio presbiterale', 'Conferenza Episcopale'], t496),
  canon(497, 'Designazione dei membri', ['consiglio presbiterale', 'elezione', 'membri di diritto'], t497),
  canon(498, 'Diritto attivo e passivo di elezione', ['elezione', 'sacerdoti', 'diocesi'], t498),
  canon(499, 'Rappresentatività del consiglio presbiterale', ['presbiterio', 'rappresentanza', 'ministeri'], t499),
  canon(500, 'Convocazione e voto del consiglio presbiterale', ['Vescovo diocesano', 'voto consultivo', 'consenso'], t500),
  canon(501, 'Durata e cessazione del consiglio presbiterale', ['consiglio presbiterale', 'sede vacante', 'collegio dei consultori'], t501),
  canon(502, 'Collegio dei consultori', ['collegio dei consultori', 'Vescovo diocesano', 'Conferenza Episcopale'], t502),
]
