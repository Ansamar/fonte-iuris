import type {CanonInput} from '../types'
import {makeCanon} from './canonSource'

const UNIT = 'cic-1983-book-3-title-2'
const SOURCE_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroIII_781-792_it.html'

const texts: Record<number, string> = {
  781: `Dal momento che tutta quanta la Chiesa è per sua natura missionaria e che l'opera di evangelizzazione è da ritenere dovere fondamentale del popolo di Dio, tutti i fedeli, consci della loro responsabilità, assumano la propria parte nell'opera missionaria.`,
  782: `§1. La suprema direzione e coordinamento delle iniziative e delle attività riguardanti l'opera missionaria e la cooperazione per le missioni, compete al Romano Pontefice e al Collegio dei Vescovi.\n\n§2. I singoli Vescovi, in quanto garanti della Chiesa universale e di tutte le Chiese, abbiano una peculiare sollecitudine per l'opera missionaria, soprattutto suscitando, favorendo e sostenendo le iniziative missionarie nella propria Chiesa particolare.`,
  783: `I membri degli istituti di vita consacrata, dal momento che in forza della stessa consacrazione si dedicano al servizio della Chiesa, sono tenuti all'obbligo di prestare l'opera loro in modo speciale nell'azione missionaria, con lo stile proprio dell'istituto.`,
  784: `I missionari, vale a dire coloro che sono mandati dalla competente autorità ecclesiastica a compiere l'opera missionaria, possono essere designati fra gli autoctoni o no, sia chierici secolari, sia membri degli istituti di vita consacrata o delle società di vita apostolica, sia altri fedeli laici.`,
  785: `§1. Nello svolgimento dell'opera missionaria siano assunti i catechisti, cioè fedeli laici debitamente istruiti e eminenti per vita cristiana, perché, sotto la guida del missionario, si dedichino a proporre la dottrina evangelica e a organizzare gli esercizi liturgici e le opere di carità.\n\n§2. I catechisti siano formati nelle scuole a ciò destinate o, dove queste mancano, sotto la guida dei missionari.`,
  786: `L'azione propriamente missionaria, per mezzo della quale la Chiesa è impiantata nei popoli o nei gruppi dove ancora non è stata radicata, viene assolta dalla Chiesa soprattutto mandando gli annunziatori del Vangelo fino a quando le nuove Chiese non siano pienamente costituite, vale a dire quando siano dotate di forze proprie e di mezzi sufficienti, per cui esse stesse siano capaci da sé di compiere l'opera di evangelizzazione.`,
  787: `§1. I missionari, con la testimonianza della vita e della parola, istituiscano un dialogo sincero con i non credenti in Cristo, perché, con procedimento adatto al loro ingegno e cultura, si aprano loro le vie per le quali possano essere efficacemente condotti a conoscere l'annuncio evangelico.\n\n§2. Curino d'istruire nelle verità della fede coloro che giudicano preparati a ricevere l'annuncio evangelico, in modo tale che essi stessi, chiedendolo liberamente, possano essere ammessi a ricevere il battesimo.`,
  788: `§1. Quelli che avranno manifestato la volontà di abbracciare la fede in Cristo, compiuto il tempo del precatecumenato, siano ammessi con le cerimonie liturgiche al catecumenato, e i loro nomi siano scritti nell'apposito libro.\n\n§2. I catecumeni, per mezzo dell'istruzione e del tirocinio della vita cristiana, siano adeguatamente iniziati al mistero della salvezza e vengano introdotti a vivere la fede, la liturgia, la carità del popolo di Dio e l'apostolato.\n\n§3. Spetta alla Conferenza Episcopale emanare statuti con cui ordinare il catecumenato, determinando quali siano gli obblighi dei catecumeni, e quali prerogative si debbano loro riconoscere.`,
  789: `I neofiti siano formati con un'istruzione appropriata a conoscere più profondamente la verità evangelica e ad adempiere i doveri assunti per mezzo del battesimo; siano compenetrati da un sincero amore verso Cristo e la sua Chiesa.`,
  790: `§1. Nei territori di missione spetta al Vescovo diocesano:\n1) promuovere, guidare e coordinare le iniziative e le opere, che tendono all'azione missionaria;\n2) curare che siano stipulate le debite convenzioni con i Moderatori degli istituti che si dedicano all'opera missionaria, e che le relazioni con i medesimi tornino a bene della missione.\n\n§2. Alle disposizioni emanate dal Vescovo diocesano di cui al §1, n. 1, sono sottoposti tutti i missionari, anche religiosi e i loro aiutanti che vivono nella circoscrizione a lui soggetta.`,
  791: `Nelle singole diocesi per favorire la cooperazione missionaria:\n1) si promuovano le vocazioni missionarie;\n2) sia deputato un sacerdote per promuovere efficacemente le iniziative a favore delle missioni, soprattutto le Pontificie Opere Missionarie;\n3) si celebri la giornata annuale per le missioni;\n4) sia versato ogni anno un congruo contributo per le missioni, da trasmettere alla Santa Sede.`,
  792: `Le Conferenze Episcopali istituiscano e promuovano opere, per mezzo delle quali coloro che dalle terre di missione si recano nel territorio delle medesime Conferenze per ragioni di lavoro o di studio, siano accolti fraternamente e vengano aiutati con una adeguata cura pastorale.`,
}

const titles: Record<number, string> = {
  781:'Responsabilità missionaria di tutta la Chiesa',782:'Direzione dell’azione missionaria',783:'Istituti di vita consacrata e missione',784:'Missionari',785:'Catechisti nelle missioni',786:'Finalità dell’azione missionaria',787:'Dialogo e preparazione alla fede',788:'Catecumenato',789:'Formazione dei neofiti',790:'Compiti del Vescovo nei territori di missione',791:'Cooperazione missionaria nelle diocesi',792:'Accoglienza pastorale di chi proviene dalle missioni',
}

export const canons781to792: CanonInput[] = Object.keys(texts)
  .map(Number)
  .sort((a,b)=>a-b)
  .map((number)=>makeCanon(UNIT,SOURCE_URL,number,titles[number],['azione missionaria'],texts[number]))
