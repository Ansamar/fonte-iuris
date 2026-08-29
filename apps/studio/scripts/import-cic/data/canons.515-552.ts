import type {CanonInput, CanonSegmentInput} from '../types'

const UNIT = 'cic-1983-book-2-part-2-section-2-title-3-chapter-6'
const SOURCE_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_515-552_it.html'

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

function amendedCanon535(text: string): CanonInput {
  return {
    number: 535,
    editorialTitle: 'Libri e archivio parrocchiale',
    keywords: ['libri parrocchiali', 'archivio', 'battesimo', 'Chiesa sui iuris'],
    structuralUnitCanonicalId: UNIT,
    status: 'amended',
    versions: [
      {
        versionId: 'cic-1983-can-535-it-2016',
        versionLabel: 'Versione vigente dopo De concordia inter Codices',
        status: 'current',
        language: 'it',
        text,
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: 'CIC 1983, can. 535',
        sourceUrl: SOURCE_URL,
        changeSummary: 'Il §2 è stato sostituito dall’art. 3 del Motu Proprio De concordia inter Codices (31 maggio 2016).',
        segments: segments(535, text),
      },
    ],
  }
}

const t515 = `§1. La parrocchia è una determinata comunità di fedeli che viene costituita stabilmente nell'àmbito di una Chiesa particolare, la cui cura pastorale è affidata, sotto l'autorità del Vescovo diocesano, ad un parroco quale suo proprio pastore.

§2. Spetta unicamente al Vescovo diocesano erigere, sopprimere o modificare le parrocchie; egli non le eriga, non le sopprima e non le modifichi in modo rilevante senza aver sentito il consiglio presbiterale.

§3. La parrocchia eretta legittimamente gode di personalità giuridica per il diritto stesso.`
const t516 = `§1. A meno che il diritto non disponga diversamente, alla parrocchia è equiparata la quasi-parrocchia, che è una comunità determinata di fedeli nell'àmbito della Chiesa particolare, affidata ad un sacerdote come suo pastore, che, per speciali circostanze, non è ancora stata eretta come parrocchia.

§2. Quando una comunità non può essere eretta come parrocchia o quasi-parrocchia, il Vescovo diocesano provveda in altro modo alla sua cura pastorale.`
const t517 = `§1. Quando le circostanze lo richiedono, la cura pastorale di una parrocchia, o di più parrocchie contemporaneamente, può essere affidata in solido a più sacerdoti, a condizione tuttavia che uno di essi ne sia il moderatore nell'esercizio della cura pastorale, tale cioè che diriga l'attività comune e di essa risponda davanti al Vescovo.

§2. Nel caso che il Vescovo diocesano, a motivo della scarsità di sacerdoti, abbia giudicato di dover affidare ad un diacono o ad una persona non insignita del carattere sacerdotale o ad una comunità di persone una partecipazione nell'esercizio della cura pastorale di una parrocchia, costituisca un sacerdote il quale, con la potestà e le facoltà di parroco, sia il moderatore della cura pastorale.`
const t518 = `Come regola generale, la parrocchia sia territoriale, tale cioè che comprenda tutti i fedeli di un determinato territorio; dove però risulti opportuno, vengano costituite parrocchie personali, sulla base del rito, della lingua, della nazionalità dei fedeli di un territorio, oppure anche sulla base di altri criteri.`
const t519 = `Il parroco è il pastore proprio della parrocchia affidatagli, esercitando la cura pastorale di quella comunità sotto l'autorità del Vescovo diocesano, con il quale è chiamato a partecipare al ministero di Cristo, per compiere al servizio della comunità le funzioni di insegnare, santificare e governare, anche con la collaborazione di altri presbiteri o diaconi e con l'apporto dei fedeli laici, a norma del diritto.`
const t520 = `§1. Il parroco non sia una persona giuridica; tuttavia il Vescovo diocesano, ma non l'Amministratore diocesano, con il consenso del Superiore competente, può affidare una parrocchia ad un istituto religioso clericale o ad una società clericale di vita apostolica, anche erigendola presso la chiesa dell'istituto o della società, a condizione però che un solo presbitero sia il parroco della parrocchia, oppure, se la cura pastorale è affidata in solido a più presbiteri, il moderatore di cui nel can. 517, §1.

§2. L'assegnazione della parrocchia di cui al §1 può essere fatta sia in perpetuo, sia a tempo determinato; in ambedue i casi avvenga mediante una convenzione scritta stipulata fra il Vescovo diocesano e il Superiore competente dell'istituto o della società; in essa, fra l'altro, venga definito espressamente e con precisione tutto quello che riguarda l'attività da svolgere, le persone da impiegarvi e gli aspetti economici.`
const t521 = `§1. Perché uno sia nominato parroco validamente, deve essere costituito nel sacro ordine del presbiterato.

§2. Si distingua inoltre per sana dottrina e onestà di costumi, sia dotato di zelo per le anime e di ogni altra virtù e abbia quelle qualità che sono richieste sia dal diritto universale, sia dal diritto particolare per la cura pastorale della parrocchia in questione.

§3. Per conferire a qualcuno l'ufficio di parroco, è opportuno che venga accertata con sicurezza la sua idoneità nel modo determinato dal Vescovo, anche mediante un esame.`
const t522 = `È necessario che il parroco goda di stabilità, perciò venga nominato a tempo indeterminato; il Vescovo diocesano può nominarlo a tempo determinato solamente se ciò fu ammesso per decreto dalla Conferenza Episcopale.`
const t523 = `Fermo restando il disposto del can. 682, §1, la provvisione dell'ufficio di parroco spetta al Vescovo diocesano; essa avviene mediante libero conferimento, a meno che qualcuno non abbia il diritto di presentazione o di elezione.`
const t524 = `Il Vescovo diocesano, dopo aver valutato tutte le circostanze, affidi la parrocchia vacante a chi ritiene idoneo ad esercitarvi la cura pastorale, esclusa ogni preferenza di persone; per giudicarne l'idoneità, senta il vicario foraneo ed esegua le indagini opportune, uditi, se del caso, determinati presbiteri come pure fedeli laici.`
const t525 = `Mentre la sede è vacante o impedita, all'Amministratore diocesano o a colui che regge interinalmente la diocesi spetta:
1) concedere l'istituzione o la conferma ai presbiteri legittimamente presentati o eletti per una parrocchia;
2) nominare i parroci se la sede è vacante o impedita da un anno.`
const t526 = `§1. Il parroco abbia la cura pastorale di una sola parrocchia; tuttavia, per la scarsità di sacerdoti o per altre circostanze, può essere affidata al medesimo parroco la cura di più parrocchie vicine.

§2. Nella medesima parrocchia vi sia soltanto un parroco o un moderatore a norma del can. 517, §1, riprovata ogni consuetudine contraria e revocato ogni privilegio contrario.`
const t527 = `§1. Colui che è stato promosso alla cura pastorale di una parrocchia, la ottiene ed è tenuto ad esercitarla dal momento della presa di possesso.

§2. L'immissione in possesso del parroco spetta all'Ordinario del luogo o ad un sacerdote da lui delegato e devono essere osservate le modalità determinate dalla legge particolare o dalla legittima consuetudine; tuttavia, per giusta causa, il medesimo Ordinario può dispensare da tali modalità; in tal caso la dispensa notificata alla parrocchia sostituisce la presa di possesso.

§3. L'Ordinario del luogo determini il tempo entro il quale deve avvenire la presa di possesso della parrocchia; trascorso inutilmente tale tempo, se non si sia opposto un giusto impedimento, può dichiarare la parrocchia vacante.`
const t528 = `§1. Il parroco è tenuto a fare in modo che la parola di Dio sia integralmente annunciata a coloro che si trovano nella parrocchia; perciò curi che i fedeli laici siano istruiti nelle verità della fede, soprattutto con l'omelia da tenere nelle domeniche e nelle feste di precetto e con l'istruzione catechistica da impartire; favorisca inoltre le attività che promuovono lo spirito evangelico, anche in ordine alla giustizia sociale; abbia cura speciale della formazione cattolica dei fanciulli e dei giovani; si impegni in ogni modo, anche con la collaborazione dei fedeli, perché l'annuncio evangelico giunga anche a coloro che si sono allontanati dalla pratica religiosa o non professano la vera fede.

§2. Il parroco faccia in modo che la santissima Eucaristia sia il centro dell'assemblea parrocchiale dei fedeli; si adoperi perché i fedeli si nutrano mediante la celebrazione devota dei sacramenti e in special modo perché si accostino frequentemente al sacramento della santissima Eucaristia e della penitenza; si impegni inoltre a fare in modo che i fedeli siano formati alla preghiera, da praticare anche nella famiglia, e partecipino consapevolmente e attivamente alla sacra liturgia, di cui il parroco deve essere il moderatore nella sua parrocchia, sotto l'autorità del Vescovo diocesano e sulla quale è tenuto a vigilare perché non si insinuino abusi.`
const t529 = `§1. Per adempiere diligentemente l'ufficio di pastore, il parroco cerchi di conoscere i fedeli affidati alle sue cure; perciò visiti le famiglie, partecipando alle sollecitudini dei fedeli, soprattutto alle loro angosce e ai loro lutti, confortandoli nel Signore e, se hanno mancato in qualche cosa, correggendoli con prudenza; assista con traboccante carità gli ammalati, soprattutto quelli vicini alla morte, nutrendoli con sollecitudine dei sacramenti e raccomandandone l'anima a Dio; con speciale diligenza sia vicino ai poveri e agli ammalati, agli afflitti, a coloro che sono soli, agli esuli e a tutti coloro che attraversano particolari difficoltà; si impegni anche perché gli sposi e i genitori siano sostenuti nell'adempimento dei loro doveri e favorisca l'incremento della vita cristiana nella famiglia.

§2. Il parroco riconosca e promuova il ruolo che hanno i fedeli laici nella missione della Chiesa, favorendo le loro associazioni che si propongono finalità religiose. Collabori con il proprio Vescovo e con il presbiterio della diocesi, impegnandosi anche perché i fedeli si prendano cura di favorire la comunione parrocchiale, perché si sentano membri e della diocesi e della Chiesa universale e perché partecipino e sostengano le opere finalizzate a promuovere la comunione.`
const t530 = `Le funzioni affidate al parroco in modo speciale sono le seguenti:
1) amministrare il battesimo;
2) amministrare il sacramento della confermazione a coloro che sono in pericolo di morte, a norma del can. 883, n. 3;
3) amministrare il Viatico e l'unzione degli infermi, fermo restando il disposto del can. 1003, §§2 e 3, e impartire la benedizione apostolica;
4) assistere al matrimonio e benedire le nozze;
5) celebrare i funerali;
6) benedire il fonte battesimale nel tempo pasquale, guidare le processioni fuori della chiesa e impartire le benedizioni solenni fuori della chiesa;
7) celebrare l'Eucaristia più solenne nelle domeniche e nelle feste di precetto.`
const t531 = `Anche se è un altro a svolgere qualche incarico parrocchiale, le offerte ricevute dai fedeli in tale occasione siano versate nel fondo parrocchiale, a meno che, quando si tratta di offerte volontarie, non consti l'intenzione contraria dell'offerente; spetta al Vescovo diocesano, sentito il consiglio presbiterale, stabilire le norme con le quali si provvede alla destinazione di tali offerte e la rimunerazione dei chierici che svolgono il medesimo incarico.`
const t532 = `Il parroco rappresenta la parrocchia, a norma del diritto, in tutti i negozi giuridici; curi che i beni della parrocchia siano amministrati a norma dei cann. 1281-1288.`
const t533 = `§1. Il parroco è tenuto all'obbligo di risiedere nella casa parrocchiale in vicinanza della chiesa; tuttavia in casi particolari, per giusta causa, l'Ordinario del luogo può permettere che dimori altrove, soprattutto se si tratta di un'abitazione comune a più presbiteri, purché si sia provveduto in modo opportuno e adeguato all'adempimento degli incarichi parrocchiali.

§2. A meno che non sussista un motivo grave, il parroco può assentarsi ogni anno dalla parrocchia per ferie al massimo per un mese, continuo o interrotto; in questo tempo delle ferie non vengono computati i giorni che il parroco dedica una volta all'anno al ritiro spirituale; tuttavia, per assentarsi dalla parrocchia per un tempo superiore ad una settimana, il parroco è tenuto ad avvertirne l'Ordinario del luogo.

§3. Spetta al Vescovo diocesano stabilire norme che assicurino, durante l'assenza del parroco, l'esercizio della cura pastorale della parrocchia tramite un sacerdote fornito delle debite facoltà.`
const t534 = `§1. Dopo aver preso possesso della parrocchia, il parroco è tenuto all'obbligo di applicare la Messa per il popolo affidatogli ogni domenica e nelle feste che nella sua diocesi sono di precetto; chi ne è legittimamente impedito la applichi negli stessi giorni mediante un altro oppure, in giorni diversi, la applichi personalmente.

§2. Il parroco che ha la cura di più parrocchie, nei giorni di cui al §1, è tenuto ad applicare una sola Messa per tutto il popolo affidatogli.

§3. Il parroco che non abbia soddisfatto all'obbligo di cui nei §§1 e 2, applichi quanto prima tante Messe per il popolo quante ne ha tralasciate.`
const t535 = `§1. In ogni parrocchia vi siano i libri parrocchiali, cioè il libro dei battezzati, dei matrimoni, dei defunti ed eventualmente altri libri secondo le disposizioni date dalla Conferenza Episcopale o dal Vescovo diocesano; il parroco provveda che tali libri siano redatti accuratamente e diligentemente conservati.

§2. Nel libro dei battezzati si annoti anche l'ascrizione a una Chiesa sui iuris o il passaggio ad altra Chiesa, nonché la confermazione e tutto ciò che riguarda lo stato canonico dei fedeli, in rapporto al matrimonio, salvo il disposto del can. 1133, all'adozione, all'ordine sacro e alla professione perpetua emessa in un istituto religioso; tali annotazioni vengano sempre riportate nei certificati di battesimo.

§3. Ogni parrocchia abbia il proprio sigillo; gli attestati emessi sullo stato canonico dei fedeli, come pure tutti gli atti che possono avere rilevanza giuridica, siano sottoscritti dal parroco o da un suo delegato e muniti del sigillo parrocchiale.

§4. In ogni parrocchia vi sia il tabularium o archivio, in cui vengano custoditi i libri parrocchiali, insieme con le lettere dei Vescovi e gli altri documenti che si devono conservare per la loro necessità o utilità; tali libri e documenti devono essere controllati dal Vescovo diocesano o dal suo delegato durante la visita o in altro tempo opportuno e il parroco faccia attenzione che essi non vadano in mano ad estranei.

§5. Anche i libri parrocchiali più antichi vengano custoditi diligentemente, secondo le disposizioni del diritto particolare.`
const t536 = `§1. Se risulta opportuno a giudizio del Vescovo diocesano, dopo aver sentito il consiglio presbiterale, in ogni parrocchia venga costituito il consiglio pastorale, che è presieduto dal parroco e nel quale i fedeli, insieme con coloro che partecipano alla cura pastorale della parrocchia in forza del proprio ufficio, prestano il loro aiuto nel promuovere l'attività pastorale.

§2. Il consiglio pastorale ha solamente voto consultivo ed è retto dalle norme stabilite dal Vescovo diocesano.`
const t537 = `In ogni parrocchia vi sia il consiglio per gli affari economici che è retto, oltre che dal diritto universale, dalle norme date dal Vescovo diocesano; in esso i fedeli, scelti secondo le medesime norme, aiutino il parroco nell'amministrazione dei beni della parrocchia, fermo restando il disposto del can. 532.`
const t538 = `§1. Il parroco cessa dall'ufficio con la rimozione o il trasferimento deciso da parte del Vescovo diocesano a norma del diritto, con la rinuncia fatta dal parroco stesso per giusta causa, la quale, per essere valida, deve essere accettata dal Vescovo, e inoltre cessa allo scadere del tempo se fu costituito a tempo determinato, secondo le disposizioni del diritto particolare di cui al can. 522.

§2. Il parroco membro di un istituto religioso o incardinato in una società di vita apostolica, viene rimosso a norma del can. 682, §2.

§3. Compiuti i settantacinque anni, il parroco è invitato a presentare la rinuncia all'ufficio al Vescovo diocesano, il quale, considerata ogni circostanza di persona e di luogo, decida se accettarla o differirla; il Vescovo diocesano deve provvedere in modo adeguato al sostentamento e all'abitazione del rinunciante, attese le norme emanate dalla Conferenza Episcopale.`
const t539 = `Quando la parrocchia è vacante, oppure quando il parroco è impedito nell'esercizio dell'ufficio pastorale nella parrocchia per prigionia, esilio o confino, per inabilità o malferma salute oppure per altre cause, il Vescovo diocesano designi quanto prima l'amministratore parrocchiale, il sacerdote cioè che supplisca il parroco a norma del can. 540.`
const t540 = `§1. L'amministratore parrocchiale è tenuto agli stessi doveri e ha gli stessi diritti del parroco, a meno che il Vescovo diocesano non stabilisca diversamente.

§2. All'amministratore parrocchiale non è lecito compiere nulla che rechi pregiudizio ai diritti del parroco o che possa essere di danno ai beni parrocchiali.

§3. Al termine del suo incarico, l'amministratore parrocchiale presenti al parroco il rendiconto.`
const t541 = `§1. Quando la parrocchia diviene vacante e quando il parroco è impedito nell'esercizio della funzione pastorale, prima della costituzione dell'amministratore parrocchiale, assuma interinalmente il governo della parrocchia il vicario parrocchiale; se essi sono più d'uno, il più anziano per nomina; se poi mancano i vicari, lo assuma il parroco che è indicato dal diritto particolare.

§2. Chi assume il governo della parrocchia a norma del §1, avverta immediatamente l'Ordinario del luogo che la parrocchia è vacante.`
const t542 = `I sacerdoti ai quali, a norma del can. 517, §1, viene affidata in solido la cura pastorale di una parrocchia o di più parrocchie contemporaneamente:
1) devono possedere le qualità di cui al can. 521;
2) siano nominati o istituiti a norma di quanto dispongono i cann. 522 e 524;
3) ottengono la cura pastorale solo dal momento della presa di possesso; il loro moderatore viene immesso in possesso a norma di quanto prescrive il can. 527, §2; per gli altri sacerdoti poi la professione di fede emessa legittimamente tiene il posto della presa di possesso.`
const t543 = `§1. Se a determinati sacerdoti viene affidata in solido la cura pastorale di una parrocchia o di più parrocchie contemporaneamente essi sono tenuti singolarmente, secondo l'ordinamento da loro stessi stabilito, all'obbligo di adempiere i compiti e le funzioni proprie del parroco di cui nei cann. 528, 529 e 530; la facoltà di assistere ai matrimoni come pure le facoltà di dispensa concesse al parroco per il diritto stesso, spettano a tutti, ma devono essere esercitate sotto la direzione del moderatore.

§2. Tutti i sacerdoti del gruppo:
1) sono tenuti all'obbligo della residenza;
2) di comune accordo stabiliscano l'ordine secondo cui uno di loro celebra la Messa per il popolo, a norma del can. 533;
3) solo il moderatore rappresenta nei negozi giuridici la parrocchia o le parrocchie affidate al gruppo.`
const t544 = `Quando cessa dall'ufficio un sacerdote del gruppo di cui nel can. 517, §1, o il moderatore del gruppo, e parimenti quando uno di loro diviene inabile ad esercitare la funzione pastorale, non diviene vacante la parrocchia o le parrocchie la cui cura è affidata al gruppo; spetta al Vescovo diocesano nominare un altro moderatore; però prima che il Vescovo costituisca un altro moderatore, adempia tale ufficio il sacerdote del gruppo più anziano per nomina.`
const t545 = `§1. Ogni volta che risulta necessario o opportuno ai fini della adeguata cura pastorale della parrocchia, al parroco possono essere affiancati uno o più vicari parrocchiali, i quali si dedicano al ministero pastorale come cooperatori del parroco e partecipi della sua sollecitudine, mediante attività e iniziative programmate con il parroco e sotto la sua autorità.

§2. Il vicario parrocchiale può essere costituito perché presti il suo aiuto nell'adempiere tutto il ministero pastorale e, in questo caso, o per tutta la parrocchia o per una parte determinata di essa o per un certo gruppo di fedeli; oppure può anche essere costituito per assolvere uno specifico ministero contemporaneamente in più parrocchie determinate.`
const t546 = `Perché uno sia validamente nominato vicario parrocchiale, è necessario che sia costituito nel sacro ordine del presbiterato.`
const t547 = `Il vicario parrocchiale è nominato liberamente dal Vescovo diocesano, dopo aver sentito, se lo ritiene opportuno, il parroco o i parroci delle parrocchie per le quali è costituito, e inoltre il vicario foraneo, fermo restando il disposto del can. 682, §1.`
const t548 = `§1. Gli obblighi e i diritti del vicario parrocchiale sono definiti, oltre che dai canoni del presente capitolo, anche dagli statuti diocesani come pure dalla lettera del Vescovo diocesano, ma sono determinati in modo più specifico dalle disposizioni del parroco.

§2. A meno che nella lettera del Vescovo diocesano non si disponga espressamente altro, il vicario parrocchiale è tenuto all'obbligo, per l'ufficio che esercita, di aiutare il parroco in tutto il ministero parrocchiale, fatta eccezione per quanto riguarda l'applicazione della Messa per il popolo; è anche tenuto all'obbligo di supplirlo, quando è il caso, a norma del diritto.

§3. Il vicario parrocchiale riferisca regolarmente al parroco le iniziative pastorali programmate e in atto, in modo che il parroco e il vicario o i vicari siano in grado di provvedere, con impegno comune, alla cura pastorale della parrocchia, di cui insieme sono garanti.`
const t549 = `Se il parroco è assente, a meno che il Vescovo diocesano non abbia provveduto in modo diverso a norma del can. 533, §3 e a meno che non sia stato costituito l'amministratore parrocchiale, si osservino le disposizioni del can. 541, §1; in tal caso il vicario è tenuto anche a tutti gli obblighi del parroco, fatta eccezione per l'obbligo di applicare la Messa per il popolo.`
const t550 = `§1. Il vicario parrocchiale è tenuto all'obbligo di risiedere nella parrocchia oppure, se è stato costituito per più parrocchie contemporaneamente, di risiedere in una di esse; tuttavia, per una giusta causa, l'Ordinario del luogo può permettere che risieda altrove, soprattutto se si tratta di una casa comune per più presbiteri, purché ciò non rechi pregiudizio all'adempimento delle funzioni pastorali.

§2. L'Ordinario del luogo curi che si promuova, fra parroco e vicari, dove è possibile, una certa pratica di vita comune nella casa parrocchiale.

§3. Per quanto riguarda il periodo delle vacanze, il vicario parrocchiale ha gli stessi diritti del parroco.`
const t551 = `Per quanto riguarda le offerte che i fedeli fanno al vicario in occasione del ministero pastorale, si osservino le disposizioni del can. 531.`
const t552 = `Il vicario parrocchiale può essere rimosso, per giusta causa, dal Vescovo diocesano o dall'Amministratore diocesano, fermo restando il disposto del can. 682, §2.`

