import type {CanonInput, CanonSegmentInput} from '../types'

const VATICAN_403_411_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_403-411_it.html'

const UNIT =
  'cic-1983-book-2-part-2-section-2-title-1-chapter-2-article-3'

function paragraphSegments(canon: number, text: string): CanonSegmentInput[] {
  const matches = [...text.matchAll(/^§(\d+)\./gm)]

  return matches.map((match, index) => {
    const startOffset = match.index ?? 0
    const endOffset =
      index + 1 < matches.length ? (matches[index + 1].index ?? text.length) : text.length

    let trimmedEndOffset = endOffset
    while (trimmedEndOffset > startOffset && /\s/.test(text[trimmedEndOffset - 1])) {
      trimmedEndOffset -= 1
    }

    const paragraphNumber = Number(match[1])

    return {
      segmentId: `can-${canon}-par-${paragraphNumber}`,
      segmentType: 'paragraph',
      label: `§ ${paragraphNumber}`,
      order: paragraphNumber,
      startOffset,
      endOffset: trimmedEndOffset,
      isFormalDivision: true,
    }
  })
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
        sourceUrl: VATICAN_403_411_URL,
        segments: paragraphSegments(number, text),
      },
    ],
  }
}

const text403 = `§1. Quando le necessità pastorali della diocesi lo suggeriscono, vengano costituiti, su richiesta del Vescovo diocesano, uno o più Vescovi ausiliari; il Vescovo ausiliare non ha diritto di successione.

§2. In circostanze particolarmente gravi, anche di carattere personale, al Vescovo diocesano può essere assegnato un Vescovo ausiliare fornito di speciali facoltà.

§3. La Santa Sede, se ciò le risulta più opportuno, può costituire d'ufficio un Vescovo coadiutore, che pure viene fornito di speciali facoltà; il Vescovo coadiutore ha il diritto di successione.`

const text404 = `§1. Il Vescovo coadiutore prende possesso del suo ufficio quando esibisce, personalmente o mediante procuratore, la lettera apostolica di nomina al Vescovo diocesano e al collegio dei consultori, alla presenza del cancelliere di curia, che mette agli atti il fatto.

§2. Il Vescovo ausiliare prende possesso del suo ufficio quando esibisce la lettera apostolica di nomina al Vescovo diocesano, alla presenza del cancelliere di curia, che mette agli atti il fatto.

§3. Se il Vescovo diocesano è totalmente impedito, è sufficiente che, sia il Vescovo coadiutore sia il Vescovo ausiliare, esibiscano la lettera apostolica di nomina al collegio dei consultori, alla presenza del cancelliere della curia.`

const text405 = `§1. Il Vescovo coadiutore, come pure il Vescovo ausiliare, hanno gli obblighi e i diritti determinati dalle disposizioni dei canoni che seguono e definiti nella lettera di nomina.

§2. Il Vescovo coadiutore e il Vescovo ausiliare di cui nel can. 403, §2 assistono il Vescovo diocesano in tutto il governo della diocesi e lo suppliscono se è assente o impedito.`

const text406 = `§1. Il Vescovo coadiutore, come il Vescovo ausiliare di cui nel can. 403, §2, sia costituito dal Vescovo diocesano Vicario generale; inoltre il Vescovo diocesano affidi a lui a preferenza di altri tutto ciò che richiede, a norma del diritto, un mandato speciale.

§2. A meno che nella lettera apostolica non si provveda diversamente e fermo restando il disposto del §1, il Vescovo diocesano costituisca l'ausiliare o gli ausiliari Vicari generali o almeno Vicari episcopali, dipendenti solo dalla sua autorità oppure da quella del Vescovo coadiutore o del Vescovo ausiliare di cui nel can. 403, §2.`

const text407 = `§1. Perché sia favorito nel migliore dei modi il bene presente e futuro della diocesi, il Vescovo diocesano, il coadiutore e il Vescovo ausiliare di cui nel can. 403, §2, si consultino tra di loro nelle questioni di maggiore importanza.

§2. Il Vescovo diocesano, nel valutare le cause di maggiore importanza, soprattutto di carattere pastorale, prima degli altri voglia consultare i Vescovi ausiliari.

§3. Il Vescovo coadiutore e il Vescovo ausiliare, in quanto sono chiamati a partecipare alla sollecitudine del Vescovo diocesano, esercitino le loro funzioni in modo da procedere insieme con lui di comune accordo.`

const text408 = `§1. Il Vescovo coadiutore e il Vescovo ausiliare che non siano giustamente impediti, sono obbligati, ogni volta che ne siano richiesti dal Vescovo diocesano, a celebrare i pontificali e le altre funzioni a cui il Vescovo diocesano è tenuto.

§2. Il Vescovo diocesano non affidi abitualmente ad altri i diritti e le funzioni episcopali che il Vescovo coadiutore o l'ausiliare possono esercitare.`

const text409 = `§1. Nel momento in cui la sede episcopale è vacante, il Vescovo coadiutore diviene immediatamente Vescovo della diocesi per la quale era stato costituito, purché ne abbia preso legittimo possesso.

§2. Quando la sede episcopale diviene vacante, se non è stato stabilito in modo diverso dall'autorità competente, il Vescovo ausiliare, finché il nuovo Vescovo non abbia preso possesso della sede, conserva tutte e sole le potestà e facoltà di cui godeva come Vicario generale o come Vicario episcopale, mentre la sede era occupata; se poi non è stato designato all'ufficio di Amministratore diocesano, eserciti tale sua potestà, conferitagli dal diritto, sotto l'autorità dell'Amministratore diocesano che presiede al governo della diocesi.`

const text410 = `Il Vescovo coadiutore e il Vescovo ausiliare sono tenuti, come il Vescovo diocesano, all'obbligo di risiedere in diocesi; non se ne allontanino se non per breve tempo, tranne che a motivo di un ufficio da svolgere fuori della diocesi o di ferie, da non protrarsi oltre un mese.`

const text411 = `Al Vescovo coadiutore e all'ausiliare, per quanto riguarda la rinuncia all'ufficio, si applicano le disposizioni dei cann. 401 e 402, §2.`

export const canons403to411: CanonInput[] = [
  canon(403, 'Vescovi coadiutori e ausiliari', ['Vescovo coadiutore', 'Vescovo ausiliare', 'diritto di successione'], text403),
  canon(404, 'Presa di possesso dell’ufficio', ['presa di possesso', 'lettera apostolica', 'collegio dei consultori'], text404),
  canon(405, 'Obblighi e diritti dei coadiutori e ausiliari', ['Vescovo coadiutore', 'Vescovo ausiliare', 'governo della diocesi'], text405),
  canon(406, 'Vicario generale o episcopale', ['Vicario generale', 'Vicario episcopale', 'mandato speciale'], text406),
  canon(407, 'Comunione nel governo della diocesi', ['consultazione', 'bene della diocesi', 'comune accordo'], text407),
  canon(408, 'Funzioni episcopali', ['pontificali', 'funzioni episcopali', 'Vescovo diocesano'], text408),
  canon(409, 'Sede vacante e successione', ['sede vacante', 'successione', 'Amministratore diocesano'], text409),
  canon(410, 'Obbligo di residenza', ['residenza', 'assenza dalla diocesi', 'ferie'], text410),
  canon(411, 'Rinuncia all’ufficio', ['rinuncia', 'Vescovo coadiutore', 'Vescovo ausiliare'], text411),
]
