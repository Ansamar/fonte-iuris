import type {CanonInput, CanonSegmentInput} from '../types'

const TITLE = 'cic-1983-book-2-part-3-section-1-title-2'
const CHAPTER_1 = `${TITLE}-chapter-1`
const CHAPTER_2_ARTICLE_1 = `${TITLE}-chapter-2-article-1`
const CHAPTER_2_ARTICLE_2 = `${TITLE}-chapter-2-article-2`
const CHAPTER_2_ARTICLE_3 = `${TITLE}-chapter-2-article-3`

const SOURCE_607 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_607_it.html'
const SOURCE_608_616 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_608-616_it.html'
const SOURCE_617_630 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_617-630_it.html'
const SOURCE_631_633 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_631-633_it.html'
const SOURCE_634_640 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_634-640_it.html'

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

function unitFor(number: number): string {
  if (number === 607) return TITLE
  if (number <= 616) return CHAPTER_1
  if (number <= 630) return CHAPTER_2_ARTICLE_1
  if (number <= 633) return CHAPTER_2_ARTICLE_2
  return CHAPTER_2_ARTICLE_3
}

function sourceFor(number: number): string {
  if (number === 607) return SOURCE_607
  if (number <= 616) return SOURCE_608_616
  if (number <= 630) return SOURCE_617_630
  if (number <= 633) return SOURCE_631_633
  return SOURCE_634_640
}

function canon(number: number, editorialTitle: string, keywords: string[], text: string): CanonInput {
  return {
    number,
    editorialTitle,
    keywords,
    structuralUnitCanonicalId: unitFor(number),
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
        sourceUrl: sourceFor(number),
        segments: segments(number, text),
      },
    ],
  }
}

const t607 = `§1. La vita religiosa, in quanto consacrazione di tutta la persona, manifesta nella Chiesa il mirabile connubio istituito da Dio, segno della vita futura. In tal modo il religioso porta a compimento la sua totale donazione come sacrificio offerto a Dio, e con questo l'intera sua esistenza diviene un ininterrotto culto a Dio nella carità.

§2. L'istituto religioso è una società i cui membri, secondo il diritto proprio, emettono i voti pubblici, perpetui oppure temporanei da rinnovarsi alla scadenza, e conducono vita fraterna in comunità.

§3. La testimonianza pubblica che i religiosi sono tenuti a rendere a Cristo e alla Chiesa comporta quella separazione dal mondo che è propria dell'indole e delle finalità di ciascun istituto.`

const t608 = `La comunità religiosa deve abitare in una casa legittimamente costituita, sotto l'autorità di un Superiore designato a norma del diritto. Le singole case devono avere almeno un oratorio, in cui si celebri e si conservi l'Eucaristia, in modo che sia veramente il centro della comunità.`

const t609 = `§1. Le case di un istituto religioso vengono erette dall'autorità competente secondo le costituzioni, previo consenso scritto del Vescovo diocesano.

§2. Per l'erezione di un monastero di monache si richiede inoltre la licenza della Sede Apostolica.`

const t610 = `§1. L'erezione di case si compie tenuta presente l'utilità della Chiesa e dell'istituto e assicurate le condizioni necessarie per garantire ai membri la possibilità di condurre regolarmente la vita religiosa secondo le finalità e lo spirito propri dell'istituto.

§2. Non si proceda all'erezione di una casa se prudentemente non si ritiene possibile provvedere in modo adeguato alle necessità dei membri.`

const t611 = `Il consenso del Vescovo diocesano per l'erezione di una casa religiosa implica il diritto:
1) di condurre una vita conforme all'indole e alle finalità proprie dell'istituto;
2) di esercitare le opere proprie dell'istituto, a norma del diritto, salve restando le condizioni poste nel consenso;
3) per gli istituti clericali, di avere una chiesa, salvo il disposto del can. 1215, §3, e di esercitarvi il ministero sacro, osservate le disposizioni del diritto.`

const t612 = `Per destinare una casa religiosa ad opere apostoliche differenti da quelle per cui fu costituita si richiede il consenso del Vescovo diocesano; non invece se si tratta di un cambiamento che, salve le leggi di fondazione, si riferisce solamente al regime interno e alla disciplina.`

const t613 = `§1. Una casa religiosa di canonici regolari o di monaci, sotto il governo e la cura del proprio Moderatore, è una casa sui iuris, a meno che le costituzioni non dicano altrimenti.

§2. Il Moderatore di una casa sui iuris è, per diritto, Superiore maggiore.`

