import type {CanonInput} from '../types'
import {makeCanon} from './canonSource'

const TITLE = 'cic-1983-book-3-title-3'
const CHAPTER_1 = `${TITLE}-chapter-1`
const CHAPTER_2 = `${TITLE}-chapter-2`
const CHAPTER_3 = `${TITLE}-chapter-3`
const SOURCE_793_795 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroIII_793-795_it.html'
const SOURCE_796_806 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroIII_796-806_it.html'
const SOURCE_807_814 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroIII_807-814_it.html'
const SOURCE_815_821 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroIII_815-821_it.html'

function sourceFor(n: number) {
  if (n <= 795) return SOURCE_793_795
  if (n <= 806) return SOURCE_796_806
  if (n <= 814) return SOURCE_807_814
  return SOURCE_815_821
}

function unitFor(n: number) {
  if (n <= 795) return TITLE
  if (n <= 806) return CHAPTER_1
  if (n <= 814) return CHAPTER_2
  return CHAPTER_3
}

const texts: Record<number, string> = {
  793: `§1. I genitori, come pure coloro che ne fanno le veci, sono vincolati dall'obbligo e hanno il diritto di educare la prole; i genitori cattolici hanno anche il dovere e il diritto di scegliere quei mezzi e quelle istituzioni attraverso i quali, secondo le circostanze di luogo, possano provvedere nel modo più appropriato all'educazione cattolica dei figli.\n\n§2. È diritto dei genitori di usufruire anche degli aiuti che la società civile deve fornire e di cui hanno bisogno nel procurare l'educazione cattolica dei figli.`,
  794: `§1. A titolo speciale il dovere e il diritto di educare spetta alla Chiesa, alla quale è stata affidata da Dio la missione di aiutare gli uomini, perché siano in grado di pervenire alla pienezza della vita cristiana.\n\n§2. È dovere dei pastori delle anime disporre ogni cosa, perché tutti i fedeli possano fruire dell'educazione cattolica.`,
  795: `Dal momento che la vera educazione deve perseguire la formazione integrale della persona umana, in vista del suo fine ultimo e insieme del bene comune delle società, i fanciulli e i giovani siano educati in modo da poter sviluppare armonicamente le proprie doti fisiche, morali e intellettuali, acquistino un più maturo senso di responsabilità e il retto uso della libertà e siano preparati a partecipare attivamente alla vita sociale.`,
  796: `§1. Tra i mezzi per coltivare l'educazione i fedeli stimino grandemente le scuole, le quali appunto sono di precipuo aiuto ai genitori nell'adempiere la loro funzione educativa.\n\n§2. È necessario che i genitori cooperino strettamente con i maestri delle scuole, cui affidano i figli da educare; i maestri da parte loro nell'assolvere il proprio dovere collaborino premurosamente con i genitori; questi poi vanno ascoltati volentieri e inoltre siano istituite e grandemente apprezzate le loro associazioni o riunioni.`,
  797: `È necessario che i genitori nello scegliere le scuole godano di vera libertà; di conseguenza i fedeli devono impegnarsi perché la società civile riconosca ai genitori questa libertà e, osservata la giustizia distributiva, la tuteli anche con sussidi.`,
  798: `I genitori affidino i figli a quelle scuole nelle quali si provvede all'educazione cattolica; se non sono in grado di farlo, sono tenuti all'obbligo di curare che la debita educazione cattolica sia loro impartita al di fuori della scuola.`,
  799: `I fedeli facciano di tutto perché nella società civile le leggi, che ordinano la formazione dei giovani, contemplino nelle scuole stesse anche la loro educazione religiosa e morale, secondo la coscienza dei genitori.`,
  800: `§1. È diritto della Chiesa fondare e dirigere scuole di qualsiasi disciplina, genere e grado.\n\n§2. I fedeli favoriscano le scuole cattoliche, cooperando secondo le proprie forze per fondarle e sostenerle.`,
  801: `Gli istituti religiosi che hanno la missione specifica dell'educazione, mantenendo fedelmente questa loro missione, si adoperino efficacemente per dedicarsi all'educazione cattolica anche attraverso proprie scuole, fondate con il consenso del Vescovo diocesano.`,
  802: `§1. Se non ci sono ancora scuole nelle quali venga trasmessa una educazione impregnata di spirito cristiano, spetta al Vescovo diocesano curare che siano fondate.\n\n§2. Quando ciò sia conveniente, il Vescovo diocesano provveda che vengano fondate pure scuole professionali e tecniche e anche altre, che siano richieste da speciali necessità.`,
  803: `§1. Per scuola cattolica s'intende quella che l'autorità ecclesiastica competente o una persona giuridica ecclesiastica pubblica dirige, oppure quella che l'autorità ecclesiastica riconosce come tale con un documento scritto.\n\n§2. L'istruzione e l'educazione nella scuola cattolica deve fondarsi sui principi della dottrina cattolica; i maestri si distinguano per retta dottrina e per probità di vita.\n\n§3. Nessuna scuola, benché effettivamente cattolica, porti il nome di scuola cattolica, se non per consenso della competente autorità ecclesiastica.`,
  804: `§1. All'autorità della Chiesa è sottoposta l'istruzione e l'educazione religiosa cattolica che viene impartita in qualunque scuola o viene procurata per mezzo dei vari strumenti di comunicazione sociale; spetta alla Conferenza Episcopale emanare norme generali su questo campo d'azione, e spetta al Vescovo diocesano regolarlo e vigilare su di esso.\n\n§2. L'Ordinario del luogo si dia premura che coloro, i quali sono deputati come insegnanti della religione nelle scuole, anche non cattoliche, siano eccellenti per retta dottrina, per testimonianza di vita cristiana e per abilità pedagogica.`,
  805: `È diritto dell'Ordinario del luogo per la propria diocesi di nominare o di approvare gli insegnanti di religione, e parimenti, se lo richiedano motivi di religione o di costumi, di rimuoverli oppure di esigere che siano rimossi.`,
  806: `§1. Al Vescovo diocesano compete il diritto di vigilare e di visitare le scuole cattoliche situate nel suo territorio, anche quelle fondate o dirette da membri di istituti religiosi; a lui parimenti compete dare disposizioni che concernono l'ordinamento generale delle scuole cattoliche: e queste disposizioni hanno valore anche circa le scuole che sono dirette dai medesimi religiosi, salva però la loro autonomia sulla conduzione interna di tali scuole.\n\n§2. Curino i Moderatori delle scuole cattoliche, sotto la vigilanza dell'Ordinario del luogo, che l'istruzione in esse impartita si distingua dal punto di vista scientifico almeno a pari grado che nelle altre scuole della regione.`,
  807: `È diritto della Chiesa istituire e dirigere università di studi, che contribuiscano ad una più profonda cultura degli uomini e a una più piena promozione della persona umana e altresì ad adempiere la funzione d'insegnare della Chiesa stessa.`,
  808: `Nessuna università di studi, benché effettivamente cattolica, porti il titolo ossia il nome di università cattolica, se non per consenso della competente autorità ecclesiastica.`,
  809: `Le Conferenze Episcopali curino che ci siano, se possibile e conveniente, università di studi o almeno facoltà, distribuite in modo appropriato nel loro territorio, nelle quali le diverse discipline, salvaguardata senza dubbio la loro autonomia scientifica, siano studiate e insegnate, tenuto conto della dottrina cattolica.`,
  810: `§1. È dovere dell'autorità competente secondo gli statuti provvedere che nelle università cattoliche siano nominati docenti i quali, oltre che per l'idoneità scientifica e pedagogica, eccellano per integrità di dottrina e per probità di vita, e che, mancando tali requisiti, osservato il modo di procedere definito dagli statuti, siano rimossi dall'incarico.\n\n§2. Le Conferenze Episcopali e i Vescovi diocesani interessati hanno il dovere e il diritto di vigilare, che nelle medesime università siano osservati fedelmente i princìpi della dottrina cattolica.`,
  811: `§1. L'autorità ecclesiastica competente curi che nelle università cattoliche sia eretta la facoltà o l'istituto o almeno la cattedra di teologia, in cui vengano impartite lezioni anche agli studenti laici.\n\n§2. Nelle singole università cattoliche si tengano lezioni, nelle quali si trattino precipuamente le questioni teologiche connesse con le discipline delle medesime facoltà.`,
  812: `Coloro che in qualunque istituto di studi superiori insegnano discipline teologiche, devono avere il mandato della competente autorità ecclesiastica.`,
  813: `Il Vescovo diocesano abbia una intensa cura pastorale degli studenti, anche erigendo una parrocchia, o almeno per mezzo di sacerdoti a ciò stabilmente deputati, e provveda che presso le università, anche non cattoliche, ci siano centri universitari cattolici, che offrano un aiuto soprattutto spirituale alla gioventù.`,
  814: `Le disposizioni, date per le università, si applicano a pari ragione agli altri istituti di studi superiori.`,
  815: `La Chiesa, in forza della sua funzione di annunciare la verità rivelata, ha proprie università o facoltà ecclesiastiche per l'investigazione delle discipline sacre o connesse con le sacre, e per istruire scientificamente gli studenti nelle medesime discipline.`,
  816: `§1. Le università e le facoltà ecclesiastiche possono essere costituite soltanto se erette dalla Sede Apostolica o da questa approvate; ad essa compete pure la loro superiore direzione.\n\n§2. Le singole università e facoltà ecclesiastiche devono avere i propri statuti e il piano degli studi approvati dalla Sede Apostolica.`,
  817: `Nessuna università o facoltà, che non sia stata eretta o approvata dalla Sede Apostolica, può validamente conferire gradi accademici con effetti canonici nella Chiesa.`,
  818: `Le disposizioni date per le università cattoliche nei cann. 810, 812 e 813, hanno valore anche per le università e facoltà ecclesiastiche.`,
  819: `Nella misura in cui lo richieda il bene della diocesi o dell'istituto religioso o anzi della stessa Chiesa universale, i Vescovi diocesani o i Superiori competenti degli istituti devono inviare alle università o facoltà ecclesiastiche giovani, chierici e religiosi, che si segnalino per indole, virtù e ingegno.`,
  820: `I Moderatori e i professori delle università e facoltà ecclesiastiche procurino che le diverse facoltà dell'università collaborino vicendevolmente, per quanto l'oggetto lo consente, e che tra la propria università o facoltà e le altre università o facoltà, anche non ecclesiastiche, ci sia mutua cooperazione, con la quale cioè le medesime con azione congiunta operino concordemente ad un maggior incremento della scienza, per mezzo di convegni, investigazioni scientifiche coordinate e altri sussidi.`,
  821: `La Conferenza Episcopale e il Vescovo diocesano provvedano che, dove è possibile, siano fondati istituti superiori di scienze religiose, nei quali cioè vengano insegnate le discipline teologiche e le altre che concernono la cultura cristiana.`,
}

