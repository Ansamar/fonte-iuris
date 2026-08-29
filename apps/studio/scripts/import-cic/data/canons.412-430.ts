import type {CanonInput, CanonSegmentInput} from '../types'

const VATICAN_412_415_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_412-415_it.html'
const VATICAN_416_430_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_416-430_it.html'

const UNIT_ARTICLE_1 =
  'cic-1983-book-2-part-2-section-2-title-1-chapter-3-article-1'
const UNIT_ARTICLE_2 =
  'cic-1983-book-2-part-2-section-2-title-1-chapter-3-article-2'

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

function numberedSegments(
  canon: number,
  text: string,
  paragraphNumber: number,
): CanonSegmentInput[] {
  const paragraphStart = text.indexOf(`§${paragraphNumber}.`)
  if (paragraphStart < 0) return []

  const nextParagraph = text.indexOf(`\n\n§${paragraphNumber + 1}.`, paragraphStart)
  const paragraphEnd = nextParagraph >= 0 ? nextParagraph : text.length
  const paragraphText = text.slice(paragraphStart, paragraphEnd)
  const matches = [...paragraphText.matchAll(/(?:^|\n)(\d+)\)/g)]

  return matches.map((match, index) => {
    const number = Number(match[1])
    const markerOffset = match[0].startsWith('\n') ? 1 : 0
    const startOffset = paragraphStart + (match.index ?? 0) + markerOffset
    const relativeEnd =
      index + 1 < matches.length ? (matches[index + 1].index ?? paragraphText.length) : paragraphText.length
    let endOffset = paragraphStart + relativeEnd

    while (endOffset > startOffset && /\s/.test(text[endOffset - 1])) {
      endOffset -= 1
    }

    return {
      segmentId: `can-${canon}-num-${number}`,
      segmentType: 'number',
      label: `${number})`,
      order: number,
      parentSegmentId: `can-${canon}-par-${paragraphNumber}`,
      startOffset,
      endOffset,
      isFormalDivision: true,
    }
  })
}

function canon(
  number: number,
  editorialTitle: string,
  keywords: string[],
  text: string,
  unit: string,
  sourceUrl: string,
  extraSegments: CanonSegmentInput[] = [],
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
        segments: [...paragraphSegments(number, text), ...extraSegments],
      },
    ],
  }
}

const text412 = `La sede episcopale si intende impedita se il Vescovo diocesano è totalmente impedito di esercitare l'ufficio pastorale nella diocesi a motivo di prigionia, confino, esilio o inabilità, non essendo in grado di comunicare nemmeno per lettera con i suoi diocesani.`

const text413 = `§1. Mentre la sede è impedita, il governo della diocesi, se la Santa Sede non ha provveduto in altro modo, spetta al Vescovo coadiutore se c'è; se questo manca o è impedito, spetta ad un Vescovo ausiliare o ad un Vicario generale o episcopale o ad un altro sacerdote, mantenendo l'ordine delle persone stabilito nell'elenco che il Vescovo diocesano, dopo avere preso possesso della diocesi, deve compilare quanto prima; tale elenco, che deve essere comunicato al Metropolita, sia rinnovato almeno ogni tre anni e conservato sotto segreto dal cancelliere.

§2. Se manca o è impedito il Vescovo coadiutore e non sopperisce l'elenco di cui al §1, spetta al collegio dei consultori eleggere il sacerdote che deve governare la diocesi.

§3. Colui che ha assunto il governo della diocesi a norma dei §§1 e 2, informi quanto prima la Santa Sede che la sede è impedita e che egli stesso ha assunto tale ufficio.`

const text414 = `Chiunque è stato chiamato, a norma del can. 413, ad assumere provvisoriamente la cura pastorale della diocesi soltanto per il tempo in cui la sede è impedita, nell'esercizio della cura pastorale è tenuto agli obblighi e ha la potestà che, a norma del diritto, competono all'Amministratore diocesano.`

const text415 = `Se al Vescovo diocesano viene proibito di esercitare il proprio ufficio a motivo di una pena ecclesiastica, il Metropolita oppure, se il Metropolita manca o se si tratta del Metropolita stesso, il suffraganeo più anziano per promozione ricorra immediatamente alla Santa Sede perché provveda essa stessa.`

const text416 = `La sede episcopale diviene vacante con la morte del Vescovo diocesano, con la rinuncia accettata dal Romano Pontefice, con il trasferimento e con la privazione intimata al Vescovo.`

const text417 = `Tutto ciò che viene compiuto dal Vicario generale o dal Vicario episcopale ha valore finché non hanno ricevuto notizia certa della morte del Vescovo diocesano; così pure ha valore tutto ciò che viene compiuto dal Vescovo diocesano o dal Vicario generale o episcopale finché non abbiano ricevuto notizia certa degli atti pontifici sopra menzionati.`

