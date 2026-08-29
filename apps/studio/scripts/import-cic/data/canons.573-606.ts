import type {CanonInput, CanonSegmentInput} from '../types'

const UNIT = 'cic-1983-book-2-part-3-section-1-title-1'
const SOURCE_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_573-606_it.html'

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

function amendedCanon579(originalItalian: string, currentLatin: string): CanonInput {
  return {
    number: 579,
    editorialTitle: 'Erezione di istituti di vita consacrata',
    keywords: ['Vescovo diocesano', 'erezione', 'Sede Apostolica', 'licenza'],
    structuralUnitCanonicalId: UNIT,
    status: 'amended',
    versions: [
      {
        versionId: 'cic-1983-can-579-it-1983',
        versionLabel: 'Versione originaria 1983',
        status: 'superseded',
        validFrom: '1983-11-27',
        validUntil: '2020-11-09',
        language: 'it',
        text: originalItalian,
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: 'CIC 1983, can. 579 — redazione originaria',
        sourceUrl: SOURCE_URL,
        segments: segments(579, originalItalian),
      },
      {
        versionId: 'cic-1983-can-579-la-2020',
        versionLabel: 'Testo autentico vigente dopo Authenticum charismatis',
        status: 'current',
        validFrom: '2020-11-10',
        language: 'la',
        text: currentLatin,
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: 'CIC 1983, can. 579',
        sourceUrl: SOURCE_URL,
        changeSummary:
          'Canone sostituito dal Motu Proprio Authenticum charismatis (1 novembre 2020), in vigore dal 10 novembre 2020.',
        segments: segments(579, currentLatin),
      },
    ],
  }
}

function amendedCanon604(originalItalian: string, currentItalian: string): CanonInput {
  return {
    number: 604,
    editorialTitle: 'Ordine delle vergini',
    keywords: ['ordine delle vergini', 'vita consacrata', 'associazioni', 'Vescovo diocesano'],
    structuralUnitCanonicalId: UNIT,
    status: 'amended',
    versions: [
      {
        versionId: 'cic-1983-can-604-it-1983',
        versionLabel: 'Versione originaria 1983',
        status: 'superseded',
        validFrom: '1983-11-27',
        validUntil: '2022-02-14',
        language: 'it',
        text: originalItalian,
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: 'CIC 1983, can. 604 — redazione originaria',
        sourceUrl: SOURCE_URL,
        segments: segments(604, originalItalian),
      },
      {
        versionId: 'cic-1983-can-604-it-2022',
        versionLabel: 'Versione vigente dopo Competentias quasdam decernere',
        status: 'current',
        validFrom: '2022-02-15',
        language: 'it',
        text: currentItalian,
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: 'CIC 1983, can. 604',
        sourceUrl: SOURCE_URL,
        changeSummary:
          'È stato aggiunto il §3 dal Motu Proprio Competentias quasdam decernere (11 febbraio 2022).',
        segments: segments(604, currentItalian),
      },
    ],
  }
}

const t573 = `§1. La vita consacrata mediante la professione dei consigli evangelici è una forma stabile di vita con la quale i fedeli, seguendo Cristo più da vicino per l'azione dello Spirito Santo, si dànno totalmente a Dio amato sopra ogni cosa. In tal modo, dedicandosi con nuovo e speciale titolo al suo onore, alla edificazione della Chiesa e alla salvezza del mondo, siano in grado di conseguire la perfezione della carità nel servizio del Regno di Dio e, divenuti nella Chiesa segno luminoso, preannuncino la gloria celeste.

§2. Negli istituti di vita consacrata, eretti canonicamente dalla competente autorità della Chiesa, una tale forma di vita viene liberamente assunta dai fedeli che mediante i voti, o altri vincoli sacri a seconda delle leggi proprie degli istituti, professano i consigli evangelici di castità, di povertà e di obbedienza e per mezzo della carità, alla quale essi conducono, si congiungono in modo speciale alla Chiesa e al suo mistero.`