const titles: Record<number, string> = {
  793:'Diritto-dovere dei genitori nell’educazione',794:'Missione educativa della Chiesa',795:'Finalità dell’educazione',796:'Scuola e collaborazione educativa',797:'Libertà di scelta della scuola',798:'Educazione cattolica dei figli',799:'Educazione religiosa nella legislazione civile',800:'Diritto della Chiesa di fondare scuole',801:'Missione educativa degli istituti religiosi',802:'Compiti del Vescovo circa le scuole',803:'Nozione di scuola cattolica',804:'Istruzione religiosa cattolica',805:'Insegnanti di religione',806:'Vigilanza sulle scuole cattoliche',807:'Diritto della Chiesa di istituire università',808:'Titolo di università cattolica',809:'Università e facoltà nel territorio',810:'Docenti e vigilanza nelle università cattoliche',811:'Teologia nelle università cattoliche',812:'Mandato per l’insegnamento teologico',813:'Pastorale universitaria',814:'Altri istituti di studi superiori',815:'Università e facoltà ecclesiastiche',816:'Erezione e approvazione',817:'Gradi accademici canonici',818:'Norme applicabili alle facoltà ecclesiastiche',819:'Invio degli studenti',820:'Cooperazione accademica',821:'Istituti superiori di scienze religiose',
}

export const canons793to821: CanonInput[] = Object.keys(texts)
  .map(Number)
  .sort((a,b)=>a-b)
  .map((number)=>makeCanon(unitFor(number),sourceFor(number),number,titles[number],['educazione cattolica'],texts[number]))