export const canons515to552: CanonInput[] = [
  canon(515, 'Natura ed erezione della parrocchia', ['parrocchia', 'Vescovo diocesano', 'personalità giuridica'], t515),
  canon(516, 'Quasi-parrocchia e altre forme di cura pastorale', ['quasi-parrocchia', 'cura pastorale', 'Chiesa particolare'], t516),
  canon(517, 'Cura pastorale in solido e partecipazione di non presbiteri', ['cura pastorale', 'moderatore', 'scarsità di sacerdoti'], t517),
  canon(518, 'Parrocchie territoriali e personali', ['parrocchia territoriale', 'parrocchia personale', 'rito'], t518),
  canon(519, 'Il parroco come pastore proprio', ['parroco', 'cura pastorale', 'Vescovo diocesano'], t519),
  canon(520, 'Affidamento della parrocchia a istituti o società clericali', ['istituto religioso', 'società di vita apostolica', 'convenzione'], t520),
  canon(521, 'Requisiti per la nomina a parroco', ['parroco', 'presbiterato', 'idoneità'], t521),
  canon(522, 'Stabilità del parroco', ['parroco', 'stabilità', 'tempo determinato'], t522),
  canon(523, 'Provvisione dell’ufficio di parroco', ['parroco', 'provvisione', 'Vescovo diocesano'], t523),
  canon(524, 'Scelta del parroco', ['parroco', 'idoneità', 'vicario foraneo'], t524),
  canon(525, 'Provvisione durante sede vacante o impedita', ['sede vacante', 'Amministratore diocesano', 'parroco'], t525),
  canon(526, 'Numero di parrocchie affidate al parroco', ['parroco', 'parrocchie', 'moderatore'], t526),
  canon(527, 'Presa di possesso della parrocchia', ['parroco', 'presa di possesso', 'Ordinario del luogo'], t527),
  canon(528, 'Ministero della Parola e vita sacramentale', ['parroco', 'Parola di Dio', 'Eucaristia', 'sacramenti'], t528),
  canon(529, 'Cura pastorale dei fedeli e comunione ecclesiale', ['parroco', 'fedeli', 'famiglia', 'comunione'], t529),
  canon(530, 'Funzioni specialmente affidate al parroco', ['parroco', 'battesimo', 'matrimonio', 'Eucaristia'], t530),
  canon(531, 'Offerte in occasione del ministero parrocchiale', ['offerte', 'fondo parrocchiale', 'rimunerazione'], t531),
  canon(532, 'Rappresentanza giuridica della parrocchia', ['parroco', 'negozi giuridici', 'beni parrocchiali'], t532),
  canon(533, 'Obbligo di residenza e assenze del parroco', ['parroco', 'residenza', 'ferie'], t533),
  canon(534, 'Messa per il popolo', ['parroco', 'Messa pro populo', 'obbligo'], t534),
  amendedCanon535(t535),
  canon(536, 'Consiglio pastorale parrocchiale', ['consiglio pastorale', 'parrocchia', 'voto consultivo'], t536),
  canon(537, 'Consiglio parrocchiale per gli affari economici', ['affari economici', 'parrocchia', 'amministrazione'], t537),
  canon(538, 'Cessazione dall’ufficio di parroco', ['parroco', 'rinuncia', 'rimozione', 'trasferimento'], t538),
  canon(539, 'Amministratore parrocchiale', ['amministratore parrocchiale', 'parrocchia vacante', 'parroco impedito'], t539),
  canon(540, 'Diritti e doveri dell’amministratore parrocchiale', ['amministratore parrocchiale', 'diritti', 'doveri'], t540),
  canon(541, 'Governo interinale della parrocchia', ['parrocchia vacante', 'vicario parrocchiale', 'governo interinale'], t541),
  canon(542, 'Requisiti dei sacerdoti con cura pastorale in solido', ['cura pastorale in solido', 'moderatore', 'presa di possesso'], t542),
  canon(543, 'Diritti e obblighi dei sacerdoti in solido', ['cura pastorale in solido', 'moderatore', 'Messa per il popolo'], t543),
  canon(544, 'Cessazione di un sacerdote del gruppo', ['cura pastorale in solido', 'moderatore', 'cessazione'], t544),
  canon(545, 'Natura e compiti del vicario parrocchiale', ['vicario parrocchiale', 'parroco', 'ministero pastorale'], t545),
  canon(546, 'Requisito per la nomina a vicario parrocchiale', ['vicario parrocchiale', 'presbiterato', 'nomina'], t546),
  canon(547, 'Nomina del vicario parrocchiale', ['vicario parrocchiale', 'Vescovo diocesano', 'vicario foraneo'], t547),
  canon(548, 'Diritti e obblighi del vicario parrocchiale', ['vicario parrocchiale', 'parroco', 'ministero parrocchiale'], t548),
  canon(549, 'Supplenza del parroco assente', ['vicario parrocchiale', 'parroco assente', 'supplenza'], t549),
  canon(550, 'Residenza e vita comune del vicario parrocchiale', ['vicario parrocchiale', 'residenza', 'vita comune'], t550),
  canon(551, 'Offerte ricevute dal vicario parrocchiale', ['vicario parrocchiale', 'offerte', 'ministero pastorale'], t551),
  canon(552, 'Rimozione del vicario parrocchiale', ['vicario parrocchiale', 'rimozione', 'Vescovo diocesano'], t552),
]