const t574 = `§1. Lo stato di coloro che professano i consigli evangelici in tali istituti appartiene alla vita e alla santità della Chiesa e deve perciò nella Chiesa essere sostenuto e promosso da tutti.

§2. A questo stato alcuni fedeli sono da Dio chiamati con speciale vocazione, per usufruire di un dono peculiare nella vita della Chiesa e, secondo il fine e lo spirito del proprio istituto, giovare alla sua missione di salvezza.`

const t575 = `I consigli evangelici, fondati sull'insegnamento e sugli esempi di Cristo Maestro, sono un dono divino che la Chiesa ha ricevuto dal Signore e con la sua grazia sempre conserva.`

const t576 = `Spetta alla competente autorità della Chiesa interpretare i consigli evangelici, regolarne la prassi con leggi, costituirne forme stabili di vita mediante l'approvazione canonica e parimenti, per quanto le compete, curare che gli istituti crescano e si sviluppino secondo lo spirito dei fondatori e le sane tradizioni.`

const t577 = `Nella Chiesa sono moltissimi gli istituti di vita consacrata, che hanno differenti doni secondo la grazia che è stata loro concessa: essi infatti seguono più da vicino Cristo che prega, che annuncia il Regno di Dio, che fa del bene agli uomini o ne condivide la vita nel mondo, ma sempre compie la volontà del Padre.`

const t578 = `L'intendimento e i progetti dei fondatori, sanciti dalla competente autorità della Chiesa, relativamente alla natura, al fine, allo spirito e all'indole dell'istituto, nonché le sue sane tradizioni, cose tutte che costituiscono il patrimonio dell'istituto, devono essere da tutti fedelmente custoditi.`

const t579Original = `I Vescovi diocesani possono, ciascuno nel proprio territorio, erigere con formale decreto istituti di vita consacrata, purché sia stata consultata la Sede Apostolica.`
const t579CurrentLatin = `Episcopi dioecesani, in suo quisque territorio, instituta vitae consecratae formali decreto valide erigere possunt, praevia licentia Sedis Apostolicae scripto data.`

const t580 = `L'aggregazione di un istituto di vita consacrata ad un altro è riservata all'autorità competente dell'istituto aggregante, salva sempre l'autonomia canonica dell'istituto aggregato.`

const t581 = `Spetta all'autorità competente dell'istituto a norma delle costituzioni dividere l'istituto stesso in parti, con qualunque nome designate, erigerne di nuove, fondere quelle già costituite o circoscriverle in modo diverso.`

const t582 = `Sono riservate unicamente alla Sede Apostolica le fusioni e le unioni di istituti di vita consacrata, come anche le confederazioni e le federazioni.`

const t583 = `Le modifiche negli istituti di vita consacrata, che riguardino elementi già approvati dalla Sede Apostolica, senza la sua licenza non si possono effettuare.`

const t584 = `Sopprimere un istituto spetta unicamente alla Sede Apostolica, alla quale è pure riservato disporre dei relativi beni temporali.`

const t585 = `Spetta all'autorità competente dell'istituto la soppressione di parti dell'istituto stesso.`

const t586 = `§1. È riconosciuta ai singoli istituti una giusta autonomia di vita, specialmente di governo, mediante la quale abbiano nella Chiesa una propria disciplina e possano conservare integro il proprio patrimonio, di cui nel can. 578.

§2. È compito degli Ordinari dei luoghi conservare e tutelare tale autonomia.`

const t587 = `§1. Per custodire più fedelmente la vocazione e l'identità dei singoli istituti il codice fondamentale, o costituzioni, di ciascuno deve contenere, oltre a ciò che è stabilito da osservarsi nel can. 578, le norme fondamentali relative al governo dell'istituto e alla disciplina dei membri, alla loro incorporazione e formazione, nonché l'oggetto proprio dei vincoli sacri.

§2. Tale codice è approvato dalla competente autorità della Chiesa e soltanto con il suo consenso può essere modificato.

§3. In tale codice siano adeguatamente armonizzati gli elementi spirituali e quelli giuridici; tuttavia non si moltiplichino le norme senza necessità.

§4. Tutte le altre norme, stabilite dall'autorità competente dell'istituto, siano opportunamente raccolte in altri codici e potranno essere rivedute e adattate convenientemente secondo le esigenze dei luoghi e dei tempi.`