const text418 = `§1. Dal momento che ha ricevuto notizia certa del trasferimento il Vescovo, entro due mesi, deve raggiungere la diocesi alla quale è destinato e prenderne possesso canonico; dal giorno della presa di possesso canonico della nuova diocesi, la diocesi di provenienza diviene vacante.

§2. Dal momento che ha ricevuto notizia certa del trasferimento fino alla presa di possesso canonico della nuova diocesi, nella diocesi di provenienza il Vescovo trasferito:
1) ha la potestà di Amministratore diocesano ed è tenuto agli agli obblighi relativi, mentre cessa ogni potestà del Vicario generale e del Vicario episcopale, salvo tuttavia il can. 409, §2;
2) percepisce l'intera rimunerazione propria dell'ufficio.`

const text419 = `Quando la sede diviene vacante, il governo della diocesi, fino alla costituzione dell'Amministratore diocesano, passa al Vescovo ausiliare e, se sono più d'uno, al più anziano per promozione; se manca il Vescovo ausiliare, è affidato al collegio dei consultori, a meno che la Santa Sede non abbia provveduto diversamente. Colui che assume in tal modo il governo della diocesi convochi senza indugio il collegio competente a nominare l'Amministratore diocesano.`

const text420 = `Nel vicariato o nella prefettura apostolica, quando la sede è vacante, assume il governo il Provicario o il Proprefetto, nominato soltanto a questo effetto dal Vicario o dal Prefetto subito dopo la presa di possesso, a meno che la Santa Sede non abbia stabilito diversamente.`

const text421 = `§1. Entro otto giorni dal momento in cui si è ricevuta notizia che la sede episcopale è vacante, il collegio dei consultori, fermo restando il disposto del can. 502, §3, deve eleggere l'Amministratore diocesano con il compito di reggere interinalmente la diocesi.

§2. Se l'Amministratore diocesano per qualsiasi causa non viene eletto legittimamente entro il tempo prescritto, la sua nomina passa al Metropolita e se è vacante la stessa sede metropolitana o, contemporaneamente, la Chiesa metropolitana e quella suffraganea, passa al Vescovo suffraganeo più anziano per promozione.`

const text422 = `Il Vescovo ausiliare o, se egli manca, il collegio dei consultori informi quanto prima la Sede Apostolica della morte del Vescovo; così pure colui che è eletto Amministratore diocesano la informi quanto prima della sua elezione.`

const text423 = `§1. Si nomini un solo Amministratore diocesano, riprovata qualsiasi consuetudine contraria; altrimenti l'elezione è nulla.

§2. L'Amministratore diocesano non sia contemporaneamente economo; perciò se l'economo della diocesi viene eletto Amministratore, il consiglio per gli affari economici elegga temporaneamente un altro economo.`

const text424 = `L'Amministratore diocesano venga eletto a norma dei cann. 165-178.`

const text425 = `§1. All'ufficio di Amministratore diocesano può essere destinato validamente solo un sacerdote che abbia compiuto i trentacinque anni di età e che non sia già stato eletto, nominato o presentato per la medesima sede vacante.

§2. Venga eletto Amministratore diocesano un sacerdote che si distingua per dottrina e prudenza.

§3. Se non sono state rispettate le condizioni stabilite al §1, il Metropolita oppure, se è vacante la stessa Chiesa metropolitana, il Vescovo suffraganeo più anziano per promozione, dopo avere preso conoscenza della vera situazione, nomini per quella volta l'Amministratore; gli atti di colui che è stato eletto contro le disposizioni del §1 sono nulli per il diritto stesso.`

const text426 = `Colui che, mentre la sede è vacante, regge la diocesi prima della nomina dell'Amministratore diocesano, ha la stessa potestà che il diritto riconosce al Vicario generale.`

const text427 = `§1. L'Amministratore diocesano è tenuto agli obblighi e ha la potestà del Vescovo diocesano, escluso ciò che non gli compete o per la natura della cosa o per il diritto stesso.

§2. L'Amministratore diocesano ottiene la relativa potestà dal momento in cui accetta l'elezione, senza bisogno di conferma da parte di alcuno, fermo restando l'obbligo di cui nel can. 833, n. 4.`

const text428 = `§1. Mentre la sede è vacante non si proceda a innovazioni.

§2. A coloro che provvedono interinalmente al governo della diocesi è proibito compiere qualsiasi atto che possa arrecare pregiudizio alla diocesi o ai diritti episcopali; in modo speciale è proibito a loro e perciò a chiunque altro, sia personalmente, sia attraverso altri, di sottrarre o distruggere o modificare qualsiasi documento della curia diocesana.`

const text429 = `L'Amministratore diocesano è tenuto all'obbligo di risiedere nella diocesi e di applicare la Messa per il popolo, a norma del can. 388.`