const t614 = `I monasteri di monache associati a un istituto maschile mantengono la propria forma di vita e il proprio governo, secondo le costituzioni. I reciproci diritti ed obblighi siano determinati in modo che l'associazione possa giovare al bene spirituale.`

const t615 = `Quando un monastero sui iuris non ha, oltre al proprio Moderatore, un altro Superiore maggiore e non è associato a un istituto di religiosi in modo che il Superiore di questo abbia su quel monastero una vera potestà definita dalle costituzioni, tale monastero è affidato alla peculiare vigilanza del Vescovo diocesano a norma del diritto.`

const t616 = `§1. Una casa religiosa eretta legittimamente può essere soppressa dal Moderatore supremo a norma delle costituzioni, dopo avere consultato il Vescovo diocesano. Per i beni della casa soppressa deve provvedere il diritto proprio dell'istituto, nel rispetto della volontà dei fondatori o donatori e dei diritti legittimamente acquisiti.

§2. La soppressione dell'unica casa di un istituto è di competenza della Santa Sede, alla quale è pure riservato di disporre, nel caso, dei beni relativi.

§3. La soppressione di una casa sui iuris, di cui nel can. 613, spetta al capitolo generale, a meno che le costituzioni non stabiliscano altrimenti.

§4. La soppressione di un monastero sui iuris di monache spetta alla Sede Apostolica, osservato, per quanto riguarda i beni il disposto delle costituzioni.`

const t617 = `I Superiori adempiano il proprio incarico ed esercitino la propria potestà a norma del diritto universale e di quello proprio.`

const t618 = `I Superiori esercitino in spirito di servizio quella potestà che hanno ricevuto da Dio mediante il ministero della Chiesa. Docili perciò alla volontà di Dio nell'adempimento del proprio incarico, reggano i sudditi quali figli di Dio e, suscitando la loro volontaria obbedienza nel rispetto della persona umana, li ascoltino volentieri e promuovano altresì la loro concorde collaborazione per il bene dell'istituto e della Chiesa, ferma restando l'autorità loro propria di decidere e di comandare ciò che va fatto.`

const t619 = `I Superiori attendano sollecitamente al proprio ufficio e insieme con i religiosi loro affidati si adoperino per costruire in Cristo una comunità fraterna nella quale si ricerchi Dio e lo si ami sopra ogni cosa. Diano perciò essi stessi con frequenza ai religiosi il nutrimento della parola di Dio e li indirizzino alla celebrazione della sacra liturgia. Siano loro di esempio nel coltivare le virtù e nell'osservare le leggi e le tradizioni del proprio istituto; provvedano in modo conveniente a quanto loro personalmente occorre; visitino gli ammalati procurando loro con sollecitudine le cure necessarie, riprendano gli irrequieti, confortino i timidi, con tutti siano pazienti.`

const t620 = `Sono Superiori maggiori quelli che governano l'intero istituto, o una sua provincia, o una parte dell'istituto ad essa equiparata, o una casa sui iuris, e parimenti i loro rispettivi vicari. A questi si aggiungano l'Abate Primate e il Superiore di una congregazione monastica, i quali tuttavia non hanno tutta la potestà che il diritto universale attribuisce ai Superiori maggiori.`

const t621 = `Col nome di provincia si designa l'unione di più case che costituisce una parte immediata dell'istituto sotto il medesimo Superiore, ed è canonicamente eretta dalla legittima autorità.`

const t622 = `Il Moderatore supremo ha potestà, da esercitare secondo il diritto proprio, su tutte le province dell'istituto, su tutte le case e su tutti i membri; gli altri Superiori hanno questa potestà entro i limiti del proprio incarico.`

const t623 = `Per essere validamente nominati o eletti all'ufficio di Superiore si richiede un congruo spazio di tempo dopo la professione perpetua o definitiva, da determinarsi dal diritto proprio o, trattandosi di Superiori maggiori, dalle costituzioni.`

const t624 = `§1. I Superiori devono essere costituiti per un periodo di tempo determinato e conveniente secondo la natura e le esigenze dell'istituto, a meno che le costituzioni non dispongano diversamente per il Moderatore supremo e per i Superiori delle case sui iuris.

§2. Il diritto proprio provveda con norme adatte che i Superiori costituiti a tempo determinato non rimangano troppo a lungo senza interruzione in uffici di governo.

§3. Tuttavia durante il loro incarico possono essere rimossi dal loro ufficio o trasferiti ad un altro, per ragioni stabilite dal diritto proprio.`

