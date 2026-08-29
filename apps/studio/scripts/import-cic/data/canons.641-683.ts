import type {CanonInput, CanonSegmentInput} from '../types'

const TITLE = 'cic-1983-book-2-part-3-section-1-title-2'
const CHAPTER_3_ARTICLE_1 = `${TITLE}-chapter-3-article-1`
const CHAPTER_3_ARTICLE_2 = `${TITLE}-chapter-3-article-2`
const CHAPTER_3_ARTICLE_3 = `${TITLE}-chapter-3-article-3`
const CHAPTER_3_ARTICLE_4 = `${TITLE}-chapter-3-article-4`
const CHAPTER_4 = `${TITLE}-chapter-4`
const CHAPTER_5 = `${TITLE}-chapter-5`

const SOURCE_641_645 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_641-645_it.html'
const SOURCE_646_653 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_646-653_it.html'
const SOURCE_654_658 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_654-658_it.html'
const SOURCE_659_661 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_659-661_it.html'
const SOURCE_662_672 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_662-672_it.html'
const SOURCE_673_683 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_673-683_it.html'

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
  if (number <= 645) return CHAPTER_3_ARTICLE_1
  if (number <= 653) return CHAPTER_3_ARTICLE_2
  if (number <= 658) return CHAPTER_3_ARTICLE_3
  if (number <= 661) return CHAPTER_3_ARTICLE_4
  if (number <= 672) return CHAPTER_4
  return CHAPTER_5
}