const t588 = `§1. Lo stato di vita consacrata, per natura sua, non è né clericale né laicale.

§2. Si dice istituto clericale quello che, secondo il fine o il progetto inteso dal fondatore, oppure in forza di una legittima tradizione, è governato da chierici, assume l'esercizio dell'ordine sacro e come tale viene riconosciuto dall'autorità della Chiesa.

§3. Si chiama invece istituto laicale quello che, riconosciuto come tale dalla Chiesa stessa, in forza della sua natura, dell'indole e del fine, ha un compito specifico, determinato dal fondatore o in base ad una legittima tradizione, che non comporta l'esercizio dell'ordine sacro.`

const t589 = `Un istituto di vita consacrata si dice di diritto pontificio se è stato eretto oppure approvato con decreto formale dalla Sede Apostolica; di diritto diocesano invece se, eretto dal Vescovo diocesano, non ha ottenuto dalla Sede Apostolica il decreto di approvazione.`

const t590 = `§1. Gli istituti di vita consacrata, in quanto dediti in modo speciale al servizio di Dio e di tutta la Chiesa, sono per un titolo peculiare soggetti alla suprema autorità della Chiesa stessa.

§2. I singoli membri sono tenuti ad obbedire al Sommo Pontefice, come loro supremo Superiore, anche a motivo del vincolo sacro di obbedienza.`

const t591 = `Per meglio provvedere al bene degli istituti e alle necessità dell'apostolato il Sommo Pontefice, in ragione del suo primato sulla Chiesa universale, può esimere istituti di vita consacrata dal governo degli Ordinari del luogo e sottoporli unicamente a sé o ad altra autorità ecclesiastica, in vista di un vantaggio comune.`

const t592 = `§1. Perché sia più efficacemente favorita la comunione degli istituti con la Sede Apostolica, ogni Moderatore supremo trasmetta alla medesima, nel modo e nel tempo da questa fissati, una breve relazione sullo stato e sulla vita dell'istituto.

§2. I Moderatori di ogni istituto provvedano a far conoscere i documenti della Santa Sede riguardanti i membri loro affidati, e ne curino l'osservanza.`

const t593 = `Fermo restando il disposto del can. 586, gli istituti di diritto pontificio sono soggetti in modo immediato ed esclusivo alla potestà della Sede Apostolica in quanto al regime interno e alla disciplina.`

const t594 = `L'istituto di diritto diocesano, fermo restando il can. 586, rimane sotto la speciale cura del Vescovo diocesano.`

const t595 = `§1. Spetta al Vescovo della sede principale approvare le costituzioni e confermare le modifiche ad esse legittimamente apportate, salvo ciò su cui fosse intervenuta la Sede Apostolica, e inoltre trattare gli affari di maggiore rilievo riguardanti l'intero istituto, quando superano l'ambito di potestà dell'autorità interna, non senza però avere consultato gli altri Vescovi diocesani, qualora l'istituto fosse esteso in più diocesi.

§2. Il Vescovo diocesano può concedere le dispense dalle costituzioni in casi particolari.`

const t596 = `§1. I Superiori e i capitoli degli istituti hanno sui membri quella potestà che è definita dal diritto universale e dalle costituzioni.

§2. Negli istituti religiosi clericali di diritto pontificio essi hanno inoltre la potestà ecclesiastica di governo, tanto per il foro esterno quanto per quello interno.

§3. Alla potestà di cui al §1 si applicano le disposizioni dei cann. 131, 133 e 137-144.`

const t597 = `§1. In un istituto di vita consacrata può essere ammesso ogni cattolico che abbia retta intenzione, che possegga le qualità richieste dal diritto universale e da quello proprio, e non sia vincolato da impedimento alcuno.

§2. Nessuno può essere ammesso senza adeguata preparazione.`

