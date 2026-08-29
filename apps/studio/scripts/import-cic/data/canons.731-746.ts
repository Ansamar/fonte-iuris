import type {CanonInput, CanonSegmentInput} from '../types'

const UNIT = 'cic-1983-book-2-part-3-section-2'
const SOURCE_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_731-746_it.html'

function segments(canon: number, text: string): CanonSegmentInput[] {
  const paragraphMatches = [...text.matchAll(/(^|\n\n)§(\d+)\./g)]
  const result: CanonSegmentInput[] = []

  if (paragraphMatches.length === 0) return result

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

const texts: Record<number, string> = {
  731: `§1. Agli istituti di vita consacrata si aggiungono le società di vita apostolica i cui membri, senza voti religiosi, perseguono il fine apostolico proprio della società e conducendo vita fraterna in comunità secondo un proprio stile, tendono alla perfezione della carità mediante l'osservanza delle costituzioni.\n\n§2. Fra queste vi sono società i cui membri assumono i consigli evangelici con qualche vincolo definito dalle costituzioni.`,
  732: `Quanto è stabilito nei cann. 578-597 e 606 si applica anche alle società di vita apostolica, tuttavia nel rispetto della natura di ciascuna di esse; alle società di cui nel can. 731, §2, si applicano anche i cann. 598-602.`,
  733: `§1. Una casa viene eretta e una comunità locale viene costituita dall'autorità competente della società previo consenso scritto del Vescovo diocesano, il quale deve essere anche consultato quando si tratta della soppressione di queste.\n\n§2. Il consenso per l'erezione di una casa comporta il diritto di avere almeno un oratorio, nel quale sia celebrata e custodita la santissima Eucaristia.`,
  734: `Il governo della società è definito dalle costituzioni, osservati, secondo la natura delle singole società, i cann. 617-633.`,
  735: `§1. L'ammissione dei membri, il periodo di prova, l'incorporazione e la formazione vengono determinati dal diritto proprio di ogni società.\n\n§2. Per l'ammissione nella società si osservino le condizioni stabilite nei cann. 642-645.\n\n§3. Il diritto proprio deve determinare la ratio per la prova e per la formazione, in consonanza con gli scopi e l'indole della società, particolarmente in campo dottrinale, spirituale, apostolico, cosicché i membri, riconoscendo la vocazione divina, siano convenientemente preparati alla missione e alla vita della società.`,
  736: `§1. Nelle società clericali i chierici sono incardinati nella società stessa, a meno che le costituzioni non dicano altrimenti.\n\n§2. Per quanto riguarda il «piano degli studi» e la recezione degli ordini, si seguano le norme previste per i chierici secolari, fermo restando tuttavia il §1.`,
  737: `L'incorporazione comporta da parte dei membri gli obblighi e i diritti definiti nelle costituzioni, da parte della società l'impegno di guidare i membri a realizzare la propria vocazione secondo le costituzioni.`,
  738: `§1. Tutti i membri sono soggetti ai propri Moderatori a norma delle costituzioni in ciò che riguarda la vita interna e la disciplina della società.\n\n§2. Sono soggetti inoltre al Vescovo diocesano in ciò che riguarda il culto pubblico, la cura delle anime e le altre attività apostoliche, attesi i cann. 679-683.\n\n§3. Le relazioni tra il membro incardinato nella diocesi e il proprio Vescovo sono definite dalle costituzioni o da particolari convenzioni.`,
  739: `I membri, oltre agli obblighi che secondo le costituzioni li toccano in quanto tali, sono tenuti agli obblighi comuni ai chierici, a meno che non risulti altrimenti dalla natura delle cose o dal contesto.`,
  740: `I membri devono abitare nella casa o nella comunità legittimamente costituita e osservare la vita in comune a norma del diritto proprio; da questo sono pure regolate le assenze dalla casa o dalla comunità.`,
  741: `§1. Le società e, se non è detto altrimenti nelle costituzioni, le loro parti e le case, sono persone giuridiche e in quanto tali hanno la capacità di acquistare, possedere, amministrare e alienare beni temporali a norma delle disposizioni del Libro V, I beni temporali della Chiesa, dei cann. 636, 638 e 639, nonché del diritto proprio.\n\n§2. Anche i membri, a norma del diritto proprio, hanno la capacità di acquistare, possedere e amministrare beni temporali e di disporne, ma tutto ciò che loro proviene in considerazione della società è acquisito per la società.`,
  742: `L'uscita e la dimissione di un membro non ancora incorporati in modo definitivo sono regolate dalle costituzioni di ciascuna società.`,
  743: `Un membro incorporato definitivamente può ottenere dal Moderatore supremo, con il consenso del suo consiglio l'indulto di lasciare la società, con la cessazione dei diritti e degli obblighi derivanti dall'incorporazione, fermo restando il disposto del can. 693, a meno che tale concessione non sia a norma delle costituzioni riservata alla Santa Sede.`,
  744: `§1. È parimenti riservato al Moderatore supremo, con il consenso del suo consiglio, di concedere a un membro incorporato definitivamente la licenza di passare ad un'altra società di vita apostolica, venendo frattanto sospesi i diritti e gli obblighi della propria società, fermo restando tuttavia il diritto di potervi ritornare prima dell'incorporazione definitiva nella nuova società.\n\n§2. Per il passaggio ad un istituto di vita consacrata, o da questo ad una società di vita apostolica, si richiede la licenza della Santa Sede, alle cui disposizioni ci si deve attenere.`,
  745: `Il Moderatore supremo con il consenso del proprio consiglio può concedere a un membro incorporato in modo definitivo l'indulto di vivere fuori della società, tuttavia non oltre tre anni, rimanendo sospesi i diritti e gli obblighi incompatibili con la sua nuova condizione; questi però rimane sotto la cura dei Moderatori. Se si tratta di un chierico, si richiede inoltre il consenso dell'Ordinario del luogo in cui deve dimorare, rimanendo anche sotto la sua cura e dipendenza.`,
  746: `Per la dimissione di un membro definitivamente incorporato si osservino, con gli opportuni adattamenti, i cann. 694-704.`,
}

export const canons731to746: CanonInput[] = [
  canon(731, 'Natura delle società di vita apostolica', ['società di vita apostolica', 'vita fraterna', 'costituzioni'], texts[731]),
  canon(732, 'Norme applicabili alle società di vita apostolica', ['norme comuni', 'vita consacrata', 'consigli evangelici'], texts[732]),
  canon(733, 'Erezione e soppressione di case e comunità', ['casa', 'comunità locale', 'Vescovo diocesano', 'oratorio'], texts[733]),
  canon(734, 'Governo della società', ['governo', 'costituzioni', 'Moderatori'], texts[734]),
  canon(735, 'Ammissione, prova, incorporazione e formazione', ['ammissione', 'prova', 'incorporazione', 'formazione'], texts[735]),
  canon(736, 'Incardinazione e formazione dei chierici', ['incardinazione', 'chierici', 'ordini sacri', 'studi'], texts[736]),
  canon(737, 'Effetti dell’incorporazione', ['incorporazione', 'diritti', 'obblighi', 'vocazione'], texts[737]),
  canon(738, 'Dipendenza dai Moderatori e dal Vescovo diocesano', ['Moderatori', 'Vescovo diocesano', 'disciplina', 'apostolato'], texts[738]),
  canon(739, 'Obblighi comuni ai chierici', ['chierici', 'obblighi', 'costituzioni'], texts[739]),
  canon(740, 'Vita comune e assenze', ['vita comune', 'casa', 'comunità', 'assenze'], texts[740]),
  canon(741, 'Personalità giuridica e beni temporali', ['persona giuridica', 'beni temporali', 'amministrazione'], texts[741]),
  canon(742, 'Uscita e dimissione prima dell’incorporazione definitiva', ['uscita', 'dimissione', 'incorporazione'], texts[742]),
  canon(743, 'Indulto di lasciare la società', ['indulto', 'uscita', 'Moderatore supremo'], texts[743]),
  canon(744, 'Passaggio ad altra società o istituto', ['passaggio', 'società di vita apostolica', 'istituto di vita consacrata'], texts[744]),
  canon(745, 'Indulto di vivere fuori della società', ['indulto', 'assenza', 'Moderatore supremo', 'Ordinario'], texts[745]),
  canon(746, 'Dimissione del membro incorporato definitivamente', ['dimissione', 'incorporazione definitiva', 'procedura'], texts[746]),
]