const text430 = `§1. L'ufficio dell'Amministratore diocesano cessa con la presa di possesso della diocesi da parte del nuovo Vescovo.

§2. La rimozione dell'Amministratore diocesano è riservata alla Santa Sede; l'eventuale sua rinuncia deve essere presentata in forma autentica al collegio competente per la sua elezione, e non ha bisogno di essere accettata; in caso di rimozione, di rinuncia o di morte dell'Amministratore diocesano, ne venga eletto un altro, a norma del can. 421.`

const can418Extra = numberedSegments(418, text418, 2)

export const canons412to430: CanonInput[] = [
  canon(412, 'Nozione di sede impedita', ['sede impedita', 'Vescovo diocesano', 'inabilità'], text412, UNIT_ARTICLE_1, VATICAN_412_415_URL),
  canon(413, 'Governo della diocesi con sede impedita', ['sede impedita', 'Vescovo coadiutore', 'collegio dei consultori'], text413, UNIT_ARTICLE_1, VATICAN_412_415_URL),
  canon(414, 'Poteri di chi regge la diocesi impedita', ['cura pastorale', 'Amministratore diocesano', 'sede impedita'], text414, UNIT_ARTICLE_1, VATICAN_412_415_URL),
  canon(415, 'Impedimento per pena ecclesiastica', ['pena ecclesiastica', 'Metropolita', 'Santa Sede'], text415, UNIT_ARTICLE_1, VATICAN_412_415_URL),
  canon(416, 'Cause della sede vacante', ['sede vacante', 'rinuncia', 'trasferimento'], text416, UNIT_ARTICLE_2, VATICAN_416_430_URL),
  canon(417, 'Validità degli atti prima della notizia certa', ['Vicario generale', 'Vicario episcopale', 'notizia certa'], text417, UNIT_ARTICLE_2, VATICAN_416_430_URL),
  canon(418, 'Trasferimento del Vescovo diocesano', ['trasferimento', 'presa di possesso', 'Amministratore diocesano'], text418, UNIT_ARTICLE_2, VATICAN_416_430_URL, can418Extra),
  canon(419, 'Governo provvisorio della diocesi vacante', ['sede vacante', 'Vescovo ausiliare', 'collegio dei consultori'], text419, UNIT_ARTICLE_2, VATICAN_416_430_URL),
  canon(420, 'Vacanza nel vicariato o prefettura apostolica', ['vicariato apostolico', 'prefettura apostolica', 'Provicario'], text420, UNIT_ARTICLE_2, VATICAN_416_430_URL),
  canon(421, 'Elezione dell’Amministratore diocesano', ['Amministratore diocesano', 'elezione', 'collegio dei consultori'], text421, UNIT_ARTICLE_2, VATICAN_416_430_URL),
  canon(422, 'Comunicazione alla Sede Apostolica', ['Sede Apostolica', 'morte del Vescovo', 'Amministratore diocesano'], text422, UNIT_ARTICLE_2, VATICAN_416_430_URL),
  canon(423, 'Unicità e incompatibilità dell’Amministratore', ['Amministratore diocesano', 'economo', 'consiglio per gli affari economici'], text423, UNIT_ARTICLE_2, VATICAN_416_430_URL),
  canon(424, 'Norme per l’elezione dell’Amministratore', ['Amministratore diocesano', 'elezione', 'cann. 165-178'], text424, UNIT_ARTICLE_2, VATICAN_416_430_URL),
  canon(425, 'Requisiti dell’Amministratore diocesano', ['Amministratore diocesano', 'requisiti', 'Metropolita'], text425, UNIT_ARTICLE_2, VATICAN_416_430_URL),
  canon(426, 'Poteri prima della nomina dell’Amministratore', ['sede vacante', 'Vicario generale', 'governo diocesano'], text426, UNIT_ARTICLE_2, VATICAN_416_430_URL),
  canon(427, 'Potestà dell’Amministratore diocesano', ['Amministratore diocesano', 'potestà', 'elezione'], text427, UNIT_ARTICLE_2, VATICAN_416_430_URL),
  canon(428, 'Divieto di innovazioni durante la sede vacante', ['sede vacante', 'innovazioni', 'curia diocesana'], text428, UNIT_ARTICLE_2, VATICAN_416_430_URL),
  canon(429, 'Obblighi di residenza e Messa pro populo', ['residenza', 'Messa pro populo', 'Amministratore diocesano'], text429, UNIT_ARTICLE_2, VATICAN_416_430_URL),
  canon(430, 'Cessazione dell’ufficio dell’Amministratore', ['Amministratore diocesano', 'cessazione', 'rinuncia'], text430, UNIT_ARTICLE_2, VATICAN_416_430_URL),
]