const t598 = `§1. Ogni istituto, attese l'indole e le finalità proprie, deve stabilire nelle costituzioni il modo in cui, secondo la propria forma di vita, si devono osservare i consigli evangelici di castità, di povertà e di obbedienza.

§2. Tutti i membri poi devono non solo osservare integralmente e con fedeltà i consigli evangelici, ma anche vivere secondo il diritto proprio dell'istituto, e in tal modo tendere alla perfezione del proprio stato.`

const t599 = `Il consiglio evangelico della castità assunto per il Regno dei cieli, che è segno della vita futura e fonte di una più ricca fecondità nel cuore indiviso, comporta l'obbligo della perfetta continenza nel celibato.`

const t600 = `Il consiglio evangelico della povertà, ad imitazione di Cristo che essendo ricco si è fatto povero per noi, oltre ad una vita povera di fatto e di spirito da condursi in operosa sobrietà che non indulga alle ricchezze terrene, comporta la dipendenza e la limitazione nell'usare e nel disporre dei beni, secondo il diritto proprio dei singoli istituti.`

const t601 = `Il consiglio evangelico dell'obbedienza, accolto con spirito di fede e di amore per seguire Cristo obbediente fino alla morte, obbliga a sottomettere la volontà ai Superiori legittimi, quali rappresentanti di Dio, quando comandano secondo le proprie costituzioni.`

const t602 = `La vita fraterna propria di ogni istituto, per la quale tutti i membri sono radunati in Cristo come una peculiare famiglia, sia definita in modo da riuscire per tutti un aiuto reciproco nel realizzare la vocazione propria di ciascuno. I membri poi, con la comunione fraterna radicata e fondata nella carità, siano esempio di riconciliazione universale in Cristo.`

const t603 = `§1. Oltre agli istituti di vita consacrata, la Chiesa riconosce la vita eremitica o anacoretica con la quale i fedeli, in una più rigorosa separazione dal mondo, nel silenzio della solitudine, nella assidua preghiera e penitenza, dedicano la propria vita alla lode di Dio e alla salvezza del mondo.

§2. L'eremita è riconosciuto dal diritto come dedicato a Dio nella vita consacrata se professa pubblicamente i tre consigli evangelici, confermandoli con voto o con altro vincolo sacro, nelle mani del Vescovo diocesano e sotto la sua guida osserva il programma di vita che gli è propria.`

const t604Original = `§1. A queste diverse forme di vita consacrata si aggiunge l'ordine delle vergini le quali, emettendo il santo proposito di seguire Cristo più da vicino, dal Vescovo diocesano sono consacrate a Dio secondo il rito liturgico approvato, si uniscono in mistiche nozze a Cristo Figlio di Dio e si dedicano al servizio della Chiesa.

§2. Le vergini possono riunirsi in associazioni per osservare più fedelmente il loro proposito e aiutarsi reciprocamente nello svolgere quel servizio alla Chiesa che è confacente al loro stato.`

const t604Current = `${t604Original}

§3. Il riconoscimento e l’erezione di tali associazioni a livello diocesano compete al Vescovo diocesano, nell’ambito del suo territorio, a livello nazionale compete alla Conferenza episcopale, nell’ambito del proprio territorio.`

const t605 = `L'approvazione di nuove forme di vita consacrata è riservata unicamente alla Sede Apostolica. I Vescovi diocesani però si adoperino per discernere i nuovi doni di vita consacrata che lo Spirito Santo affida alla Chiesa, aiutino coloro che li promuovono ad esprimere i progetti nel modo migliore e li tutelino con statuti adatti, utilizzando soprattutto le norme generali contenute in questa parte.`

const t606 = `Quanto si stabilisce per gli istituti di vita consacrata e per i loro membri vale a pari diritto per l'uno e per l'altro sesso, a meno che non risulti altrimenti dal contesto o dalla natura delle cose.`

