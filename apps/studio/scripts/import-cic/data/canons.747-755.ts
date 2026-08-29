import type {CanonInput} from '../types'
import {makeCanon, segments} from './canonSource'

const UNIT = 'cic-1983-book-3'
const SOURCE_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroIII_747-755_it.html'

const texts: Record<number, string> = {
  747: `§1. La Chiesa, alla quale Cristo Signore affidò il deposito della fede affinché essa stessa, con l'assistenza dello Spirito Santo, custodisse santamente, scrutasse più intimamente, annunziasse ed esponesse fedelmente la verità rivelata, ha il dovere e il diritto nativo, anche con l'uso di propri strumenti di comunicazione sociale, indipendente da qualsiasi umana potestà, di predicare il Vangelo a tutte le genti.\n\n§2. È compito della Chiesa annunciare sempre e dovunque i princìpi morali anche circa l'ordine sociale, e così pure pronunciare il giudizio su qualsiasi realtà umana, in quanto lo esigono i diritti fondamentali della persona umana o la salvezza delle anime.`,
  748: `§1. Tutti gli uomini sono tenuti a ricercare la verità nelle cose, che riguardano Dio e la sua Chiesa, e, conosciutala, sono vincolati in forza della legge divina e godono del diritto di abbracciarla e di osservarla.\n\n§2. Non è mai lecito ad alcuno indurre gli uomini con la costrizione ad abbracciare la fede cattolica contro la loro coscienza.`,
  749: `§1. Il Sommo Pontefice, in forza del suo ufficio, gode dell'infallibilità nel magistero quando, come Pastore e Dottore supremo di tutti i fedeli, che ha il compito di confermare i suoi fratelli nella fede, con atto definitivo proclama da tenersi una dottrina sulla fede o sui costumi.\n\n§2. Anche il Collegio dei Vescovi gode dell'infallibilità nel magistero quando i Vescovi radunati nel Concilio Ecumenico esercitano il magistero, come dottori e giudici della fede e dei costumi, nel dichiarare per tutta la Chiesa da tenersi definitivamente una dottrina sulla fede o sui costumi; oppure quando dispersi per il mondo, conservando il legame di comunione fra di loro e con il successore di Pietro, convergono in un'unica sentenza da tenersi come definitiva nell'insegnare autenticamente insieme con il medesimo Romano Pontefice una verità che riguarda la fede o i costumi.\n\n§3. Nessuna dottrina si intende infallibilmente definita, se ciò non consta manifestamente.`,
  751: `Vien detta eresia, l'ostinata negazione, dopo aver ricevuto il battesimo, di una qualche verità che si deve credere per fede divina e cattolica, o il dubbio ostinato su di essa; apostasia, il ripudio totale della fede cristiana; scisma, il rifiuto della sottomissione al Sommo Pontefice o della comunione con i membri della Chiesa a lui soggetti.`,
  752: `Non proprio un assenso di fede, ma un religioso ossequio dell'intelletto e della volontà deve essere prestato alla dottrina, che sia il Sommo Pontefice sia il Collegio dei Vescovi enunciano circa la fede e i costumi, esercitando il magistero autentico, anche se non intendono proclamarla con atto definitivo; i fedeli perciò procurino di evitare quello che con essa non concorda.`,
  753: `I Vescovi, che sono in comunione con il capo del Collegio e con i membri, sia singolarmente sia riuniti nelle Conferenze Episcopali o nei concili particolari, anche se non godono dell'infallibilità nell'insegnamento, sono autentici dottori e maestri della fede per i fedeli affidati alla loro cura; a tale magistero autentico dei propri Vescovi i fedeli sono tenuti ad aderire con religioso ossequio dell'animo.`,
  754: `Tutti i fedeli sono tenuti all'obbligo di osservare le costituzioni e i decreti, che la legittima autorità della Chiesa propone per esporre una dottrina e per proscrivere opinioni erronee; per ragione speciale, quando poi le emanano il Romano Pontefice o il Collegio dei Vescovi.`,
  755: `§1. Spetta in primo luogo a tutto il Collegio dei Vescovi e alla Sede Apostolica sostenere e dirigere presso i cattolici il movimento ecumenico, il cui fine è il ristabilimento dell'unità tra tutti i cristiani, che la Chiesa è tenuta a promuovere per volontà di Cristo.\n\n§2. Spetta parimenti ai Vescovi, e, a norma del diritto, alle Conferenze Episcopali, promuovere la medesima unità e secondo che le diverse circostanze lo esigano o lo consiglino, impartire norme pratiche, tenute presenti le disposizioni emanate dalla suprema autorità della Chiesa.`,
}

