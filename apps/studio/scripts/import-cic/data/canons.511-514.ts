import type {CanonInput, CanonSegmentInput} from '../types'

const UNIT = 'cic-1983-book-2-part-2-section-2-title-3-chapter-5'
const SOURCE_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_511-514_it.html'

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

    result.push({
      segmentId: `can-${canon}-par-${paragraphNumber}`,
      segmentType: 'paragraph',
      label: `§ ${paragraphNumber}`,
      order: paragraphNumber,
      startOffset,
      endOffset,
      isFormalDivision: true,
    })
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

const t511 = `In ogni diocesi, se lo suggerisce la situazione pastorale, si costituisca il consiglio pastorale, al quale spetta, sotto l'autorità del Vescovo, studiare, valutare e proporre conclusioni operative su quanto riguarda le attività pastorali della diocesi.`

const t512 = `§1. Il consiglio pastorale è composto da fedeli che siano in piena comunione con la Chiesa cattolica, sia chierici, sia membri di istituti di vita consacrata, sia soprattutto laici; essi vengono designati nel modo determinato dal Vescovo diocesano.

§2. I fedeli designati al consiglio pastorale siano scelti in modo che attraverso di loro sia veramente rappresentata tutta la porzione di popolo di Dio che costituisce la diocesi, tenendo presenti le diverse zone della diocesi stessa, le condizioni sociali, le professioni e inoltre il ruolo che essi hanno nell'apostolato, sia come singoli, sia in quanto associati.

§3. Al consiglio pastorale non vengano designati se non fedeli che si distinguono per fede sicura, buoni costumi e prudenza.`

const t513 = `§1. Il consiglio pastorale viene costituito a tempo determinato, secondo le disposizioni degli statuti dati dal Vescovo.

§2. Quando la sede diviene vacante, il consiglio pastorale cessa.`

const t514 = `§1. Spetta unicamente al Vescovo diocesano, secondo le necessità dell'apostolato, convocare e presiedere il consiglio pastorale, che ha solamente voto consultivo; a lui pure unicamente compete rendere di pubblica ragione le materie trattate nel consiglio.

§2. Il consiglio pastorale sia convocato almeno una volta l'anno.`

export const canons511to514: CanonInput[] = [
  canon(511, 'Natura e funzione del consiglio pastorale', ['consiglio pastorale', 'attività pastorali', 'Vescovo'], t511),
  canon(512, 'Composizione del consiglio pastorale', ['consiglio pastorale', 'fedeli', 'rappresentanza diocesana'], t512),
  canon(513, 'Durata e cessazione del consiglio pastorale', ['consiglio pastorale', 'statuti', 'sede vacante'], t513),
  canon(514, 'Convocazione e voto del consiglio pastorale', ['Vescovo diocesano', 'voto consultivo', 'convocazione'], t514),
]
