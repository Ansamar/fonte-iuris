import type {CanonInput, CanonSegmentInput} from '../types'

const UNIT_BASE = 'cic-1983-book-2-part-2-section-2-title-2'

const URL_431_434 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_431-434_it.html'
const URL_435_438 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_435-438_it.html'
const URL_439_446 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_439-446_it.html'
const URL_447_459 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_447-459_it.html'

function segments(canon: number, text: string): CanonSegmentInput[] {
  const paragraphMatches = [...text.matchAll(/^§(\d+)\./gm)]
  const result: CanonSegmentInput[] = []

  for (let i = 0; i < paragraphMatches.length; i += 1) {
    const match = paragraphMatches[i]
    const paragraphNumber = Number(match[1])
    const startOffset = match.index ?? 0
    const nextParagraphOffset =
      i + 1 < paragraphMatches.length ? (paragraphMatches[i + 1].index ?? text.length) : text.length

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
    const numberMatches = [...paragraphText.matchAll(/^(\d+)\)/gm)]
    for (let j = 0; j < numberMatches.length; j += 1) {
      const numberMatch = numberMatches[j]
      const number = Number(numberMatch[1])
      const numberStart = startOffset + (numberMatch.index ?? 0)
      const numberEnd =
        j + 1 < numberMatches.length
          ? startOffset + (numberMatches[j + 1].index ?? paragraphText.length)
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

function canon(
  number: number,
  chapter: number,
  editorialTitle: string,
  keywords: string[],
  text: string,
  sourceUrl: string,
): CanonInput {
  return {
    number,
    editorialTitle,
    keywords,
    structuralUnitCanonicalId: `${UNIT_BASE}-chapter-${chapter}`,
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
        segments: segments(number, text),
      },
    ],
  }
}

