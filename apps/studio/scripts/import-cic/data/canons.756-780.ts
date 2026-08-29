import type {CanonInput} from '../types'
import {makeCanon, segments} from './canonSource'

const TITLE = 'cic-1983-book-3-title-1'
const CHAPTER_1 = `${TITLE}-chapter-1`
const CHAPTER_2 = `${TITLE}-chapter-2`
const SOURCE_756_761 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroIII_756-761_it.html'
const SOURCE_762_772 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroIII_762-772_it.html'
const SOURCE_773_780 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroIII_773-780_it.html'

const sourceFor = (n: number) => n <= 761 ? SOURCE_756_761 : n <= 772 ? SOURCE_762_772 : SOURCE_773_780
const unitFor = (n: number) => n <= 761 ? TITLE : n <= 772 ? CHAPTER_1 : CHAPTER_2

const texts: Record<number, string> = {
  756: `§1. Nei riguardi della Chiesa universale la funzione di annunciare il Vangelo è affidata principalmente al Romano Pontefice e al Collegio dei Vescovi.\n\n§2. Nei riguardi della Chiesa particolare loro affidata esercitano tale funzione i singoli Vescovi, i quali in essa sono i moderatori di tutto il ministero della parola; a volte però alcuni Vescovi la esplicano congiuntamente nei riguardi di più Chiese insieme, a norma del diritto.`,
  757: `È proprio dei presbiteri, che sono i cooperatori dei Vescovi, annunciare il Vangelo di Dio; sono tenuti soprattutto a questo dovere, nei riguardi del popolo loro affidato, i parroci e gli altri cui viene commessa la cura delle anime; spetta anche ai diaconi servire il popolo di Dio nel ministero della parola, in comunione con il Vescovo e il suo presbiterio.`,
  758: `I membri degli istituti di vita consacrata, in forza della propria consacrazione a Dio, rendono testimonianza del Vangelo in modo peculiare, e convenientemente essi vengono assunti dal Vescovo in aiuto per annunciare il Vangelo.`,
  759: `I fedeli laici, in forza del battesimo e della confermazione, con la parola e con l'esempio della vita cristiana sono testimoni dell'annuncio evangelico; possono essere anche chiamati a cooperare con il Vescovo e con i presbiteri nell'esercizio del ministero della parola.`,
  760: `Nel ministero della parola, che deve fondarsi sulla sacra Scrittura, la Tradizione, la liturgia, il magistero e la vita della Chiesa, sia integralmente e fedelmente proposto il mistero di Cristo.`,
  761: `Per annunciare la dottrina cristiana si adoperino i diversi mezzi, che sono a disposizione, in primo luogo la predicazione e l'istruzione catechistica, che tengono sempre il posto principale, ma anche la presentazione della dottrina nelle scuole, nelle accademie, conferenze e adunanze di ogni genere, e altresì la diffusione della medesima attraverso le dichiarazioni pubbliche fatte dalla legittima autorità in occasione di taluni eventi con la stampa e con gli altri strumenti di comunicazione sociale.`,
  762: `Dal momento che il popolo di Dio viene radunato in primo luogo dalla parola di Dio vivente, che è del tutto legittimo ricercare dalle labbra dei sacerdoti, i sacri ministri abbiano grande stima della funzione della predicazione, essendo tra i loro principali doveri annunciare a tutti il Vangelo di Dio.`,
  763: `È diritto dei Vescovi predicare dovunque la parola di Dio, non escluse le chiese e gli oratori degli istituti religiosi di diritto pontificio, a meno che il Vescovo del luogo in casi particolari non lo abbia negato espressamente.`,
  764: `Salvo il disposto del can. 765, i presbiteri e i diaconi godono della facoltà di predicare dovunque, da esercitare con il consenso almeno presunto del rettore della chiesa, a meno che la medesima facoltà non sia stata ristretta o tolta del tutto da parte dell'Ordinario competente, o per legge particolare si richieda la licenza espressa.`,
  765: `Per predicare ai religiosi nelle loro chiese o oratori si richiede la licenza del Superiore competente a norma delle costituzioni.`,
  766: `I laici possono essere ammessi a predicare in una chiesa o oratorio, se in determinate circostanze lo richieda la necessità o in casi particolari l'utilità lo consigli, secondo le disposizioni della Conferenza Episcopale, e salvo il can. 767, §1.`,
  767: `§1. Tra le forme di predicazione è eminente l'omelia, che è parte della stessa liturgia ed è riservata al sacerdote o al diacono; in essa lungo il corso dell'anno liturgico siano esposti dal testo sacro i misteri della fede e le norme della vita cristiana.\n\n§2. Nei giorni di domenica e nelle feste di precetto, in tutte le Messe che si celebrano con concorso di popolo, si deve tenere l'omelia né la si può omettere se non per grave causa.\n\n§3. Si raccomanda caldamente che, se si dà un sufficiente concorso di popolo, si tenga l'omelia anche nelle Messe che vengono celebrate durante la settimana, soprattutto quelle celebrate nel tempo di avvento e di quaresima o in occasione di qualche festa o di un evento luttuoso.\n\n§4. Spetta al parroco o al rettore della chiesa curare che queste disposizioni siano osservate religiosamente.`,
  768: `§1. I predicatori della parola divina propongano in primo luogo ai fedeli ciò che è necessario credere e fare per la gloria di Dio e per la salvezza degli uomini.\n\n§2. Impartiscano ai fedeli anche la dottrina che il magistero della Chiesa propone sulla dignità e libertà della persona umana, sull'unità e stabilità della famiglia e sui suoi cómpiti, sugli obblighi che riguardano gli uomini uniti nella società, come pure sul modo di disporre le cose temporali secondo l'ordine stabilito da Dio.`,
  769: `La dottrina cristiana sia proposta in modo conforme alla condizione degli uditori e adattato alle necessità dei tempi.`,
  770: `I parroci in tempi determinati, secondo le disposizioni del Vescovo diocesano, organizzino quelle predicazioni, che denominano esercizi spirituali e sacre missioni, o altre forme adattate alle necessità.`,
  771: `§1. I pastori delle anime, soprattutto i Vescovi e i parroci, siano solleciti che la parola di Dio venga annunciata anche a quei fedeli, i quali per la loro condizione di vita non usufruiscono a sufficienza della comune e ordinaria cura pastorale o ne sono totalmente privi.\n\n§2. Provvedano pure che l'annuncio del Vangelo giunga ai non credenti che vivono nel territorio, dal momento che la cura delle anime deve comprendere anche loro, non altrimenti che i fedeli.`,
  772: `§1. Per ciò che concerne l'esercizio della predicazione, si osservino inoltre da tutti le norme date dal Vescovo diocesano.\n\n§2. Per parlare sulla dottrina cristiana mediante la radio o la televisione, siano osservate le disposizioni date dalla Conferenza Episcopale.`,
  773: `È dovere proprio e grave soprattutto dei pastori delle anime curare la catechesi del popolo cristiano, affinché la fede dei fedeli, per mezzo dell'insegnamento della dottrina e dell'esperienza della vita cristiana, diventi viva, esplicita e operosa.`,
  774: `§1. La sollecitudine della catechesi, sotto la guida della legittima autorità ecclesiastica, riguarda tutti i membri della Chiesa, ciascuno per la propria parte.\n\n§2. I genitori sono tenuti prima di tutti gli altri all'obbligo di formare con la parola e l'esempio i figli nella fede e nella pratica della vita cristiana; sono vincolati da una pari obbligazione coloro che ne fanno le veci e i padrini.`,
  776: `Il parroco, in forza del suo ufficio, è tenuto a curare la formazione catechistica degli adulti, dei giovani e dei fanciulli; a tal fine ricorra alla collaborazione dei chierici addetti alla parrocchia, dei membri degli istituti di vita consacrata come pure delle società di vita apostolica, tenuto conto dell'indole di ciascun istituto, e altresì dei fedeli laici, soprattutto dei catechisti; tutti questi, se non sono legittimamente impediti, non ricusino di prestare volentieri la loro opera.\n\nNella catechesi familiare, promuova e sostenga il compito dei genitori, di cui al can. 774, §2.`,
  777: `In modo peculiare il parroco, tenute presenti le norme stabilite dal Vescovo diocesano, curi:\n1) che si impartisca una catechesi adatta in vista della celebrazione dei sacramenti;\n2) che i fanciulli, mediante l'istruzione catechistica impartita per un congruo tempo, siano debitamente preparati a ricevere per la prima volta i sacramenti della penitenza e della santissima Eucaristia, come pure al sacramento della confermazione;\n3) che i medesimi, ricevuta la prima comunione, abbiano una più abbondante e più profonda formazione catechistica;\n4) che l'istruzione catechetica sia trasmessa anche a quelli che sono impediti nella mente o nel corpo, per quanto lo permette la loro condizione;\n5) che la fede dei giovani e degli adulti, con varie forme e iniziative, sia difesa, illuminata e fatta progredire.`,
  778: `I Superiori religiosi e delle società di vita apostolica curino che nelle proprie chiese, scuole o altre opere in qualunque modo loro affidate, venga impartita diligentemente l'istruzione catechistica.`,
  779: `L'istruzione catechistica sia trasmessa con l'uso di tutti gli aiuti, sussidi didattici e strumenti di comunicazione sociale, che sembrano più efficaci perché i fedeli, in modo adatto alla loro indole, alle loro capacità ed età come pure alle condizioni di vita, siano capaci di apprendere più pienamente la dottrina cattolica e di tradurla in pratica in modo più conveniente.`,
  780: `Gli Ordinari dei luoghi curino che i catechisti siano debitamente preparati a svolgere bene il loro incarico, che cioè venga loro offerta una formazione continua, e che conoscano in modo appropriato la dottrina della Chiesa e imparino teoreticamente e praticamente i princìpi delle discipline pedagogiche.`,
}