export const canons573to606: CanonInput[] = [
  canon(573, 'Natura della vita consacrata', ['vita consacrata', 'consigli evangelici', 'voti'], t573),
  canon(574, 'Vita consacrata e santità della Chiesa', ['vita consacrata', 'vocazione', 'missione'], t574),
  canon(575, 'Origine divina dei consigli evangelici', ['consigli evangelici', 'Cristo', 'dono divino'], t575),
  canon(576, 'Competenza dell’autorità ecclesiastica', ['autorità ecclesiastica', 'consigli evangelici', 'approvazione canonica'], t576),
  canon(577, 'Pluralità dei carismi', ['istituti', 'carismi', 'Cristo'], t577),
  canon(578, 'Patrimonio dell’istituto', ['fondatori', 'patrimonio', 'tradizioni'], t578),
  amendedCanon579(t579Original, t579CurrentLatin),
  canon(580, 'Aggregazione tra istituti', ['aggregazione', 'autonomia canonica', 'istituti'], t580),
  canon(581, 'Divisione e circoscrizione dell’istituto', ['divisione', 'parti', 'costituzioni'], t581),
  canon(582, 'Fusioni, unioni e federazioni', ['Sede Apostolica', 'fusioni', 'federazioni'], t582),
  canon(583, 'Modifiche di elementi approvati', ['modifiche', 'Sede Apostolica', 'licenza'], t583),
  canon(584, 'Soppressione dell’istituto', ['soppressione', 'Sede Apostolica', 'beni temporali'], t584),
  canon(585, 'Soppressione di parti dell’istituto', ['soppressione', 'parti', 'autorità competente'], t585),
  canon(586, 'Giusta autonomia degli istituti', ['autonomia', 'governo', 'Ordinari'], t586),
  canon(587, 'Codice fondamentale e costituzioni', ['costituzioni', 'diritto proprio', 'formazione'], t587),
  canon(588, 'Istituti clericali e laicali', ['istituto clericale', 'istituto laicale', 'ordine sacro'], t588),
  canon(589, 'Istituti di diritto pontificio e diocesano', ['diritto pontificio', 'diritto diocesano', 'Sede Apostolica'], t589),
  canon(590, 'Soggezione alla suprema autorità della Chiesa', ['Sommo Pontefice', 'obbedienza', 'suprema autorità'], t590),
  canon(591, 'Esenzione dal governo degli Ordinari', ['esenzione', 'Sommo Pontefice', 'Ordinari'], t591),
  canon(592, 'Comunione con la Sede Apostolica', ['Sede Apostolica', 'Moderatore supremo', 'relazione'], t592),
  canon(593, 'Istituti di diritto pontificio', ['diritto pontificio', 'Sede Apostolica', 'regime interno'], t593),
  canon(594, 'Istituti di diritto diocesano', ['diritto diocesano', 'Vescovo diocesano', 'cura'], t594),
  canon(595, 'Competenza del Vescovo della sede principale', ['costituzioni', 'Vescovo diocesano', 'dispensa'], t595),
  canon(596, 'Potestà dei Superiori e dei capitoli', ['Superiori', 'capitoli', 'potestà di governo'], t596),
  canon(597, 'Requisiti per l’ammissione', ['ammissione', 'cattolico', 'preparazione'], t597),
  canon(598, 'Osservanza dei consigli evangelici', ['castità', 'povertà', 'obbedienza'], t598),
  canon(599, 'Consiglio evangelico della castità', ['castità', 'celibato', 'continenza'], t599),
  canon(600, 'Consiglio evangelico della povertà', ['povertà', 'beni', 'sobrietà'], t600),
  canon(601, 'Consiglio evangelico dell’obbedienza', ['obbedienza', 'Superiori', 'volontà'], t601),
  canon(602, 'Vita fraterna', ['vita fraterna', 'comunione', 'carità'], t602),
  canon(603, 'Vita eremitica o anacoretica', ['eremita', 'vita eremitica', 'Vescovo diocesano'], t603),
  amendedCanon604(t604Original, t604Current),
  canon(605, 'Nuove forme di vita consacrata', ['nuove forme', 'Sede Apostolica', 'discernimento'], t605),
  canon(606, 'Parità normativa tra i sessi', ['membri', 'sesso', 'parità normativa'], t606),
]
