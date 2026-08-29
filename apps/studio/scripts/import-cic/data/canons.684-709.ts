import type {CanonInput, CanonSegmentInput} from '../types'

const TITLE = 'cic-1983-book-2-part-3-section-1-title-2'
const CHAPTER_6_ARTICLE_1 = `${TITLE}-chapter-6-article-1`
const CHAPTER_6_ARTICLE_2 = `${TITLE}-chapter-6-article-2`
const CHAPTER_6_ARTICLE_3 = `${TITLE}-chapter-6-article-3`
const CHAPTER_7 = `${TITLE}-chapter-7`
const CHAPTER_8 = `${TITLE}-chapter-8`

const SOURCE_684_685 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_684-685_it.html'
const SOURCE_686_693 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_686-693_it.html'
const SOURCE_694_704 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_694-704_it.html'
const SOURCE_705_707 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_705-707_it.html'
const SOURCE_708_709 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_708-709_it.html'

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
  if (number <= 685) return CHAPTER_6_ARTICLE_1
  if (number <= 693) return CHAPTER_6_ARTICLE_2
  if (number <= 704) return CHAPTER_6_ARTICLE_3
  if (number <= 707) return CHAPTER_7
  return CHAPTER_8
}

function sourceFor(number: number): string {
  if (number <= 685) return SOURCE_684_685
  if (number <= 693) return SOURCE_686_693
  if (number <= 704) return SOURCE_694_704
  if (number <= 707) return SOURCE_705_707
  return SOURCE_708_709
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

function amendedItalianCanon(
  number: number,
  editorialTitle: string,
  keywords: string[],
  originalText: string,
  currentText: string,
  currentVersionId: string,
  currentLabel: string,
  changeSummary: string,
  validUntil?: string,
  currentValidFrom?: string,
): CanonInput {
  return {
    number,
    editorialTitle,
    keywords,
    structuralUnitCanonicalId: unitFor(number),
    status: 'amended',
    versions: [
      {
        versionId: `cic-1983-can-${number}-it-1983`,
        versionLabel: 'Versione originaria 1983',
        status: 'superseded',
        validFrom: '1983-11-27',
        validUntil,
        language: 'it',
        text: originalText,
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: `CIC 1983, can. ${number} — redazione originaria`,
        sourceUrl: sourceFor(number),
        segments: segments(number, originalText),
      },
      {
        versionId: currentVersionId,
        versionLabel: currentLabel,
        status: 'current',
        validFrom: currentValidFrom,
        language: 'it',
        text: currentText,
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: `CIC 1983, can. ${number}`,
        sourceUrl: sourceFor(number),
        changeSummary,
        segments: segments(number, currentText),
      },
    ],
  }
}

const t684 = `§1. Un professo di voti perpetui non può passare dal proprio a un altro istituto religioso se non per concessione del Moderatore supremo dell'uno e dell'altro istituto, previo consenso dei rispettivi consigli.

§2. Il religioso dopo avere trascorso un periodo di prova, che deve durare almeno tre anni, può essere ammesso alla professione perpetua nel nuovo istituto. Se però egli non vuole emettere tale professione o non vi è ammesso dai Superiori competenti, ritorni all'istituto di provenienza, a meno che non abbia ottenuto l'indulto di secolarizzazione.

§3. Perché un religioso possa passare da un monastero sui iuris ad un altro dello stesso istituto o della federazione oppure della confederazione, si richiede ed è sufficiente il consenso del Superiore maggiore dell'uno e dell'altro monastero, oltre che del capitolo del monastero che lo accoglie, salvi altri requisiti determinati dal diritto proprio; non si richiede una nuova professione.

§4. Il diritto proprio determini la durata e le modalità del periodo di prova che deve precedere la professione del religioso nel nuovo istituto.

§5. Per passare ad un istituto secolare o ad una società di vita apostolica, oppure da questi ad un istituto religioso, è necessaria la licenza della Santa Sede, alle cui disposizioni ci si deve attenere.`

const t685 = `§1. Fino al momento della professione nel nuovo istituto, mentre rimangono vincolanti i voti, sono sospesi i diritti e gli obblighi che il religioso aveva nel precedente istituto; tuttavia fin dall'inizio del periodo di prova il religioso è tenuto all'osservanza del diritto proprio del nuovo istituto.

§2. Con la professione nel nuovo istituto il religioso viene ad esso incorporato, mentre cessano i voti, i diritti e gli obblighi precedenti.`

const t686Original = `§1. Il Moderatore supremo, col consenso del suo consiglio, per grave causa può concedere ad un professo perpetuo l'indulto di esclaustrazione, tuttavia per non più di tre anni, previo consenso dell'Ordinario del luogo in cui dovrà dimorare se si tratta di un chierico. Una proroga dell'indulto, o una concessione superiore a tre anni, è riservata unicamente alla Santa Sede, oppure al Vescovo diocesano se si tratta di istituti di diritto diocesano.

§2. Spetta unicamente alla Sede Apostolica concedere l'indulto di esclaustrazione per le monache.

§3. Su richiesta del Moderatore supremo con il consenso del suo consiglio, l'esclaustrazione può essere imposta, dalla Santa Sede per un membro di istituto di diritto pontificio, oppure dal Vescovo diocesano per un membro di istituto di diritto diocesano: ciò per cause gravi, salva l'equità e la carità.`
const t686Current = `§1. Il Moderatore supremo, col consenso del suo consiglio, per grave causa può concedere ad un professo perpetuo l’indulto di esclaustrazione, tuttavia per non più di cinque anni, previo consenso dell’Ordinario del luogo in cui dovrà dimorare se si tratta di un chierico. Una proroga dell’indulto, o una concessione superiore a cinque anni, è riservata unicamente alla Santa Sede, oppure al Vescovo diocesano se si tratta di istituti di diritto diocesano.

§2. Spetta unicamente alla Sede Apostolica concedere l'indulto di esclaustrazione per le monache.

§3. Su richiesta del Moderatore supremo con il consenso del suo consiglio, l'esclaustrazione può essere imposta, dalla Santa Sede per un membro di istituto di diritto pontificio, oppure dal Vescovo diocesano per un membro di istituto di diritto diocesano: ciò per cause gravi, salva l'equità e la carità.`

const t687 = `Il religioso esclaustrato è ritenuto esonerato dagli obblighi non compatibili con la sua nuova situazione di vita; in ogni modo rimane sotto la dipendenza e la cura dei suoi Superiori ed anche dell'Ordinario del luogo, soprattutto se si tratta di un chierico. Può portare l'abito dell'istituto, a meno che non sia stabilito altrimenti nell'indulto. Egli però manca di voce attiva e passiva.`

const t688Original = `§1. Colui che, scaduto il tempo della professione, vuole uscire dall'istituto, lo può abbandonare.

§2. Chi durante la professione temporanea per grave causa chiede di lasciare l'istituto può ottenere il relativo indulto dal Moderatore supremo con il consenso del suo consiglio se si tratta di istituto di diritto pontificio; ma negli istituti di diritto diocesano e nei monasteri, di cui nel can. 615, l'indulto, per essere valido, deve essere confermato dal Vescovo della casa di assegnazione.`
const t688Current = `§1. Colui che, scaduto il tempo della professione, vuole uscire dall'istituto, lo può abbandonare.

§2. Chi durante la professione temporanea per grave causa chiede di lasciare l’istituto può ottenere il relativo indulto dal Moderatore supremo col consenso del suo consiglio; per un monastero sui iuris, di cui al can. 615, l’indulto, per essere valido, deve essere confermato dal Vescovo della casa di assegnazione.`

const t689 = `§1. Allo scadere della professione temporanea, un religioso può essere escluso dall'emettere la successiva professione, se sussistono giuste cause, da parte del Superiore maggiore competente, udito il suo consiglio.

§2. Una infermità fisica o psichica, anche contratta dopo la professione, quando a giudizio dei periti rende non idoneo alla vita nell'istituto il religioso di cui nel §1, costituisce motivo per non ammetterlo a rinnovare la professione o ad ammettere la professione perpetua, salvo il caso che l'infermità sia dovuta a negligenza da parte dell'istituto, oppure a lavori sostenuti nell'istituto stesso.

§3. Se però il religioso, durante i voti temporanei, diventa demente, anche se non è in grado di emettere la nuova professione, non può tuttavia essere dimesso dall'istituto.`

const t690 = `§1. Chi avendo compiuto il noviziato, oppure dopo la professione, è uscito legittimamente dall'istituto può esservi riammesso dal Moderatore supremo con il consenso del suo consiglio, senza l'onere di ripetere il noviziato; spetterà tuttavia al Moderatore stesso stabilire un conveniente periodo di prova prima della professione temporanea e la durata dei voti temporanei prima della professione perpetua, a norma dei cann. 655 e 657.

§2. Della stessa facoltà gode il Superiore di un monastero sui iuris, con il consenso del suo consiglio.`

const t691 = `§1. Un professo di voti perpetui non richieda l'indulto di lasciare l'istituto se non per cause molto gravi ponderate davanti a Dio; presenti la sua domanda al Moderatore supremo dell'istituto, il quale la inoltrerà all'autorità competente insieme con il voto proprio e quello del suo consiglio.

§2. Tale indulto per gli istituti di diritto pontificio è riservato alla Sede Apostolica; per gli istituti di diritto diocesano invece lo può concedere anche il Vescovo della diocesi in cui è situata la casa di assegnazione.`

const t692 = `L'indulto di lasciare l'istituto, una volta legittimamente concesso e notificato al religioso, se da lui non fu rifiutato all'atto della notificazione, comporta per il diritto stesso la dispensa dai voti, come pure da tutti gli obblighi derivanti dalla professione.`

const t693 = `Se il religioso è chierico l'indulto non viene concesso finché egli non abbia trovato un Vescovo che lo incardini nella diocesi o almeno lo riceva in prova. Se è ricevuto in prova, trascorsi cinque anni, il religioso viene incardinato nella diocesi per il diritto stesso, a meno che il Vescovo non lo abbia respinto.`

const t694Original = `§1. Si deve ritenere dimesso dall'istituto, per il fatto stesso, il religioso che:
1) abbia in modo notorio abbandonato la fede cattolica;
2) abbia contratto matrimonio o lo abbia attentato, anche solo civilmente.

§2. In tali casi il Superiore maggiore con il proprio consiglio deve senza indugio, raccolte le prove, emettere la dichiarazione del fatto perché la dimissione consti giuridicamente.`
const t694Current = `§1. Si deve ritenere dimesso dall’istituto, per il fatto stesso, il religioso che:
1) abbia in modo notorio abbandonato la fede cattolica;
2) abbia contratto matrimonio o lo abbia attentato, anche solo civilmente;
3) si sia assentato dalla casa religiosa illegittimamente, ai sensi del can. 665 § 2, per dodici mesi ininterrotti, tenuta presente l’irreperibilità del religioso stesso.

§2. In tali casi il Superiore maggiore con il proprio consiglio deve senza indugio, raccolte le prove, emettere la dichiarazione del fatto perché la dimissione consti giuridicamente.

§3. Nel caso previsto dal § 1 n. 3, tale dichiarazione per constare giuridicamente deve essere confermata dalla Santa Sede; per gli istituti di diritto diocesano la conferma spetta al Vescovo della sede principale.`

const t695Original = `§1. Un religioso deve essere dimesso dall'istituto per i delitti di cui nei cann. 1397, 1398 e 1395 a meno che, per i delitti di cui nel can. 1395, §2, il Superiore non ritenga che la dimissione non sia del tutto necessaria e che si possa sufficientemente provvedere in altro modo sia alla correzione del religioso e alla reintegrazione della giustizia, sia alla riparazione dello scandalo.

§2. In tali casi il Superiore maggiore, raccolte le prove relative ai fatti e alla imputabilità, renda note al religioso da dimettere e l'accusa e le prove, dandogli facoltà di difendersi. Tutti gli atti, sottoscritti dal Superiore maggiore e dal notaio, siano trasmesse al Moderatore supremo insieme con le risposte del religioso, verbalizzate e dal religioso stesso sottoscritte.`
const t695CurrentLatin = `§1. Sodalis dimitti debet ob delicta de quibus in cann. 1395, 1397 et 1398, nisi in delictis, de quibus in cann. 1395 §§2-3, et 1398 §1, Superior maior censeat dimissionem non esse omnino necessariam et emendationi sodalis atque restitutioni iustitiae et reparationi scandali satis alio modo consuli posse.

§2. His in casibus Superior maior, collectis probationibus circa facta et imputabilitatem, sodali dimittendo accusationem atque probationes significet, data eidem facultate sese defendendi. Acta omnia, a Superiore maiore et a notario subscripta, una cum responsionibus sodalis, scripto redactis et ab ipso sodale subscriptis, supremo Moderatori transmittantur.`

const t696 = `§1. Un religioso può essere dimesso anche per altre cause purché siano gravi, esterne, imputabili e comprovate giuridicamente, come ad esempio: la negligenza abituale degli obblighi della vita consacrata; le ripetute violazioni dei vincoli sacri; la disobbedienza ostinata alle legittime disposizioni dei Superiori in materia grave; un grave scandalo derivato dal comportamento colpevole del religioso; l'ostinato appoggio o la propaganda di dottrine condannate dal magistero della Chiesa; l'adesione pubblica a ideologie inficiate di materialismo o di ateismo; l'assenza illegittima, di cui nel can. 665, §2, protratta per sei mesi; altre cause di simile gravità eventualmente determinate nel diritto proprio dell'istituto.

§2. Per la dimissione di un religioso di voti temporanei sono sufficienti anche cause di minore gravità, stabilite dal diritto proprio.`

const t697 = `Nei casi di cui al can. 696, se il Superiore maggiore, udito il suo consiglio, giudica che si debba avviare il processo di dimissione:
1) raccolga o integri le prove;
2) ammonisca il religioso, per scritto o davanti a due testimoni con la esplicita comminazione della conseguente dimissione in caso di mancato ravvedimento, notificandogli chiaramente la causa della dimissione e accordandogli piena facoltà di difendersi; qualora poi l'ammonizione risulti inutile, il Superiore proceda a una seconda, dopo un intervallo di almeno quindici giorni;
3) se anche questa seconda ammonizione risultasse senza effetto, e se il Superiore maggiore con il suo consiglio giudicasse sufficientemente provata l'incorreggibilità, e insufficienti le difese del religioso, trascorsi senza risultato altri quindici giorni dall'ultima ammonizione, trasmetta al Moderatore supremo tutti gli atti, sottoscritti da lui stesso e dal notaio, unitamente alle risposte date dal religioso e da lui firmate.`

const t698 = `In tutti i casi di cui nei cann. 695 e 696 rimane sempre fermo il diritto del religioso di comunicare con il Moderatore supremo e di esporre a lui direttamente gli argomenti a propria difesa.`

const t699Original = `§1. Il Moderatore supremo con il suo consiglio, che per la validità deve constare di almeno quattro membri, proceda collegialmente ad una accurata valutazione delle prove, degli argomenti e delle difese e, se ciò risulta per votazione segreta, emetterà il decreto di dimissione; questo, per essere valido, esprima almeno sommariamente i motivi, in diritto e in fatto.

§2. Nei monasteri sui iuris, di cui al can. 615, la decisione circa la dimissione compete al Vescovo diocesano, al quale il Superiore deve sottoporre gli atti revisionati dal suo consiglio.`
const t699Current = `§1. Il Moderatore supremo con il suo consiglio, che per la validità deve constare di almeno quattro membri, proceda collegialmente ad una accurata valutazione delle prove, degli argomenti e delle difese e, se ciò risulta per votazione segreta, emetterà il decreto di dimissione; questo, per essere valido, esprima almeno sommariamente i motivi, in diritto e in fatto.

§2. Nei monasteri sui iuris, di cui al can. 615, la decisione circa la dimissione di un professo compete al Superiore maggiore con il consenso del suo consiglio.`

const t700Original = `Il decreto di dimissione non ha vigore se non fu confermato dalla Santa Sede, alla quale vanno trasmessi il decreto stesso e tutti gli atti; per gli istituti di diritto diocesano la conferma spetta al Vescovo della diocesi in cui sorge la casa alla quale il religioso è ascritto. Il decreto tuttavia per avere valore deve indicare il diritto, di cui gode il religioso dimesso, di ricorrere all'autorità competente entro dieci giorni dalla ricezione della notifica. Il ricorso ha effetto sospensivo.`
const t700CurrentLatin = `Decretum dimissionis in sodalem professum latum vim habet simul ac ei, cuius interest, notificatur. Decretum vero, ut valeat, indicare debet ius, quo dimissus gaudet, recurrendi, absque petitione de qua in can. 1734, § 1, intra triginta dies a recepta notificatione ad auctoritatem competentem. Recursus effectum habet suspensivum.`

const t701 = `Con la legittima dimissione cessano per il fatto stesso i voti, nonché i diritti e gli obblighi derivanti dalla professione. Se però il religioso è chierico, non può esercitare gli ordini sacri fino a quando non trovi un Vescovo il quale, dopo un conveniente periodo di prova in diocesi, a norma del can. 693, lo accolga o almeno gli consenta l'esercizio degli ordini sacri.`

const t702 = `§1. Coloro che legittimamente escono dall'istituto religioso o ne sono stati legittimamente dimessi non possono esigere nulla dall'istituto stesso per qualunque attività in esso compiuta.

§2. L'istituto deve tuttavia osservare l'equità e la carità evangelica verso il religioso che se ne separa.`

const t703 = `In caso di grave scandalo esterno o nel pericolo imminente di gravissimo danno per l'istituto, un religioso può essere espulso dalla casa religiosa immediatamente da parte del Superiore maggiore oppure, qualora il ritardo risultasse pericoloso, dal Superiore locale col consenso del suo consiglio. Il Superiore maggiore, se necessario, curi che si istruisca il processo di dimissione a norma del diritto, oppure deferisca la cosa alla Sede Apostolica.`

const t704 = `Nella relazione da farsi alla Sede Apostolica, di cui al can. 592, §1, si faccia menzione dei religiosi che in qualunque modo sono separati dall'istituto.`

const t705 = `Il religioso elevato all'episcopato continua ad essere membro del suo istituto, ma in forza del voto di obbedienza è soggetto solamente al Romano Pontefice e non è vincolato da quegli obblighi che egli stesso, nella sua prudenza, giudichi incompatibili con la propria condizione.`

const t706 = `Il religioso di cui sopra:
1) se per la professione ha perduto il dominio dei propri beni, ricevendone altri ne ha l'uso, l'usufrutto e l'amministrazione; quanto alla proprietà, invece, il Vescovo diocesano e gli altri di cui nel can. 381, §2, la acquistano per la Chiesa particolare; tutti gli altri per l'istituto, oppure per la Santa Sede, a seconda che l'istituto abbia o no la capacità di possedere;
2) se per la professione non ha perduto il dominio dei beni, ricupera l'uso, l'usufrutto e l'amministrazione di quelli che aveva; e acquista per sé a pieno titolo quelli che gli provengono in seguito;
3) in entrambi i casi, deve disporre secondo la volontà degli offerenti dei beni che gli provengono a titolo non personale.`

const t707 = `§1. Il religioso Vescovo emerito può scegliersi la casa in cui abitare, anche fuori dalle case del proprio istituto, a meno che la Sede Apostolica non abbia disposto altrimenti.

§2. Quanto al suo sostentamento conveniente e degno, se il Vescovo è stato a servizio di una diocesi si osserverà il can. 402, §2, a meno che il suo istituto non voglia provvedere a tale sostentamento; altrimenti la Sede Apostolica disporrà in altro modo.`

const t708 = `I Superiori maggiori possono utilmente associarsi in conferenze o consigli per conseguire più agevolmente, nell'unione delle forze, il fine proprio dei singoli istituti, salvi sempre l'autonomia, l'indole e lo spirito proprio di ognuno, sia per trattare questioni di comune interesse, sia per instaurare un opportuno coordinamento e collaborazione con le Conferenze Episcopali ed anche con i singoli Vescovi.`

const t709 = `Le conferenze dei Superiori maggiori abbiano i propri statuti approvati dalla Santa Sede, dalla quale unicamente possono essere erette, anche in persona giuridica, e sotto la cui suprema direzione esse rimangono.`

const amended695: CanonInput = {
  number: 695,
  editorialTitle: 'Dimissione obbligatoria per determinati delitti',
  keywords: ['dimissione', 'delitti', 'Moderatore supremo'],
  structuralUnitCanonicalId: CHAPTER_6_ARTICLE_3,
  status: 'amended',
  versions: [
    {
      versionId: 'cic-1983-can-695-it-1983',
      versionLabel: 'Versione originaria 1983',
      status: 'superseded',
      validFrom: '1983-11-27',
      validUntil: '2022-04-25',
      language: 'it',
      text: t695Original,
      sourceDocumentTitle: 'Codice di Diritto Canonico',
      sourceCitation: 'CIC 1983, can. 695 — redazione originaria',
      sourceUrl: SOURCE_694_704,
      segments: segments(695, t695Original),
    },
    {
      versionId: 'cic-1983-can-695-la-2022',
      versionLabel: 'Testo autentico vigente dopo Recognitum Librum VI',
      status: 'current',
      validFrom: '2022-04-26',
      language: 'la',
      text: t695CurrentLatin,
      sourceDocumentTitle: 'Codice di Diritto Canonico',
      sourceCitation: 'CIC 1983, can. 695',
      sourceUrl: SOURCE_694_704,
      changeSummary: 'Il §1 è stato modificato dal Motu Proprio Recognitum Librum VI (26 aprile 2022), entrato in vigore il giorno stesso.',
      segments: segments(695, t695CurrentLatin),
    },
  ],
}

const amended700: CanonInput = {
  number: 700,
  editorialTitle: 'Efficacia del decreto di dimissione e ricorso',
  keywords: ['decreto di dimissione', 'ricorso', 'effetto sospensivo'],
  structuralUnitCanonicalId: CHAPTER_6_ARTICLE_3,
  status: 'amended',
  versions: [
    {
      versionId: 'cic-1983-can-700-it-1983',
      versionLabel: 'Versione originaria 1983',
      status: 'superseded',
      validFrom: '1983-11-27',
      language: 'it',
      text: t700Original,
      sourceDocumentTitle: 'Codice di Diritto Canonico',
      sourceCitation: 'CIC 1983, can. 700 — redazione originaria',
      sourceUrl: SOURCE_694_704,
      segments: segments(700, t700Original),
    },
    {
      versionId: 'cic-1983-can-700-la-2023',
      versionLabel: 'Testo autentico vigente dopo la modifica del 2 aprile 2023',
      status: 'current',
      validFrom: '2023-05-07',
      language: 'la',
      text: t700CurrentLatin,
      sourceDocumentTitle: 'Codice di Diritto Canonico',
      sourceCitation: 'CIC 1983, can. 700',
      sourceUrl: SOURCE_694_704,
      changeSummary: 'Il testo vigente recepisce la riforma del 2022 e la modifica dei termini di ricorso disposta dal Motu Proprio del 2 aprile 2023, in vigore dal 7 maggio 2023.',
      segments: segments(700, t700CurrentLatin),
    },
  ],
}

export const canons684to709: CanonInput[] = [
  canon(684, 'Passaggio ad un altro istituto', ['passaggio', 'istituto religioso', 'professione perpetua'], t684),
  canon(685, 'Effetti del passaggio ad un altro istituto', ['passaggio', 'voti', 'incorporazione'], t685),
  amendedItalianCanon(686, 'Esclaustrazione', ['esclaustrazione', 'Moderatore supremo', 'Santa Sede'], t686Original, t686Current, 'cic-1983-can-686-it-2022', 'Versione vigente dopo Competentias quasdam decernere', 'Il §1 è stato modificato dal Motu Proprio Competentias quasdam decernere (11 febbraio 2022).', '2022-02-14', '2022-02-15'),
  canon(687, 'Condizione del religioso esclaustrato', ['esclaustrazione', 'obblighi', 'Ordinario del luogo'], t687),
  amendedItalianCanon(688, 'Uscita durante o al termine della professione temporanea', ['professione temporanea', 'indulto', 'uscita'], t688Original, t688Current, 'cic-1983-can-688-it-2022', 'Versione vigente dopo Competentias quasdam decernere', 'Il §2 è stato modificato dal Motu Proprio Competentias quasdam decernere (11 febbraio 2022).', '2022-02-14', '2022-02-15'),
  canon(689, 'Esclusione dalla successiva professione', ['professione temporanea', 'idoneità', 'infermità'], t689),
  canon(690, 'Riammissione nell’istituto', ['riammissione', 'noviziato', 'Moderatore supremo'], t690),
  canon(691, 'Indulto di lasciare l’istituto', ['indulto', 'professione perpetua', 'Sede Apostolica'], t691),
  canon(692, 'Effetti dell’indulto di uscita', ['indulto', 'dispensa', 'voti'], t692),
  canon(693, 'Uscita del religioso chierico', ['chierico', 'incardinazione', 'Vescovo'], t693),
  amendedItalianCanon(694, 'Dimissione ipso facto', ['dimissione', 'abbandono della fede', 'assenza illegittima'], t694Original, t694Current, 'cic-1983-can-694-it-2019', 'Versione vigente dopo Communis vita', 'Il canone è stato sostituito dal Motu Proprio Communis vita (19 marzo 2019), in vigore dal 10 aprile 2019.', '2019-04-09', '2019-04-10'),
  amended695,
  canon(696, 'Altre cause di dimissione', ['dimissione', 'cause gravi', 'diritto proprio'], t696),
  canon(697, 'Procedura previa alla dimissione', ['dimissione', 'ammonizione', 'difesa'], t697),
  canon(698, 'Diritto di difesa davanti al Moderatore supremo', ['difesa', 'Moderatore supremo', 'religioso'], t698),
  amendedItalianCanon(699, 'Decisione sulla dimissione', ['dimissione', 'Moderatore supremo', 'monastero sui iuris'], t699Original, t699Current, 'cic-1983-can-699-it-2026', 'Versione vigente dopo il Rescriptum del 25 marzo 2026', 'Il §2 è stato modificato dal Rescriptum ex Audientia Sanctissimi del 25 marzo 2026.', '2026-03-24', '2026-03-25'),
  amended700,
  canon(701, 'Effetti della legittima dimissione', ['dimissione', 'voti', 'ordini sacri'], t701),
  canon(702, 'Effetti patrimoniali della separazione', ['separazione', 'equità', 'carità'], t702),
  canon(703, 'Espulsione immediata dalla casa religiosa', ['espulsione', 'scandalo', 'grave danno'], t703),
  canon(704, 'Relazione alla Sede Apostolica', ['relazione', 'Sede Apostolica', 'separazione'], t704),
  canon(705, 'Religioso elevato all’episcopato', ['episcopato', 'religioso', 'Romano Pontefice'], t705),
  canon(706, 'Beni del religioso elevato all’episcopato', ['beni', 'episcopato', 'istituto'], t706),
  canon(707, 'Vescovo religioso emerito', ['Vescovo emerito', 'sostentamento', 'istituto'], t707),
  canon(708, 'Conferenze dei Superiori maggiori', ['Superiori maggiori', 'conferenze', 'collaborazione'], t708),
  canon(709, 'Statuti e autorità sulle conferenze', ['statuti', 'Santa Sede', 'Superiori maggiori'], t709),
]