const t625 = `§1. Il Moderatore supremo dell'istituto sia designato mediante elezione canonica a norma delle costituzioni.

§2. Alle elezioni del Superiore di un monastero sui iuris, di cui nel can. 615, e del Moderatore supremo di un istituto di diritto diocesano presiede il Vescovo della sede principale.

§3. Gli altri Superiori siano costituiti a norma delle costituzioni, in modo però che se vengono eletti necessitino della conferma del Superiore maggiore competente; se poi vengono nominati dal Superiore, si premetta una opportuna consultazione.`

const t626 = `I Superiori nel conferire uffici e i membri nelle elezioni osservino le norme del diritto universale e del diritto proprio, si astengano da qualunque abuso o da preferenza di persone e, null'altro avendo di mira che Dio e il bene dell'istituto, nominino o eleggano le persone che nel Signore riconoscono veramente degne e adatte. Inoltre nelle elezioni rifuggano dal procurare in qualunque modo voti per sé o per altri, direttamente o indirettamente.`

const t627 = `§1. I Superiori abbiano il proprio consiglio a norma delle costituzioni e nell'esercizio del proprio ufficio siano tenuti a valersi della sua opera.

§2. Oltre ai casi stabiliti dal diritto universale, il diritto proprio determini i casi in cui per procedere validamente è richiesto il consenso oppure il consiglio, a norma del can. 127.`

const t628 = `§1. I Superiori designati a tale incarico dal diritto proprio dell'istituto visitino con la frequenza stabilita le case e i religiosi loro affidati, attenendosi alle norme dello stesso diritto proprio.

§2. È diritto e dovere del Vescovo diocesano visitare, anche per quanto riguarda la disciplina religiosa:
1) i monasteri sui iuris, di cui nel can. 615;
2) le singole case di un istituto di diritto diocesano che sono nel suo territorio.

§3. I religiosi si comportino con fiducia nei confronti del visitatore e rispondano secondo verità nella carità alle domande da lui legittimamente poste; a nessuno poi è lecito distogliere in alcun modo i religiosi da un tale obbligo, né impedire altrimenti lo scopo della visita.`

const t629 = `I Superiori risiedano ciascuno nella propria casa, e non se ne allontanino se non a norma del diritto proprio.`

const t630 = `§1. I Superiori riconoscano ai religiosi la dovuta libertà per quanto riguarda il sacramento della penitenza e la direzione della coscienza, salva naturalmente la disciplina dell'istituto.

§2. I Superiori provvedano con premura, a norma del diritto proprio, che i religiosi abbiano disponibilità di confessori idonei, ai quali possano confessarsi con frequenza.

§3. Nei monasteri di monache, nelle case di formazione e nelle comunità laicali alquanto numerose vi siano, d'intesa con la comunità, confessori ordinari approvati dall'Ordinario del luogo, senza tuttavia alcun obbligo di presentarsi a loro.

§4. I Superiori non ascoltino le confessioni dei propri sudditi, a meno che questi non lo richiedano spontaneamente.

§5. I religiosi si rivolgano con fiducia ai Superiori, ai quali possono palesare l'animo proprio con spontanea libertà. È però vietato ai Superiori indurli in qualunque modo a manifestare loro la propria coscienza.`

const t631 = `§1. Il capitolo generale, che ha nell'istituto la suprema autorità a norma delle costituzioni, deve essere composto in modo da rappresentare l'intero istituto, per risultare vero segno della sua unità nella carità. Al capitolo compete soprattutto: tutelare il patrimonio dell'istituto di cui nel can. 578 e promuovere un adeguato rinnovamento che ad esso si armonizzi; eleggere il Moderatore supremo, trattare gli affari di maggiore importanza e inoltre emanare norme, che tutti sono tenuti ad osservare.

§2. La composizione e l'àmbito di potestà del capitolo siano definiti nelle costituzioni; il diritto proprio deve inoltre determinare il regolamento da osservarsi nella celebrazione del capitolo, specialmente per quanto riguarda le elezioni e la procedura dei lavori.

§3. Secondo le norme stabilite nel diritto proprio, non solo le province e le comunità locali, ma anche ciascun religioso può liberamente far pervenire al capitolo generale i propri desideri e proposte.`

const t632 = `Il diritto proprio determini con esattezza quanto riguarda gli altri capitoli dell'istituto e altre assemblee simili, cioè la loro natura e autorità, la composizione, il modo di procedere e il tempo della celebrazione.`