const t750Original = `Per fede divina e cattolica sono da credere tutte quelle cose che sono contenute nella parola di Dio scritta o tramandata, vale a dire nell'unico deposito della fede affidato alla Chiesa, e che insieme sono proposte come divinamente rivelate, sia dal magistero solenne della Chiesa, sia dal suo magistero ordinario e universale, ossia quello che è manifestato dalla comune adesione dei fedeli sotto la guida del sacro magistero; di conseguenza tutti sono tenuti a evitare qualsiasi dottrina ad esse contraria.`

const t750Current = `§1. Per fede divina e cattolica sono da credere tutte quelle cose che sono contenute nella parola di Dio scritta o tramandata, vale a dire nell'unico deposito della fede affidato alla Chiesa, e che insieme sono proposte come divinamente rivelate, sia dal magistero solenne della Chiesa, sia dal suo magistero ordinario e universale, ossia quello che è manifestato dalla comune adesione dei fedeli sotto la guida del sacro magistero; di conseguenza tutti sono tenuti a evitare qualsiasi dottrina ad esse contraria.\n\n§2. Si devono pure fermamente accogliere e ritenere anche tutte e singole le cose che vengono proposte definitivamente dal magistero della Chiesa circa la dottrina della fede e dei costumi, quelle cioè che sono richieste per custodire santamente ed esporre fedelmente lo stesso deposito della fede; si oppone dunque alla dottrina della Chiesa cattolica chi rifiuta le medesime proposizioni da tenersi definitivamente.`

const amended750: CanonInput = {
  number: 750,
  editorialTitle: 'Verità da credere e da ritenere definitivamente',
  keywords: ['fede divina e cattolica', 'magistero', 'dottrina definitiva'],
  structuralUnitCanonicalId: UNIT,
  status: 'amended',
  versions: [
    {
      versionId: 'cic-1983-can-750-it-1983',
      versionLabel: 'Versione originaria 1983',
      status: 'superseded',
      validFrom: '1983-11-27',
      language: 'it',
      text: t750Original,
      sourceDocumentTitle: 'Codice di Diritto Canonico',
      sourceCitation: 'CIC 1983, can. 750 — redazione originaria',
      sourceUrl: SOURCE_URL,
      segments: segments(750, t750Original),
    },
    {
      versionId: 'cic-1983-can-750-it-1998',
      versionLabel: 'Versione vigente dopo Ad tuendam fidem',
      status: 'current',
      language: 'it',
      text: t750Current,
      sourceDocumentTitle: 'Codice di Diritto Canonico',
      sourceCitation: 'CIC 1983, can. 750',
      sourceUrl: SOURCE_URL,
      changeSummary: 'Il canone è stato articolato in due paragrafi dal Motu Proprio Ad tuendam fidem (18 maggio 1998).',
      segments: segments(750, t750Current),
    },
  ],
}

const metadata: Record<number, [string, string[]]> = {
  747: ['Diritto-dovere della Chiesa di annunciare il Vangelo', ['deposito della fede', 'Vangelo', 'principi morali']],
  748: ['Ricerca della verità e libertà religiosa', ['verità', 'libertà religiosa', 'coscienza']],
  749: ['Infallibilità del magistero', ['Sommo Pontefice', 'Collegio dei Vescovi', 'infallibilità']],
  751: ['Eresia, apostasia e scisma', ['eresia', 'apostasia', 'scisma']],
  752: ['Ossequio al magistero autentico', ['magistero autentico', 'ossequio religioso']],
  753: ['Magistero autentico dei Vescovi', ['Vescovi', 'magistero autentico']],
  754: ['Obbligo di osservare costituzioni e decreti dottrinali', ['costituzioni', 'decreti', 'dottrina']],
  755: ['Promozione dell’ecumenismo', ['ecumenismo', 'unità dei cristiani', 'Conferenze Episcopali']],
}

export const canons747to755: CanonInput[] = [
  ...Object.keys(texts)
    .map(Number)
    .sort((a, b) => a - b)
    .map((number) => {
      const [title, keywords] = metadata[number]
      return makeCanon(UNIT, SOURCE_URL, number, title, keywords, texts[number])
    }),
  amended750,
].sort((a, b) => a.number - b.number)