const t431 = `§1. Affinché venga promossa un'azione pastorale comune da parte di diverse diocesi vicine secondo le circostanze di persone e di luoghi, e affinché vengano favoriti in modo più adeguato i mutui rapporti dei Vescovi diocesani, le Chiese particolari più vicine siano riunite in province ecclesiastiche, delimitate da un territorio determinato.

§2. D'ora in avanti non vi siano di regola diocesi esenti; perciò le singole diocesi e le altre Chiese particolari che esistono nell'àmbito del territorio di una provincia ecclesiastica, devono far parte di tale provincia ecclesiastica.

§3. Spetta unicamente alla suprema autorità della Chiesa, sentiti i Vescovi interessati, costituire, sopprimere o modificare le province ecclesiastiche.`
const t432 = `§1. Nella provincia ecclesiastica hanno autorità, a norma del diritto, il concilio provinciale e il Metropolita.

§2. La provincia ecclesiastica gode di personalità giuridica per il diritto stesso.`
const t433 = `§1. Se l'utilità lo suggerisce, specialmente nelle nazioni dove sono più numerose le Chiese particolari, le province ecclesiastiche viciniori, su proposta della Conferenza Episcopale, possono essere congiunte dalla Santa Sede in regioni ecclesiastiche.

§2. La regione ecclesiastica può essere eretta in persona giuridica.`
const t434 = `All'assemblea dei Vescovi della regione ecclesiastica spetta favorire la cooperazione e l'attività pastorale comune nella regione; tuttavia i poteri che nei canoni di questo Codice sono attribuiti alla Conferenza Episcopale non competono a tale assemblea, a meno che alcuni di essi non le siano stati concessi in modo speciale dalla Santa Sede.`
const t435 = `Alla provincia ecclesiastica presiede il Metropolita, che è l'Arcivescovo della diocesi cui è preposto; tale ufficio è congiunto con una sede episcopale, determinata o approvata dal Romano Pontefice.`
const t436 = `§1. Nelle diocesi suffraganee spetta al Metropolita:
1) vigilare perché la fede e la disciplina ecclesiastica siano accuratamente osservate, e informare il Romano Pontefice su eventuali abusi;
2) fare la visita canonica, per una causa precedentemente approvata dalla Santa Sede, se il suffraganeo l'avesse trascurata;
3) nominare l'Amministratore diocesano, a norma dei cann. 421, §2 e 425 §3.

§2. Dove le circostanze lo richiedono, la Sede Apostolica può conferire al Metropolita funzioni e potestà peculiari da determinare nel diritto particolare.

§3. Nessun'altra potestà di governo compete al Metropolita nelle diocesi suffraganee; può però celebrare funzioni sacre in tutte le chiese, come il Vescovo nella propria diocesi, dandone prima avviso al Vescovo diocesano, se si tratta della chiesa cattedrale.`
const t437 = `§1. Il Metropolita è tenuto all'obbligo di chiedere personalmente o tramite un procuratore al Romano Pontefice il pallio, entro tre mesi dalla consacrazione episcopale oppure, se è già stato consacrato, dalla provvisione canonica; il pallio esprime la potestà che, in comunione con la Chiesa di Roma, il Metropolita acquisisce di diritto nella propria provincia.

§2. Il Metropolita può portare il pallio, nel rispetto delle leggi liturgiche, in qualsiasi chiesa della provincia ecclesiastica a cui presiede, non invece fuori di essa, neppure col consenso del Vescovo diocesano.

§3. Il Metropolita, se viene trasferito ad un'altra sede metropolitana, necessita di un nuovo pallio.`
const t438 = `Il titolo di Patriarca e di Primate, al di là di una prerogativa di onore, non comporta nella Chiesa latina alcuna potestà di governo, a meno che per qualcuno di essi non consti diversamente per privilegio apostolico o per consuetudine approvata.`
const t439 = `§1. Il concilio plenario, cioè per tutte le Chiese particolari della medesima Conferenza Episcopale, sia celebrato ogni volta che risulti necessario o utile alla stessa Conferenza Episcopale, con l'approvazione della Sede Apostolica.

§2. La norma stabilita dal §1 vale anche per la celebrazione del concilio provinciale nella provincia ecclesiastica i cui confini coincidono con il territorio della nazione.`
const t440 = `§1. Il concilio provinciale per le diverse Chiese particolari della medesima provincia ecclesiastica, sia celebrato ogni volta che risulti opportuno a giudizio della maggioranza dei Vescovi diocesani della provincia, salvo il can. 439, §2.

§2. Mentre è vacante la sede metropolitana, non si convochi il concilio provinciale.`
const t441 = `Spetta alla Conferenza Episcopale:
1) convocare il concilio plenario;
2) scegliere il luogo in cui celebrare il concilio nell'àmbito del territorio della Conferenza Episcopale;
3) eleggere tra i Vescovi diocesani del concilio plenario il presidente, che deve essere approvato dalla Sede Apostolica;
4) determinare l'ordine dei lavori e le questioni da trattare, indire l'inizio e la durata del concilio plenario, trasferirlo, prorogarlo e scioglierlo.`
const t442 = `§1. Spetta al Metropolita, col consenso della maggioranza dei Vescovi suffraganei:
1) convocare il concilio provinciale;
2) scegliere il luogo in cui celebrare il concilio provinciale nell'àmbito del territorio della provincia;
3) determinare l'ordine dei lavori e le questioni da trattare, indire l'inizio e la durata del concilio provinciale, trasferirlo, prorogarlo e scioglierlo.

§2. Spetta al Metropolita o, se questi è legittimamente impedito, al Vescovo suffraganeo eletto dagli altri Vescovi suffraganei, presiedere il concilio provinciale.`
const t443 = `§1. Devono essere convocati ai concili particolari con diritto al voto deliberativo:
1) i Vescovi diocesani;
2) i Vescovi coadiutori e ausiliari;
3) gli altri Vescovi titolari che esercitano nel territorio uno speciale incarico loro affidato dalla Sede Apostolica o dalla Conferenza Episcopale.

§2. Possono essere chiamati ai concili particolari gli altri Vescovi titolari, anche emeriti, che risiedono nel territorio; essi hanno diritto al voto deliberativo.

§3. Ai concili particolari devono essere chiamati con voto solamente consultivo:
1) i Vicari generali e i Vicari episcopali di tutte le Chiese particolari del territorio;
2) i Superiori maggiori degli istituti religiosi e delle società di vita apostolica in numero da determinare, sia per gli uomini sia per le donne, dalla Conferenza Episcopale o dai Vescovi della provincia; essi sono eletti rispettivamente da tutti i Superiori maggiori degli istituti e delle società che hanno sede nel territorio;
3) i rettori delle università ecclesiastiche e cattoliche e i decani delle facoltà di teologia e di diritto canonico che hanno sede nel territorio;
4) alcuni rettori dei seminari maggiori, eletti dai rettori dei seminari situati nel territorio, nel numero da determinarsi come al n. 2.

§4. Ai concili particolari possono essere chiamati, con voto solamente consultivo, anche presbiteri e altri fedeli, in modo però che il loro numero non superi la metà di coloro di cui ai §§1-3.

§5. Ai concili provinciali inoltre siano invitati i capitoli cattedrali, come pure il consiglio presbiterale e il consiglio pastorale di ciascuna Chiesa particolare, in modo che ognuno di essi invii due suoi membri designati collegialmente; essi però hanno voto solamente consultivo.

§6. Ai concili particolari possono essere invitati come ospiti anche altri, se ciò risulta opportuno a giudizio della Conferenza Episcopale per il concilio plenario, o del Metropolita insieme con i Vescovi suffraganei per il concilio provinciale.`
const t444 = `§1. Tutti coloro che sono convocati ai concili particolari devono parteciparvi, se non sono trattenuti da giusto impedimento, del quale sono tenuti ad informare il presidente del concilio.

§2. Coloro che sono convocati ai concili particolari ed hanno in essi voto deliberativo, se sono trattenuti da giusto impedimento, possono inviare un procuratore; il procuratore ha voto solamente consultivo.`
const t445 = `Il concilio particolare cura che si provveda nel proprio territorio alle necessità pastorali del popolo di Dio e ha potestà di governo, soprattutto legislativa, così da poter decidere, salvo sempre il diritto universale della Chiesa, quanto risulta opportuno per l'incremento della fede, per ordinare l'attività pastorale comune, per regolare i costumi e per conservare, introdurre e difendere la disciplina ecclesiastica comune.`
const t446 = `Concluso il concilio particolare, il presidente provveda che tutti gli atti del concilio siano trasmessi alla Sede Apostolica; i decreti emanati dal concilio non siano promulgati se non dopo essere stati recogniti dalla Sede Apostolica; spetta al concilio stesso definire il modo di promulgazione dei decreti e il tempo in cui i decreti promulgati iniziano ad obbligare.`
const t447 = `La Conferenza Episcopale, organismo permanente, è l'assemblea dei Vescovi di una nazione o di un territorio determinato, i quali esercitano congiuntamente alcune funzioni pastorali per i fedeli di quel territorio, per promuovere maggiormente il bene che la Chiesa offre agli uomini, soprattutto mediante forme e modalità di apostolato opportunamente adeguate alle circostanze di tempo e di luogo, a norma del diritto.`
const t448 = `§1. La Conferenza Episcopale comprende, come regola generale, coloro che presiedono tutte le Chiese particolari della medesima nazione, a norma del can. 450.

§2. Se però, a giudizio della Sede Apostolica, sentiti i Vescovi diocesani interessati, le circostanze di persone o di cose lo suggeriscono, può essere eretta una Conferenza Episcopale per un territorio di ampiezza minore o maggiore, in modo che comprenda solamente i Vescovi di alcune Chiese particolari costituite in un determinato territorio oppure i presuli di Chiese particolari esistenti in nazioni diverse; spetta alla Sede Apostolica stabilire per ciascuna di esse norme peculiari.`
const t449 = `§1. Spetta unicamente alla suprema autorità della Chiesa, sentiti i Vescovi interessati, erigere, sopprimere o modificare le Conferenze Episcopali.

§2. La Conferenza Episcopale legittimamente eretta gode per il diritto stesso di personalità giuridica.`
const t450 = `§1. Appartengono per il diritto stesso alla Conferenza Episcopale tutti i Vescovi diocesani del territorio e quelli che sono loro equiparati nel diritto, come pure i Vescovi coadiutori, i Vescovi ausiliari e gli altri Vescovi titolari che esercitano nel medesimo territorio uno speciale incarico, loro affidato dalla Sede Apostolica o dalla Conferenza Episcopale; possono essere invitati anche gli Ordinari di un altro rito, in modo però che abbiano soltanto voto consultivo, a meno che gli statuti della Conferenza Episcopale non dispongano diversamente.

§2. Gli altri Vescovi titolari e il Legato del Romano Pontefice non sono membri di diritto della Conferenza Episcopale.`
const t451 = `Ogni Conferenza Episcopale elabori i propri statuti, da sottoporre alla recognitio della Sede Apostolica, nei quali, oltre alle altre cose, vengano regolati i modi di tenere l'assemblea plenaria della Conferenza e si provveda alla costituzione del consiglio permanente dei Vescovi e della segreteria generale della Conferenza, e anche di altri uffici e commissioni che, a giudizio della Conferenza, contribuiscano più efficacemente a conseguire il fine.`
const t452 = `§1. Ogni Conferenza Episcopale elegga il presidente, determini chi debba esercitare la funzione di pro-presidente se il presidente è legittimamente impedito, e designi il segretario generale, a norma degli statuti.

§2. Il presidente della Conferenza e, se egli è legittimamente impedito, il pro-presidente, presiede non solo le assemblee generali della Conferenza Episcopale, ma anche il consiglio permanente.`
const t453 = `Le assemblee plenarie della Conferenza Episcopale si tengano almeno una volta all'anno e inoltre ogni volta che lo richiedano circostanze particolari, secondo le disposizioni degli statuti.`
const t454 = `§1. Nelle assemblee plenarie della Conferenza Episcopale per il diritto stesso il voto deliberativo compete ai Vescovi diocesani e a quelli che sono loro equiparati nel diritto, come pure ai Vescovi coadiutori.

§2. Ai Vescovi ausiliari e agli altri Vescovi titolari appartenenti alla Conferenza Episcopale compete voto deliberativo oppure consultivo, secondo le disposizioni degli statuti della Conferenza; rimane fermo tuttavia che soltanto a quelli di cui al §1 compete il voto deliberativo quando si tratta di elaborare o modificare gli statuti.`
const t455 = `§1. La Conferenza Episcopale può emanare decreti generali solamente nelle materie in cui lo abbia disposto il diritto universale oppure lo stabilisca un mandato speciale della Sede Apostolica, sia motu proprio, sia su richiesta della Conferenza stessa.

§2. Perché i decreti di cui al §1 siano emanati validamente nell'assemblea plenaria, devono essere approvati almeno mediante i due terzi dei voti dei Presuli che appartengono alla Conferenza con voto deliberativo, e non ottengono forza obbligante se non vengono legittimamente promulgati, dopo essere stati recogniti dalla Sede Apostolica.

§3. I modi di promulgazione e il tempo dal quale i decreti acquistano forza obbligante vengono determinati dalla stessa Conferenza Episcopale.

§4. Nei casi in cui né il diritto universale né uno speciale mandato della Sede Apostolica abbia concesso alla Conferenza Episcopale la potestà di cui al §1, rimane intatta la competenza di ogni singolo Vescovo diocesano e la Conferenza o il suo presidente non può agire validamente in nome di tutti i Vescovi, a meno che tutti e singoli i Vescovi non abbiano dato il loro consenso.`
const t456 = `Conclusa l'assemblea plenaria della Conferenza Episcopale, il presidente trasmetta alla Sede Apostolica una relazione degli atti della Conferenza, come pure i suoi decreti, sia perché vengano portati a conoscenza della Sede Apostolica, sia perché essa possa recognire i decreti, se ve ne sono.`
const t457 = `È compito del consiglio permanente dei Vescovi curare che vengano preparate le questioni da trattare nell'assemblea plenaria della Conferenza e che vengano debitamente eseguite le decisioni prese nella stessa assemblea; ad esso compete anche trattare gli altri affari che gli vengono affidati a norma degli statuti.`
const t458 = `È compito della segreteria generale:
1) redigere la relazione degli atti e dei decreti dell'assemblea plenaria della Conferenza e degli atti del consiglio permanente dei Vescovi, e comunicarla a tutti i membri della Conferenza, e inoltre redigere gli altri atti che le vengono affidati dal presidente della Conferenza o dal consiglio permanente;
2) comunicare alle Conferenze Episcopali confinanti gli atti e i documenti che la Conferenza nell'assemblea plenaria o il consiglio permanente dei Vescovi stabiliscono di trasmettere loro.`
const t459 = `§1. Si favoriscano le relazioni tra le Conferenze Episcopali, soprattutto vicine, per promuovere e tutelare il maggior bene.

§2. Ogni volta però che le Conferenze intraprendono azioni o programmi di carattere internazionale, è necessario che venga sentita la Sede Apostolica.`