const t633 = `§1. Gli organismi di partecipazione o di consultazione adempiano fedelmente la funzione loro affidata a norma del diritto universale e proprio, ed esprimano nel modo loro proprio la sollecitudine e la partecipazione di tutti i membri in vista del bene dell'intero istituto o della comunità.

§2. Nell'istituire e nel servirsi di questi mezzi di partecipazione e di consultazione si proceda con saggia discrezione e il loro modo di agire sia conforme all'indole e alle finalità dell'istituto.`

const t634 = `§1. Gli istituti, le province e le case, in quanto persone giuridiche per il diritto stesso, hanno la capacità di acquistare, di possedere, di amministrare e alienare beni temporali, a meno che tale capacità non venga esclusa o ridotta dalle costituzioni.

§2. Evitino tuttavia ogni forma di lusso, di eccessivo guadagno e di accumulazione di beni.`

const t635 = `§1. I beni temporali degli istituti religiosi, in quanto beni ecclesiastici, sono retti dalle disposizioni del Libro V, I beni temporali della Chiesa, a meno che non sia espressamente disposto altro.

§2. Tuttavia ogni istituto stabilisca norme adatte circa l'uso e l'amministrazione dei beni, perché sia favorita, tutelata e manifestata la povertà che gli è propria.`

const t636 = `§1. In ogni istituto, e parimenti in ogni provincia retta da un Superiore maggiore, ci sia l'economo, costituito a norma del diritto proprio e distinto dal Superiore maggiore, per amministrare i beni sotto la direzione del rispettivo Superiore. Anche nelle comunità locali si istituisca, per quanto è possibile, un economo distinto dal Superiore locale.

§2. Nel tempo e nel modo stabiliti dal diritto proprio gli economi e gli altri amministratori presentino all'autorità competente il rendiconto dell'amministrazione da loro condotta.`

const t637 = `I monasteri sui iuris, di cui nel can. 615, devono presentare una volta all'anno il rendiconto amministrativo all'Ordinario del luogo; questi ha inoltre il diritto di prendere visione della conduzione degli affari economici di una casa religiosa di diritto diocesano.`

const t638 = `§1. Spetta al diritto proprio determinare, entro l'àmbito del diritto universale, quali sono gli atti che eccedono il limite e le modalità dell'amministrazione ordinaria, e stabilire ciò che è necessario per porre validamente un atto di amministrazione straordinaria.

§2. Le spese e gli atti giuridici di amministrazione ordinaria sono posti validamente, oltre che dai Superiori, anche dagli officiali a ciò designati dal diritto proprio, nei limiti del loro ufficio.

§3. Per la validità dell'alienazione, e di qualunque negozio da cui la situazione patrimoniale della persona giuridica potrebbe subire detrimento, si richiede la licenza scritta rilasciata dal Superiore competente con il consenso del suo consiglio. Se però si tratta di negozio che supera la somma fissata dalla Santa Sede per le singole regioni, come pure di donazioni votive fatte alla Chiesa, o di cose preziose per valore artistico o storico, si richiede inoltre la licenza della Santa Sede stessa.

§4. Per i monasteri sui iuris, di cui nel can. 615, e per gli istituti di diritto diocesano, è necessario anche il consenso scritto dell'Ordinario del luogo.`

const t639 = `§1. Se una persona giuridica ha contratto debiti e oneri, anche con licenza dei Superiori, è tenuta a risponderne in proprio.

§2. Se un religioso con licenza del Superiore ha contratto debiti e oneri sui beni propri, ne deve rispondere personalmente; se invece per mandato del Superiore ha concluso un negozio dell'istituto, è l'istituto che ne deve rispondere.

§3. Se un religioso li ha contratti senza alcuna licenza dei Superiori, è lui stesso, e non la persona giuridica, a doverne rispondere.

§4. Rimanga fermo tuttavia che si può sempre intentare un'azione contro colui il cui patrimonio si è in qualche misura avvantaggiato in seguito a quel contratto.

§5. I Superiori religiosi si astengano dall'autorizzare a contrarre debiti, a meno che non consti con certezza che l'interesse del debito si potrà coprire con le rendite ordinarie, e che l'intero capitale si potrà restituire entro un tempo non troppo lungo con una legittima ammortizzazione.`

const t640 = `Gli istituti, tenuto conto dei singoli luoghi, si adoperino per dare una testimonianza in certo modo collettiva di carità e di povertà e, nella misura delle proprie disponibilità, destinino qualcosa dei propri beni per le necessità della Chiesa e per contribuire a soccorrere i bisognosi.`