const t775Original = `§1. Osservate le disposizioni date dalla Sede Apostolica, spetta al Vescovo diocesano emanare norme circa la materia catechetica e parimenti provvedere che siano disponibili gli strumenti adatti per la catechesi, preparando anche un catechismo, se ciò sembrasse opportuno, e altresì favorire e coordinare le iniziative catechistiche.\n\n§2. Spetta alla Conferenza Episcopale, se pare utile, curare che vengano pubblicati catechismi per il proprio territorio, previa approvazione della Sede Apostolica.\n\n§3. Presso la Conferenza Episcopale può essere istituito l'ufficio catechistico, con la precipua funzione di offrire aiuto alle singole diocesi in materia catechetica.`
const t775Current = t775Original.replace('previa approvazione della Sede Apostolica', 'previa conferma della Sede Apostolica')

const amended775: CanonInput = {
  number: 775,
  editorialTitle: 'Normativa e catechismi',
  keywords: ['catechesi', 'catechismi', 'Conferenza Episcopale', 'conferma'],
  structuralUnitCanonicalId: CHAPTER_2,
  status: 'amended',
  versions: [
    {
      versionId: 'cic-1983-can-775-it-1983',
      versionLabel: 'Versione originaria 1983',
      status: 'superseded',
      validFrom: '1983-11-27',
      validUntil: '2022-02-14',
      language: 'it',
      text: t775Original,
      sourceDocumentTitle: 'Codice di Diritto Canonico',
      sourceCitation: 'CIC 1983, can. 775 — redazione originaria',
      sourceUrl: SOURCE_773_780,
      segments: segments(775, t775Original),
    },
    {
      versionId: 'cic-1983-can-775-it-2022',
      versionLabel: 'Versione vigente dopo Competentias quasdam decernere',
      status: 'current',
      validFrom: '2022-02-15',
      language: 'it',
      text: t775Current,
      sourceDocumentTitle: 'Codice di Diritto Canonico',
      sourceCitation: 'CIC 1983, can. 775',
      sourceUrl: SOURCE_773_780,
      changeSummary: 'Nel §2 il termine “approvazione” è stato sostituito con “conferma” dal Motu Proprio Competentias quasdam decernere (11 febbraio 2022), in vigore dal 15 febbraio 2022.',
      segments: segments(775, t775Current),
    },
  ],
}