export const canons431to459: CanonInput[] = [
  canon(431, 1, 'Province ecclesiastiche', ['provincia ecclesiastica', 'Chiese particolari', 'suprema autorità'], t431, URL_431_434),
  canon(432, 1, 'Autorità e personalità giuridica della provincia', ['concilio provinciale', 'Metropolita', 'personalità giuridica'], t432, URL_431_434),
  canon(433, 1, 'Regioni ecclesiastiche', ['regione ecclesiastica', 'Conferenza Episcopale', 'Santa Sede'], t433, URL_431_434),
  canon(434, 1, 'Assemblea dei Vescovi della regione', ['regione ecclesiastica', 'cooperazione pastorale'], t434, URL_431_434),
  canon(435, 2, 'Il Metropolita', ['Metropolita', 'Arcivescovo', 'provincia ecclesiastica'], t435, URL_435_438),
  canon(436, 2, 'Compiti e potestà del Metropolita', ['Metropolita', 'diocesi suffraganee', 'visita canonica'], t436, URL_435_438),
  canon(437, 2, 'Il pallio del Metropolita', ['pallio', 'Metropolita', 'Romano Pontefice'], t437, URL_435_438),
  canon(438, 2, 'Patriarchi e Primati', ['Patriarca', 'Primate', 'potestà di governo'], t438, URL_435_438),
  canon(439, 3, 'Concilio plenario', ['concilio plenario', 'Conferenza Episcopale', 'Sede Apostolica'], t439, URL_439_446),
  canon(440, 3, 'Concilio provinciale', ['concilio provinciale', 'provincia ecclesiastica', 'sede metropolitana'], t440, URL_439_446),
  canon(441, 3, 'Competenze della Conferenza Episcopale sul concilio plenario', ['Conferenza Episcopale', 'concilio plenario'], t441, URL_439_446),
  canon(442, 3, 'Convocazione e presidenza del concilio provinciale', ['Metropolita', 'concilio provinciale', 'Vescovi suffraganei'], t442, URL_439_446),
  canon(443, 3, 'Partecipanti ai concili particolari', ['concili particolari', 'voto deliberativo', 'voto consultivo'], t443, URL_439_446),
  canon(444, 3, 'Obbligo di partecipazione ai concili particolari', ['concili particolari', 'procuratore', 'voto consultivo'], t444, URL_439_446),
  canon(445, 3, 'Potestà del concilio particolare', ['concilio particolare', 'potestà legislativa', 'disciplina ecclesiastica'], t445, URL_439_446),
  canon(446, 3, 'Atti e decreti del concilio particolare', ['decreti', 'Sede Apostolica', 'promulgazione'], t446, URL_439_446),
  canon(447, 4, 'Natura e finalità della Conferenza Episcopale', ['Conferenza Episcopale', 'funzioni pastorali', 'apostolato'], t447, URL_447_459),
  canon(448, 4, 'Ambito territoriale della Conferenza Episcopale', ['Conferenza Episcopale', 'territorio', 'Sede Apostolica'], t448, URL_447_459),
  canon(449, 4, 'Erezione e personalità giuridica della Conferenza Episcopale', ['Conferenza Episcopale', 'personalità giuridica', 'suprema autorità'], t449, URL_447_459),
  canon(450, 4, 'Membri della Conferenza Episcopale', ['Vescovi diocesani', 'Vescovi ausiliari', 'Ordinari'], t450, URL_447_459),
  canon(451, 4, 'Statuti della Conferenza Episcopale', ['statuti', 'consiglio permanente', 'segreteria generale'], t451, URL_447_459),
  canon(452, 4, 'Presidente e segretario generale', ['presidente', 'pro-presidente', 'segretario generale'], t452, URL_447_459),
  canon(453, 4, 'Assemblee plenarie', ['assemblea plenaria', 'Conferenza Episcopale'], t453, URL_447_459),
  canon(454, 4, 'Diritto di voto', ['voto deliberativo', 'voto consultivo', 'Vescovi coadiutori'], t454, URL_447_459),
  canon(455, 4, 'Decreti generali', ['decreti generali', 'recognitio', 'promulgazione'], t455, URL_447_459),
  canon(456, 4, 'Trasmissione degli atti alla Sede Apostolica', ['atti', 'decreti', 'Sede Apostolica'], t456, URL_447_459),
  canon(457, 4, 'Consiglio permanente dei Vescovi', ['consiglio permanente', 'assemblea plenaria'], t457, URL_447_459),
  canon(458, 4, 'Segreteria generale', ['segreteria generale', 'atti', 'Conferenze Episcopali'], t458, URL_447_459),
  canon(459, 4, 'Relazioni tra Conferenze Episcopali', ['Conferenze Episcopali', 'cooperazione', 'Sede Apostolica'], t459, URL_447_459),
]