function sourceFor(number: number): string {
  if (number <= 645) return SOURCE_641_645
  if (number <= 653) return SOURCE_646_653
  if (number <= 658) return SOURCE_654_658
  if (number <= 661) return SOURCE_659_661
  if (number <= 672) return SOURCE_662_672
  return SOURCE_673_683
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

const t641 = `Il diritto di ammettere i candidati al noviziato spetta ai Superiori maggiori a norma del diritto proprio.`

const t642 = `I Superiori ammettano con la più attenta cura soltanto coloro che, oltre all'età richiesta, abbiano salute, indole adatta e la maturità sufficiente per assumere il genere di vita proprio dell'istituto; la salute, l'indole e la maturità siano anche verificati, all'occorrenza, da esperti, fermo restando il disposto del can. 220.`

const t643 = `§1. È ammesso invalidamente al noviziato:
1) chi non ha ancora compiuto 17 anni di età;
2) il coniuge, durante il matrimonio;
3) chi è attualmente legato con un vincolo sacro a qualche istituto di vita consacrata o è stato incorporato in una società di vita apostolica, salvo il disposto del can. 684;
4) chi entra nell'istituto indotto da violenza, da grave timore o dolo, o colui che il Superiore accetta, indotto allo stesso modo;
5) chi ha nascosto di essere stato incorporato in un istituto di vita consacrata o in una società di vita apostolica.

§2. Il diritto proprio può stabilire altri impedimenti, anche per la validità dell'ammissione, o porre condizioni.`

const t644 = `I Superiori non ammettano al noviziato chierici secolari senza consultare il loro proprio Ordinario, né persone gravate di debiti e incapaci di estinguerli.`

const t645 = `§1. I candidati, prima di essere ammessi al noviziato, devono produrre un attestato di battesimo, di confermazione, nonché di stato libero.

§2. Se si tratta di ammettere chierici, o persone che furono ammesse in un altro istituto di vita consacrata, o in una società di vita apostolica o in seminario, si richiede inoltre l'attestato rilasciato rispettivamente dall'Ordinario del luogo, o dal Superiore maggiore dell'istituto o della società, oppure dal rettore del seminario.

§3. Il diritto proprio può esigere altri documenti circa l'idoneità richiesta per i candidati e l'immunità da impedimenti.

§4. I Superiori, se loro pare necessario, possono richiedere altre informazioni, anche sotto segreto.`

const t646 = `Il noviziato, con il quale si inizia la vita nell'istituto, è ordinato a far sì che i novizi possano prendere meglio coscienza della vocazione divina, e specificamente di quella propria dell'istituto, sperimentarne lo stile di vita, formarsi mente e cuore secondo il suo spirito; e al tempo stesso siano verificate le loro intenzioni e la loro idoneità.`

const t647 = `§1. L'erezione della casa di noviziato, il suo trasferimento e la soppressione si compiano mediante un decreto scritto del Moderatore supremo con il consenso del suo consiglio.

§2. Il noviziato per essere valido deve essere compiuto in una casa regolarmente designata allo scopo. In casi particolari, e a modo di eccezione, su concessione del Moderatore supremo con il consenso del suo consiglio, un candidato può fare il noviziato in un'altra casa dell'istituto sotto la guida di un religioso sperimentato, che faccia le veci del maestro dei novizi.

§3. Il Superiore maggiore può permettere che il gruppo dei novizi, per determinati periodi di tempo, dimori in un'altra casa dell'istituto, da lui stesso designata.`

const t648 = `§1. Per essere valido il noviziato deve comprendere dodici mesi, da trascorrere nella stessa comunità del noviziato, fermo restando il disposto del can. 647, §3.

§2. Per integrare la formazione dei novizi le costituzioni possono stabilire, oltre al tempo di cui al §1, uno o più periodi di esercitazioni apostoliche, da compiersi fuori dalla comunità del noviziato.

§3. Il noviziato non sia prolungato oltre i due anni.`

const t649 = `§1. Salvo il disposto dei cann. 647, §3 e 648, §2, una assenza dalla casa del noviziato che superi i tre mesi, continui o discontinui, rende invalido il noviziato. Una assenza che superi i quindici giorni deve essere ricuperata.

§2. Con il permesso del Superiore maggiore competente la prima professione può essere anticipata, non oltre quindici giorni.`

const t650 = `§1. Lo scopo del noviziato esige che i novizi siano formati sotto la direzione del maestro, secondo un regolamento di formazione da determinarsi dal diritto proprio.

§2. La direzione dei novizi, sotto l'autorità dei Superiori maggiori, è riservata unicamente al maestro.`

const t651 = `§1. Il maestro dei novizi deve essere un membro dell'istituto che abbia emesso i voti perpetui e sia stato legittimamente designato.

§2. Al maestro si possono assegnare, quando occorre, degli aiutanti i quali devono a lui sottostare per quanto riguarda la direzione del noviziato e la ratio della formazione.

§3. Alla formazione dei novizi devono essere preposti religiosi accuratamente preparati, i quali possano assolvere il loro compito in modo efficace e stabile, senza essere distolti da altri impegni.`

const t652 = `§1. Spetta al maestro e ai suoi aiutanti discernere e verificare la vocazione dei novizi e gradatamente formarli a vivere la vita di perfezione secondo le norme proprie dell'istituto.

§2. I novizi devono essere accompagnati nel coltivare le virtù umane e cristiane; introdotti in un più impegnativo cammino di perfezione mediante l'orazione e il rinnegamento di sé; guidati alla contemplazione del mistero della salvezza e alla lettura e meditazione delle sacre Scritture; preparati a rendere culto a Dio nella sacra liturgia; formati alle esigenze della vita consacrata a Dio e agli uomini in Cristo attraverso la pratica dei consigli evangelici; istruiti infine sull'indole e lo spirito, le finalità e la disciplina, la storia e la vita dell'istituto, ed educati all'amore verso la Chiesa e i suoi sacri Pastori.

§3. I novizi, consapevoli della propria responsabilità, collaborino attivamente con il proprio maestro in modo da rispondere fedelmente alla grazia della vocazione divina.

§4. I membri dell'istituto si impegnino nel cooperare alla formazione dei novizi, per la parte che loro spetta, con l'esempio della vita e con la preghiera.

§5. Il tempo di noviziato, di cui al can. 648, §1, sia dedicato all'opera di formazione vera e propria; perciò i novizi non siano occupati in studi o incarichi non direttamente finalizzati a tale formazione.`

const t653 = `§1. Il novizio può liberamente lasciare l'istituto, e d'altra parte l'autorità competente dell'istituto può dimetterlo.

§2. Compiuto il noviziato, se il novizio viene giudicato idoneo, sia ammesso alla professione temporanea, altrimenti sia dimesso; se rimane qualche dubbio sulla sua idoneità il Superiore maggiore può prolungare il periodo di prova a norma del diritto proprio, ma non oltre sei mesi.`

const t654 = `Nella professione religiosa i membri assumono con voto pubblico l'obbligo di osservare i tre consigli evangelici, sono consacrati a Dio mediante il ministero della Chiesa e vengono incorporati nell'istituto con i diritti e i doveri definiti giuridicamente.`

const t655 = `La professione temporanea venga emessa per un periodo di tempo, determinato dal diritto proprio, che non deve essere inferiore a tre anni, né superiore a sei.`

const t656 = `Per la validità della professione temporanea si richiede che:
1) chi la vuole emettere abbia compiuto almeno 18 anni di età;
2) il noviziato sia stato portato a termine validamente;
3) ci sia l'ammissione, fatta liberamente da parte del Superiore competente, con il voto del suo consiglio a norma del diritto;
4) la professione sia espressa, e venga emessa senza che ci sia violenza, timore grave o inganno;
5) sia ricevuta dal legittimo Superiore, personalmente o per mezzo di altri.`

const t657 = `§1. Allo scadere del tempo per il quale fu emessa la professione il religioso che lo richiede spontaneamente ed è ritenuto idoneo sia ammesso alla rinnovazione della professione o alla professione perpetua; altrimenti deve lasciare l'istituto.

§2. Se però pare opportuno, il tempo della professione temporanea può essere prolungato dal Superiore competente secondo il diritto proprio, facendo tuttavia in modo che il periodo in cui il religioso è vincolato dai voti temporanei non superi complessivamente la durata di nove anni.

§3. La professione perpetua può essere anticipata per giusta causa, ma non oltre un trimestre.`

const t658 = `Oltre alle condizioni di cui al can. 656, nn. 3, 4 e 5 e ad altre apposte dal diritto proprio, per la validità della professione perpetua si richiede:
1) età di almeno 21 anni compiuti;
2) la previa professione temporanea di almeno tre anni, salvo il disposto del can. 657, §3.`

const t659 = `§1. In ogni istituto, dopo la prima professione, si continui la formazione di tutti i membri perché possano condurre più integralmente la vita propria dell'istituto e rendersi meglio idonei a realizzarne la missione.

§2. Pertanto il diritto proprio deve stabilire la ratio e la durata di questa formazione, tenendo presenti le necessità della Chiesa e le condizioni delle persone e dei tempi, secondo quanto è richiesto dalle finalità e l'indole dell'istituto.

§3. La formazione dei membri che si preparano a ricevere gli ordini sacri è regolata dal diritto universale e dal "piano degli studi" proprio dell'istituto.`

const t660 = `§1. La formazione deve essere sistematica, adeguata alla recettività dei membri, spirituale e apostolica, dottrinale e insieme pratica, e portare anche al conseguimento dei titoli convenienti, sia ecclesiastici sia civili, secondo l'opportunità.

§2. Durante il periodo di questa formazione non si affidino ai religiosi incarichi e attività che la ostacolano.`

const t661 = `Per tutta la vita i religiosi proseguano assiduamente la propria formazione spirituale, dottrinale e pratica; i Superiori ne procurino loro i mezzi e il tempo.`

const t662 = `I religiosi abbiano come suprema regola di vita la sequela di Cristo proposta dal Vangelo ed espressa nelle costituzioni del proprio istituto.`

const t663 = `§1. Primo e particolare dovere di tutti i religiosi deve essere la contemplazione delle realtà divine e la costante unione con Dio nell'orazione.

§2. I religiosi per quanto è possibile partecipino ogni giorno al Sacrificio eucaristico, ricevano il Corpo santissimo di Cristo e adorino lo stesso Signore presente nel Sacramento.

§3. Attendano alla lettura della sacra Scrittura e all'orazione mentale, alla dignitosa celebrazione della liturgia delle ore secondo le disposizioni del diritto proprio, fermo restando per i chierici l'obbligo di cui nel can. 276, §2, n. 3 e compiano gli altri esercizi di pietà.

§4. Onorino con culto speciale, anche con la pratica del rosario mariano, la Vergine Madre di Dio, modello e patrona di ogni vita consacrata.

§5. Osservino fedelmente i tempi annuali di sacro ritiro.`

const t664 = `I religiosi siano perseveranti nella conversione dell'animo a Dio, attendano anche all'esame quotidiano di coscienza e si accostino con frequenza al sacramento della penitenza.`

const t665 = `§1. I religiosi devono abitare nella propria casa religiosa osservando la vita comune e non possono assentarsene senza licenza del proprio Superiore. Se poi si tratta di una assenza prolungata, il Superiore maggiore, con il consenso del suo consiglio e per giusta causa, può concedere a un religioso di vivere fuori della casa dell'istituto, ma non oltre un anno, a meno che ciò non sia per motivo di infermità, di studio o di apostolato da svolgere a nome dell'istituto.

§2. Il religioso che si allontana illegittimamente dalla casa religiosa, con l'intenzione di sottrarsi alla potestà dei Superiori, deve essere da questi sollecitamente ricercato e aiutato, perché ritorni e perseveri nella propria vocazione.`

const t666 = `Nel fare uso dei mezzi della comunicazione sociale si osservi la necessaria discrezione e si eviti tutto quanto nuoce alla propria vocazione e mette in pericolo la castità di una persona consacrata.`

const t667 = `§1. In ogni casa si osservi la clausura adeguata all'indole e alla missione dell'istituto, secondo le determinazioni del diritto proprio, facendo in modo che ci sia sempre una parte della casa riservata esclusivamente ai religiosi.

§2. Nei monasteri di vita contemplativa si dovrà osservare una più rigorosa disciplina di clausura.

§3. I monasteri di monache interamente ordinati alla vita contemplativa devono osservare la clausura papale, cioè conforme alle norme date dalla Sede Apostolica. Tutti gli altri monasteri di monache osservino la clausura adatta all'indole propria e definita dalle costituzioni.

§4. Il Vescovo diocesano ha la facoltà di entrare, per giusta causa, nella clausura dei monasteri di monache situati nella sua diocesi e può anche permettere, per causa grave e con il consenso della Superiora, che altri siano ammessi nella clausura e che le monache stesse ne escano per il tempo strettamente necessario.`

const t668 = `§1. Avanti la prima professione i membri cedano l'amministrazione dei propri beni a chi preferiscono e, se le costituzioni non stabiliscono altrimenti, liberamente dispongano del loro uso e usufrutto. Essi devono poi, almeno prima della professione perpetua, redigere il testamento, che risulti valido anche secondo il diritto civile.

§2. Per modificare queste disposizioni per giusta causa, come anche per porre qualunque atto relativo ai beni temporali, devono avere la licenza del Superiore competente a norma del diritto proprio.

§3. Tutto ciò che un religioso acquista con la propria industriosità o a motivo dell'istituto, lo acquista per l'istituto stesso. Ciò che riceve come pensione, sussidio o assicurazione, a qualunque titolo, è acquisito per l'istituto, a meno che non sia disposto altrimenti nel diritto proprio.

§4. Chi per la natura dell'istituto deve compiere la rinuncia radicale ai propri beni la rediga, possibilmente in forma valida anche secondo il diritto civile, prima della professione perpetua, con valore decorrente dal giorno della professione stessa. Ugualmente proceda il professo di voti perpetui che, a norma del diritto proprio, volesse rinunciare a tutti i suoi beni o a parte di essi, con licenza del Moderatore supremo.

§5. Il professo che per la natura dell'istituto ha compiuto la rinuncia radicale ai suoi beni perde la capacità di acquistare e di possedere, di conseguenza pone invalidamente ogni atto contrario al voto di povertà. I beni, che ricevesse dopo tale rinuncia, vanno all'istituto, a norma del diritto proprio.`

const t669 = `§1. I religiosi portino l'abito dell'istituto, fatto a norma del diritto proprio, quale segno della loro consacrazione e testimonianza di povertà.

§2. I religiosi chierici di un istituto che non ha abito proprio adotteranno l'abito clericale a norma del can. 284.`

const t670 = `L'istituto ha il dovere di procurare ai membri quanto, a norma delle costituzioni, è loro necessario per realizzare il fine della propria vocazione.`

const t671 = `Il religioso non si assuma incarichi né uffici fuori dal proprio istituto senza la licenza del legittimo Superiore.`

const t672 = `I religiosi sono obbligati dalle disposizioni dei cann. 277, 285, 286, 287 e 289, e i religiosi chierici inoltre dalle disposizioni del can. 279, §2; negli istituti laicali di diritto pontificio, la licenza di cui al can. 285, §4 può essere concessa dal proprio Superiore maggiore.`

const t673 = `L'apostolato di tutti i religiosi consiste in primo luogo nella loro testimonianza di vita consacrata, che essi sono tenuti ad alimentare con l'orazione e con la penitenza.`

const t674 = `Gli istituti interamente dediti alla contemplazione occupano sempre un posto eminente nel Corpo mistico di Cristo: essi infatti offrono a Dio un eccelso sacrificio di lode, arricchiscono il popolo di Dio con i frutti preziosi della santità, mentre con il proprio esempio lo stimolano e con una misteriosa fecondità apostolica lo estendono. Perciò, per quanto urgente sia la necessità dell'apostolato attivo, i membri di tali istituti non possono essere chiamati a prestare l'aiuto della loro opera nei diversi ministeri pastorali.`

const t675 = `§1. Negli istituti dediti all'apostolato l'azione apostolica appartiene alla loro stessa natura. Perciò l'intera vita dei membri sia permeata di spirito apostolico, e d'altra parte tutta l'azione apostolica sia animata dallo spirito religioso.

§2. L'azione apostolica deve sempre sgorgare dall'intima unione con Dio, e al tempo stesso consolidarla e favorirla.

§3. L'azione apostolica, da esercitarsi a nome della Chiesa e per suo mandato, sia condotta nella comunione con la Chiesa.`

const t676 = `Gli istituti laicali maschili e femminili attraverso le opere di misericordia spirituale e corporale partecipano della funzione pastorale della Chiesa e prestano agli uomini i più svariati servizi; essi perciò perseverino fedelmente nella grazia della propria vocazione.`

const t677 = `§1. I Superiori e i membri mantengano con fedeltà la missione e le opere proprie dell'istituto; tuttavia procedano con prudenza agli adattamenti richiesti dalle necessità dei tempi e dei luoghi, adottando anche mezzi nuovi e convenienti.

§2. Gli istituti poi, ai quali sono unite associazioni di fedeli, le aiutino con particolare sollecitudine perché queste siano permeate del genuino spirito della loro famiglia religiosa.`

const t678 = `§1. I religiosi sono soggetti alla potestà dei Vescovi, ai quali devono seguire con rispetto devoto e riverenza, in ciò che riguarda la cura delle anime, l'esercizio pubblico del culto divino e le altre opere di apostolato.

§2. Nell'esercizio dell'apostolato esterno i religiosi sono soggetti anche ai propri Superiori e devono mantenersi fedeli alla disciplina dell'istituto; i Vescovi stessi non tralascino di urgere, quando occorre, un tale obbligo.

§3. Nell'organizzare le attività apostoliche dei religiosi è necessario che i Vescovi diocesani e i Superiori religiosi procedano avendo scambiato i pareri.`

const t679 = `Il Vescovo diocesano, per una causa molto grave e urgente, può proibire ad un membro di istituto religioso di dimorare nella sua diocesi qualora il Superiore maggiore, avvisato, trascurasse di provvedere in merito; in tal caso la questione deve essere subito deferita alla Santa Sede.`

const t680 = `Tra i diversi istituti, e anche tra questi e il clero secolare, si favorisca una ordinata collaborazione, nonché il coordinamento di tutte le opere e attività apostoliche sotto la guida del Vescovo diocesano, avuto riguardo all'indole e alle finalità dei singoli istituti, come pure alle leggi di fondazione.`

const t681 = `§1. Le opere che dal Vescovo diocesano vengono affidate ai religiosi sono soggette all'autorità e alla direzione del Vescovo stesso, fermo restando il diritto dei Superiori religiosi a norma del can. 678, §2 e §3.

§2. In tali casi si stipuli una convenzione scritta tra il Vescovo diocesano e il Superiore competente dell'istituto, nella quale fra l'altro sia definito espressamente e con esattezza quanto riguarda l'opera da svolgere, i religiosi da destinarvi e gli aspetti economici.`

const t682 = `§1. Se si tratta di conferire un ufficio ecclesiastico in diocesi a un religioso, la nomina viene fatta dal Vescovo diocesano su presentazione, o almeno con il consenso, del Superiore competente.

§2. Il religioso può essere rimosso dall'ufficio conferito, a discrezione sia dell'autorità che glielo ha affidato, informatone il Superiore religioso, sia da parte del Superiore stesso, informatane l'autorità committente; nell'uno e nell'altro caso non si richiede il consenso dell'altra autorità.`

const t683 = `§1. In occasione della visita pastorale, ed anche in caso di necessità, il Vescovo diocesano può visitare, personalmente o per mezzo di altri, le chiese e gli oratori cui accedono abitualmente i fedeli, le scuole e le altre opere di religione o di carità spirituale o temporale affidate ai religiosi; non però le scuole aperte esclusivamente agli alunni propri dell'istituto.

§2. Che se eventualmente il Vescovo scoprisse abusi, dopo avere richiamato inutilmente il Superiore religioso, può di sua autorità prendere egli stesso, di propria autorità, i provvedimenti del caso.`

export const canons641to683: CanonInput[] = [
  canon(641, 'Ammissione al noviziato', ['noviziato', 'ammissione', 'Superiori maggiori'], t641),
  canon(642, 'Idoneità dei candidati', ['candidati', 'idoneità', 'maturità'], t642),
  canon(643, 'Invalidità dell’ammissione al noviziato', ['noviziato', 'invalidità', 'impedimenti'], t643),
  canon(644, 'Consultazione dell’Ordinario e debiti', ['Ordinario', 'chierici secolari', 'debiti'], t644),
  canon(645, 'Documenti per l’ammissione', ['documenti', 'battesimo', 'stato libero'], t645),
  canon(646, 'Finalità del noviziato', ['noviziato', 'vocazione', 'formazione'], t646),
  canon(647, 'Casa di noviziato', ['casa di noviziato', 'Moderatore supremo', 'maestro dei novizi'], t647),
  canon(648, 'Durata del noviziato', ['noviziato', 'durata', 'formazione'], t648),
  canon(649, 'Assenze dal noviziato', ['noviziato', 'assenza', 'validità'], t649),
  canon(650, 'Direzione dei novizi', ['novizi', 'maestro', 'formazione'], t650),
  canon(651, 'Maestro dei novizi e aiutanti', ['maestro dei novizi', 'aiutanti', 'voti perpetui'], t651),
  canon(652, 'Formazione dei novizi', ['novizi', 'formazione', 'consigli evangelici'], t652),
  canon(653, 'Uscita o ammissione alla professione', ['novizio', 'professione temporanea', 'dimissione'], t653),
  canon(654, 'Effetti della professione religiosa', ['professione religiosa', 'consigli evangelici', 'incorporazione'], t654),
  canon(655, 'Durata della professione temporanea', ['professione temporanea', 'durata', 'voti'], t655),
  canon(656, 'Validità della professione temporanea', ['professione temporanea', 'validità', 'ammissione'], t656),
  canon(657, 'Rinnovazione e professione perpetua', ['rinnovazione', 'professione perpetua', 'voti temporanei'], t657),
  canon(658, 'Validità della professione perpetua', ['professione perpetua', 'validità', 'età'], t658),
  canon(659, 'Formazione dopo la prima professione', ['formazione', 'missione', 'ordini sacri'], t659),
  canon(660, 'Caratteri della formazione', ['formazione', 'studi', 'titoli'], t660),
  canon(661, 'Formazione permanente', ['formazione permanente', 'Superiori', 'religiosi'], t661),
  canon(662, 'Sequela di Cristo', ['sequela di Cristo', 'Vangelo', 'costituzioni'], t662),
  canon(663, 'Preghiera e vita sacramentale', ['orazione', 'Eucaristia', 'liturgia delle ore'], t663),
  canon(664, 'Conversione e penitenza', ['conversione', 'coscienza', 'penitenza'], t664),
  canon(665, 'Vita comune e assenza dalla casa', ['vita comune', 'assenza', 'casa religiosa'], t665),
  canon(666, 'Mezzi di comunicazione sociale', ['comunicazione sociale', 'castità', 'vocazione'], t666),
  canon(667, 'Clausura', ['clausura', 'monasteri', 'Vescovo diocesano'], t667),
  canon(668, 'Beni personali e voto di povertà', ['beni', 'povertà', 'rinuncia'], t668),
  canon(669, 'Abito religioso', ['abito religioso', 'consacrazione', 'povertà'], t669),
  canon(670, 'Sostentamento dei membri', ['istituto', 'membri', 'necessità'], t670),
  canon(671, 'Incarichi fuori dall’istituto', ['incarichi', 'uffici', 'licenza'], t671),
  canon(672, 'Obblighi comuni ai religiosi', ['obblighi', 'religiosi', 'chierici'], t672),
  canon(673, 'Testimonianza come primo apostolato', ['apostolato', 'testimonianza', 'preghiera'], t673),
  canon(674, 'Istituti contemplativi', ['contemplazione', 'apostolato', 'vita contemplativa'], t674),
  canon(675, 'Azione apostolica degli istituti', ['azione apostolica', 'comunione', 'vita religiosa'], t675),
  canon(676, 'Istituti laicali e opere di misericordia', ['istituti laicali', 'misericordia', 'pastorale'], t676),
  canon(677, 'Fedeltà e adattamento delle opere', ['missione', 'opere', 'associazioni'], t677),
  canon(678, 'Dipendenza dai Vescovi e dai Superiori', ['Vescovi', 'Superiori', 'apostolato'], t678),
  canon(679, 'Divieto di dimora nella diocesi', ['Vescovo diocesano', 'dimora', 'Santa Sede'], t679),
  canon(680, 'Collaborazione apostolica', ['collaborazione', 'apostolato', 'clero secolare'], t680),
  canon(681, 'Opere affidate ai religiosi', ['opere', 'convenzione', 'Vescovo diocesano'], t681),
  canon(682, 'Uffici ecclesiastici affidati ai religiosi', ['ufficio ecclesiastico', 'nomina', 'rimozione'], t682),
  canon(683, 'Visita del Vescovo alle opere dei religiosi', ['visita pastorale', 'Vescovo diocesano', 'opere'], t683),
]