const titles: Record<number, string> = {
  756:'Soggetti principali del ministero della parola',757:'Ministero della parola dei presbiteri e diaconi',758:'Testimonianza degli istituti di vita consacrata',759:'Cooperazione dei fedeli laici',760:'Fonti e contenuto del ministero della parola',761:'Mezzi per l’annuncio della dottrina cristiana',762:'Primato della predicazione',763:'Diritto dei Vescovi di predicare',764:'Facoltà di predicare di presbiteri e diaconi',765:'Predicazione ai religiosi',766:'Predicazione dei laici',767:'Omelia',768:'Contenuti della predicazione',769:'Adattamento della predicazione',770:'Esercizi spirituali e sacre missioni',771:'Annuncio ai fedeli privi di cura ordinaria e ai non credenti',772:'Norme sulla predicazione e sui media',773:'Dovere della catechesi',774:'Responsabilità nella catechesi',776:'Compiti catechetici del parroco',777:'Catechesi parrocchiale',778:'Catechesi nelle opere degli istituti',779:'Metodi e strumenti catechetici',780:'Formazione dei catechisti',
}

export const canons756to780: CanonInput[] = [
  ...Object.keys(texts).map(Number).sort((a,b)=>a-b).map((number)=>
    makeCanon(unitFor(number), sourceFor(number), number, titles[number], ['ministero della parola'], texts[number])
  ),
  amended775,
].sort((a,b)=>a.number-b.number)
