import type {CanonInput, CanonSegmentInput} from '../types'

const CHAPTER = 'cic-1983-book-2-part-2-section-2-title-3-chapter-2'
const ARTICLE_1 = `${CHAPTER}-article-1`
const ARTICLE_2 = `${CHAPTER}-article-2`
const ARTICLE_3 = `${CHAPTER}-article-3`

const URL_469_474 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_469-474_it.html'
const URL_475_481 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_475-481_it.html'
const URL_482_491 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_482-491_it.html'
const URL_492_494 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_492-494_it.html'

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

function canon(
  number: number,
  structuralUnitCanonicalId: string,
  editorialTitle: string,
  keywords: string[],
  text: string,
  sourceUrl: string,
): CanonInput {
  return {
    number,
    editorialTitle,
    keywords,
    structuralUnitCanonicalId,
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

const t469 = `La curia diocesana consta degli organismi e delle persone che aiutano il Vescovo nel governo di tutta la diocesi, soprattutto nel dirigere l'attività pastorale, nel curare l'amministrazione della diocesi come pure nell'esercitare la potestà giudiziaria.`
const t470 = `La nomina di coloro che esercitano un ufficio nella curia diocesana spetta al Vescovo diocesano.`
const t471 = `Tutti coloro che sono ammessi agli uffici della curia devono:
1) promettere di adempiere fedelmente l'incarico secondo le modalità determinate dal diritto o dal Vescovo;
2) osservare il segreto nei limiti e secondo le modalità determinate dal diritto o dal Vescovo.`
const t472 = `Circa le cause e le persone che, nella curia, si riferiscono all'esercizio della potestà giudiziaria, si osservino le prescrizioni del Libro VII, I processi; in ordine a ciò che riguarda l'amministrazione della diocesi, si osservino le disposizioni dei canoni seguenti.`
const t473 = `§1. Il Vescovo diocesano deve curare che tutti gli affari inerenti all'amministrazione di tutta la diocesi siano debitamente coordinati e diretti a procurare nel modo più opportuno il bene della porzione di popolo di Dio che gli è affidata.

§2. Spetta allo stesso Vescovo diocesano coordinare l'attività pastorale dei Vicari generali ed episcopali; dove risulta conveniente, può essere nominato il Moderatore di curia, che deve essere un sacerdote e al quale spetta, sotto l'autorità del Vescovo, di coordinare le attività che riguardano gli affari amministrativi da trattare, come pure di curare che gli altri addetti alla curia svolgano fedelmente l'ufficio loro affidato.

§3. Se le situazioni locali, a giudizio del Vescovo, non suggeriscono diversamente, sia nominato Moderatore di curia il Vicario generale oppure, se sono più di uno, uno dei Vicari generali.

§4. Quando lo ritiene opportuno, il Vescovo, per favorire maggiormente l'attività pastorale, può costituire un consiglio episcopale, composto cioè dai Vicari generali e dai Vicari episcopali.`
const t474 = `Gli atti di curia che hanno per loro natura effetto giuridico, devono essere sottoscritti dall'Ordinario da cui provengono, anche in ordine alla validità, e nello stesso tempo devono essere sottoscritti dal cancelliere o dal notaio di curia; il cancelliere poi è tenuto ad informare degli atti il Moderatore di curia.`

const t475 = `§1. In ogni diocesi il Vescovo diocesano deve costituire il Vicario generale affinché, con la potestà ordinaria di cui è munito a norma dei canoni seguenti, presti il suo aiuto al Vescovo stesso nel governo di tutta la diocesi.

§2. Come regola generale, venga costituito un solo Vicario generale, a meno che l'ampiezza della diocesi o il numero degli abitanti oppure altre ragioni pastorali non suggeriscano diversamente.`
const t476 = `Ogni qualvolta lo richieda il buon governo della diocesi, possono essere costituiti dal Vescovo diocesano anche uno o più Vicari episcopali; essi hanno la stessa potestà ordinaria che, per diritto universale, a norma dei canoni seguenti, spetta al Vicario generale, o per una parte determinata della diocesi, o per un genere determinato di affari, o in rapporto ai fedeli di un determinato rito o di un ceto determinato di persone.`
const t477 = `§1. Il Vicario generale e il Vicario episcopale vengono nominati liberamente dal Vescovo diocesano e da lui possono essere liberamente rimossi, fermo restando il disposto del can. 406; il Vicario episcopale che non sia Vescovo ausiliare sia nominato per un tempo da determinarsi nell'atto di costituzione.

§2. Quando il Vicario generale è assente o legittimamente impedito, il Vescovo diocesano può nominarne un altro che lo supplisca; la stessa norma si applica per il Vicario episcopale.`
const t478 = `§1. Il Vicario generale ed episcopale siano sacerdoti di età non inferiore a trent'anni, dottori o licenziati in diritto canonico o teologia oppure almeno veramente esperti in tali discipline, degni di fiducia per sana dottrina, rettitudine, saggezza ed esperienza nel trattare gli affari.

§2. L'ufficio di Vicario generale ed episcopale non è compatibile con l'ufficio di canonico penitenziere; inoltre non si può affidare tale ufficio a consanguinei del Vescovo fino al quarto grado.`
const t479 = `§1. Al Vicario generale compete, in forza dell'ufficio, la stessa potestà esecutiva su tutta la diocesi che, in forza del diritto, spetta al Vescovo diocesano, la potestà cioè di porre tutti gli atti amministrativi, ad eccezione di quelli che il Vescovo si è riservato oppure che richiedono, a norma del diritto, un mandato speciale del Vescovo.

§2. Al Vicario episcopale compete, per il diritto stesso, la medesima potestà di cui nel §1, però circoscritta a quella determinata parte del territorio o a quel genere di affari o a quei fedeli di un rito determinato o di un gruppo soltanto, per i quali è stato costituito, fatta eccezione per quelle cause che il Vescovo ha riservato a sé o al Vicario generale, oppure che, a norma del diritto, richiedono un mandato speciale del Vescovo.

§3. Spettano al Vicario generale e al Vicario episcopale, nell'ambito della propria competenza, anche le facoltà abituali concesse al Vescovo dalla Sede Apostolica, come pure l'esecuzione dei rescritti, a meno che espressamente non sia stato disposto in modo diverso o a meno che non sia stata scelta l'abilità specifica della persona del Vescovo diocesano.`
const t480 = `Il Vicario generale e il Vicario episcopale devono riferire al Vescovo diocesano sulle principali attività programmate e attuate e inoltre non agiscano mai contro la sua volontà e il suo intendimento.`
const t481 = `§1. La potestà del Vicario generale e del Vicario episcopale cessa allo scadere del mandato, con la rinuncia e, salvi restando i cann. 406 e 409, con la rimozione intimata loro dal Vescovo diocesano e inoltre quando la sede episcopale diviene vacante.

§2. Mentre è sospeso l'ufficio del Vescovo diocesano, è sospesa anche la potestà del Vicario generale e del Vicario episcopale, a meno che non siano insigniti della dignità episcopale.`

const t482 = `§1. In ogni curia venga costituito il cancelliere il cui incarico principale, a meno che non sia stabilito altro dal diritto particolare, consiste nel provvedere che gli atti della curia siano redatti compiutamente, e siano custoditi nell'archivio della stessa.

§2. Se si ritiene necessario, al cancelliere può essere dato un aiutante, con il nome di vice-cancelliere.

§3. Il cancelliere e il vice-cancelliere sono per ciò stesso notai e segretari di curia.`
const t483 = `§1. Oltre al cancelliere, possono essere costituiti altri notai, la cui scrittura o firma fa pubblica fede, e questo o per tutti gli atti, o per gli atti giudiziari solamente, o per gli atti di una causa determinata o di un negozio soltanto.

§2. Il cancelliere e i notai devono essere di integra reputazione e al di sopra di ogni sospetto; nelle cause in cui può essere in discussione la fama di un sacerdote, il notaio deve essere sacerdote.`
const t484 = `È dovere dei notai:
1) stendere per iscritto gli atti e gli strumenti riguardanti i decreti, le disposizioni, gli obblighi e le altre questioni per le quali si richiede il loro intervento;
2) redigere fedelmente per scritto le pratiche in corso e apporvi la firma insieme con l'indicazione del luogo, del giorno, del mese e dell'anno;
3) esibire dal registro con le dovute cautele, a chi ne fa legittima richiesta, gli atti e gli strumenti e dichiararne le copie conformi all'originale.`
const t485 = `Il cancelliere e gli altri notai possono essere liberamente rimossi dall'ufficio da parte del Vescovo diocesano, non però dall'Amministratore diocesano, se non con il consenso del collegio dei consultori.`
const t486 = `§1. Tutti i documenti che riguardano la diocesi o le parrocchie devono essere custoditi con la massima cura.

§2. In ogni curia si costituisca in luogo sicuro l'archivio o tabularium diocesano per custodirvi, disposti secondo un ordine determinato e diligentemente chiusi, gli strumenti e le scritture che riguardano le questioni spirituali e temporali della diocesi.

§3. Dei documenti contenuti nell'archivio si compili un inventario o catalogo, con un breve riassunto delle singole scritte.`
const t487 = `§1. L'archivio deve rimanere chiuso e ne abbiano la chiave solo il Vescovo e il cancelliere; a nessuno è lecito entrarvi se non con licenza del Vescovo oppure, contemporaneamente, del Moderatore della curia e del cancelliere.

§2. È diritto degli interessati ottenere, personalmente o mediante un procuratore, copia autentica manoscritta o fotostatica dei documenti che per loro natura sono pubblici e che riguardano lo stato della propria persona.`
const t488 = `Non è lecito asportare documenti dall'archivio, se non per breve tempo soltanto e con il consenso del Vescovo oppure, contemporaneamente, del Moderatore della curia e del cancelliere.`
const t489 = `§1. Vi sia nella curia diocesana anche un archivio segreto o almeno, nell'archivio comune, vi sia un armadio o una cassa chiusi a chiave e che non possano essere rimossi dalla loro sede; in essi si custodiscano con estrema cautela i documenti che devono essere conservati sotto segreto.

§2. Ogni anno si distruggano i documenti che riguardano le cause criminali in materia di costumi, se i rei sono morti oppure se tali cause si sono concluse da un decennio con una sentenza di condanna, conservando un breve sommario del fatto con il testo della sentenza definitiva.`
const t490 = `§1. Solo il Vescovo abbia la chiave dell'archivio segreto.

§2. Mentre la sede è vacante, l'archivio o l'armadio segreto non si apra se non in caso di vera necessità dallo stesso Amministratore diocesano.

§3. Non siano asportati documenti dall'archivio o armadio segreto.`
const t491 = `§1. Il Vescovo diocesano abbia cura che anche gli atti e i documenti degli archivi delle chiese cattedrali, collegiate, parrocchiali e delle altre chiese che sono presenti nel suo territorio vengano diligentemente conservati e che si compilino inventari o cataloghi in due esemplari, di cui uno sia conservato nell'archivio della rispettiva chiesa e l'altro nell'archivio diocesano.

§2. Il Vescovo diocesano abbia anche cura che nella diocesi vi sia un archivio storico e che i documenti che hanno valore storico vi si custodiscano diligentemente e siano ordinati sistematicamente.

§3. Per consultare o asportare gli atti e i documenti di cui ai §§1 e 2, si osservino le norme stabilite dal Vescovo diocesano.`

const t492 = `§1. In ogni diocesi venga costituito il consiglio per gli affari economici, presieduto dallo stesso Vescovo diocesano o da un suo delegato; esso è composto da almeno tre fedeli, veramente esperti in economia e nel diritto civile ed eminenti per integrità, nominati dal Vescovo.

§2. I membri del consiglio per gli affari economici siano nominati per un quinquennio, però, terminato tale periodo, possono essere assunti ancora per altri quinquenni.

§3. Sono esclusi dal consiglio per gli affari economici i congiunti del Vescovo fino al quarto grado di consanguineità o di affinità.`
const t493 = `Oltre ai compiti ad esso affidati nel Libro V, I beni temporali della Chiesa, spetta al consiglio per gli affari economici predisporre ogni anno, secondo le indicazioni del Vescovo diocesano, il bilancio dei proventi e delle spese che si prevedono per l'anno seguente in riferimento alla gestione generale della diocesi e inoltre approvare, alla fine dell'anno, il bilancio delle entrate e delle uscite.`
const t494 = `§1. In ogni diocesi, dopo aver sentito il collegio dei consultori e il consiglio per gli affari economici, il Vescovo nomini un economo; egli sia veramente esperto in economia e particolarmente distinto per onestà.

§2. L'economo sia nominato per un quinquennio, però, scaduto tale periodo, può essere ancora nominato per altri quinquenni; mentre è in carica, non sia rimosso se non per grave causa da valutarsi dal Vescovo, dopo aver sentito il collegio dei consultori e il consiglio per gli affari economici.

§3. È compito dell'economo, secondo le modalità definite dal consiglio per gli affari economici, amministrare i beni della diocesi sotto l'autorità del Vescovo, fare sulla base delle entrate stabili della diocesi le spese che il Vescovo o altri da lui incaricati abbiano legittimamente ordinato.

§4. Nel corso dell'anno l'economo deve presentare al consiglio per gli affari economici il bilancio delle entrate e delle uscite.`

export const canons469to494: CanonInput[] = [
  canon(469, CHAPTER, 'Natura e funzione della curia diocesana', ['curia diocesana', 'governo della diocesi', 'potestà giudiziaria'], t469, URL_469_474),
  canon(470, CHAPTER, 'Nomina degli officiali di curia', ['curia diocesana', 'nomina', 'Vescovo diocesano'], t470, URL_469_474),
  canon(471, CHAPTER, 'Obblighi degli officiali di curia', ['uffici di curia', 'fedeltà', 'segreto'], t471, URL_469_474),
  canon(472, CHAPTER, 'Norme applicabili alla curia', ['curia', 'potestà giudiziaria', 'amministrazione diocesana'], t472, URL_469_474),
  canon(473, CHAPTER, 'Coordinamento della curia diocesana', ['Moderatore di curia', 'Vicari', 'consiglio episcopale'], t473, URL_469_474),
  canon(474, CHAPTER, 'Sottoscrizione degli atti di curia', ['atti di curia', 'Ordinario', 'cancelliere'], t474, URL_469_474),
  canon(475, ARTICLE_1, 'Vicario generale', ['Vicario generale', 'potestà ordinaria', 'governo diocesano'], t475, URL_475_481),
  canon(476, ARTICLE_1, 'Vicari episcopali', ['Vicario episcopale', 'potestà ordinaria', 'diocesi'], t476, URL_475_481),
  canon(477, ARTICLE_1, 'Nomina e rimozione dei Vicari', ['Vicario generale', 'Vicario episcopale', 'nomina'], t477, URL_475_481),
  canon(478, ARTICLE_1, 'Requisiti e incompatibilità dei Vicari', ['Vicari', 'requisiti', 'incompatibilità'], t478, URL_475_481),
  canon(479, ARTICLE_1, 'Potestà dei Vicari', ['potestà esecutiva', 'Vicario generale', 'Vicario episcopale'], t479, URL_475_481),
  canon(480, ARTICLE_1, 'Rapporto dei Vicari con il Vescovo', ['Vicari', 'Vescovo diocesano', 'coordinamento'], t480, URL_475_481),
  canon(481, ARTICLE_1, 'Cessazione della potestà dei Vicari', ['Vicari', 'cessazione', 'sede vacante'], t481, URL_475_481),
  canon(482, ARTICLE_2, 'Cancelliere e vice-cancelliere', ['cancelliere', 'vice-cancelliere', 'archivio'], t482, URL_482_491),
  canon(483, ARTICLE_2, 'Notai di curia', ['notai', 'cancelliere', 'pubblica fede'], t483, URL_482_491),
  canon(484, ARTICLE_2, 'Compiti dei notai', ['notai', 'atti', 'copie autentiche'], t484, URL_482_491),
  canon(485, ARTICLE_2, 'Rimozione del cancelliere e dei notai', ['cancelliere', 'notai', 'rimozione'], t485, URL_482_491),
  canon(486, ARTICLE_2, 'Archivio diocesano', ['archivio diocesano', 'documenti', 'inventario'], t486, URL_482_491),
  canon(487, ARTICLE_2, 'Accesso all’archivio diocesano', ['archivio', 'accesso', 'copie autentiche'], t487, URL_482_491),
  canon(488, ARTICLE_2, 'Asportazione dei documenti', ['archivio', 'documenti', 'asportazione'], t488, URL_482_491),
  canon(489, ARTICLE_2, 'Archivio segreto', ['archivio segreto', 'documenti', 'segreto'], t489, URL_482_491),
  canon(490, ARTICLE_2, 'Custodia dell’archivio segreto', ['archivio segreto', 'Vescovo', 'sede vacante'], t490, URL_482_491),
  canon(491, ARTICLE_2, 'Archivi ecclesiastici e archivio storico', ['archivio storico', 'archivi parrocchiali', 'documenti'], t491, URL_482_491),
  canon(492, ARTICLE_3, 'Consiglio per gli affari economici', ['consiglio affari economici', 'diocesi', 'Vescovo diocesano'], t492, URL_492_494),
  canon(493, ARTICLE_3, 'Bilanci diocesani', ['bilancio', 'consiglio affari economici', 'diocesi'], t493, URL_492_494),
  canon(494, ARTICLE_3, 'Economo diocesano', ['economo', 'amministrazione', 'beni diocesani'], t494, URL_492_494),
]