export const canons607to640: CanonInput[] = [
  canon(607, 'Natura della vita e dell’istituto religioso', ['vita religiosa', 'voti pubblici', 'vita fraterna'], t607),
  canon(608, 'Casa e comunità religiosa', ['casa religiosa', 'comunità', 'Eucaristia'], t608),
  canon(609, 'Erezione delle case religiose', ['erezione', 'casa religiosa', 'Vescovo diocesano'], t609),
  canon(610, 'Condizioni per l’erezione di una casa', ['erezione', 'necessità dei membri', 'finalità'], t610),
  canon(611, 'Effetti del consenso del Vescovo diocesano', ['consenso', 'opere', 'ministero sacro'], t611),
  canon(612, 'Mutamento della destinazione apostolica', ['opere apostoliche', 'consenso', 'Vescovo diocesano'], t612),
  canon(613, 'Casa religiosa sui iuris', ['casa sui iuris', 'Moderatore', 'Superiore maggiore'], t613),
  canon(614, 'Monasteri di monache associati', ['monasteri di monache', 'associazione', 'governo'], t614),
  canon(615, 'Monastero affidato alla vigilanza del Vescovo', ['monastero sui iuris', 'vigilanza', 'Vescovo diocesano'], t615),
  canon(616, 'Soppressione delle case religiose', ['soppressione', 'casa religiosa', 'beni'], t616),
  canon(617, 'Esercizio della potestà dei Superiori', ['Superiori', 'potestà', 'diritto proprio'], t617),
  canon(618, 'Potestà come servizio', ['Superiori', 'obbedienza', 'collaborazione'], t618),
  canon(619, 'Cura pastorale dei Superiori', ['Superiori', 'comunità fraterna', 'cura dei religiosi'], t619),
  canon(620, 'Superiori maggiori', ['Superiori maggiori', 'Moderatore', 'Abate Primate'], t620),
  canon(621, 'Provincia religiosa', ['provincia', 'case religiose', 'Superiore'], t621),
  canon(622, 'Potestà del Moderatore supremo', ['Moderatore supremo', 'potestà', 'istituto'], t622),
  canon(623, 'Requisito per l’ufficio di Superiore', ['Superiore', 'professione perpetua', 'nomina'], t623),
  canon(624, 'Durata dell’ufficio dei Superiori', ['Superiori', 'durata', 'rimozione'], t624),
  canon(625, 'Designazione dei Superiori', ['elezione canonica', 'Moderatore supremo', 'Superiore'], t625),
  canon(626, 'Conferimento degli uffici ed elezioni', ['elezioni', 'uffici', 'abusi'], t626),
  canon(627, 'Consiglio dei Superiori', ['consiglio', 'Superiori', 'consenso'], t627),
  canon(628, 'Visita canonica', ['visita', 'Vescovo diocesano', 'religiosi'], t628),
  canon(629, 'Residenza dei Superiori', ['Superiori', 'residenza', 'casa religiosa'], t629),
  canon(630, 'Libertà di coscienza e sacramento della penitenza', ['penitenza', 'coscienza', 'confessori'], t630),
  canon(631, 'Capitolo generale', ['capitolo generale', 'Moderatore supremo', 'patrimonio'], t631),
  canon(632, 'Altri capitoli e assemblee', ['capitoli', 'assemblee', 'diritto proprio'], t632),
  canon(633, 'Organismi di partecipazione e consultazione', ['partecipazione', 'consultazione', 'comunità'], t633),
  canon(634, 'Capacità patrimoniale degli istituti', ['beni temporali', 'persona giuridica', 'povertà'], t634),
  canon(635, 'Beni ecclesiastici e povertà', ['beni ecclesiastici', 'amministrazione', 'povertà'], t635),
  canon(636, 'Economo e rendiconto', ['economo', 'amministrazione', 'rendiconto'], t636),
  canon(637, 'Rendiconto all’Ordinario del luogo', ['rendiconto', 'Ordinario del luogo', 'monastero sui iuris'], t637),
  canon(638, 'Amministrazione straordinaria e alienazione', ['alienazione', 'amministrazione straordinaria', 'licenza'], t638),
  canon(639, 'Debiti e obbligazioni', ['debiti', 'obbligazioni', 'responsabilità'], t639),
  canon(640, 'Testimonianza collettiva di carità e povertà', ['carità', 'povertà', 'beni'], t640),
]
