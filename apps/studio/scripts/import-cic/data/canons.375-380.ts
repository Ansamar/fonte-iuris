import type {CanonInput, CanonSegmentInput, SegmentType} from '../types'

const VATICAN_375_380_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_375-380_it.html'

const UNIT =
  'cic-1983-book-2-part-2-section-2-title-1-chapter-2-article-1'

function segment(
  text: string,
  segmentId: string,
  segmentType: SegmentType,
  label: string,
  order: number,
  startMarker: string,
  endMarker?: string,
  parentSegmentId?: string,
): CanonSegmentInput {
  const startOffset = text.indexOf(startMarker)

  if (startOffset < 0) {
    throw new Error(`${segmentId}: startMarker non trovato: ${startMarker}`)
  }

  let endOffset = endMarker
    ? text.indexOf(endMarker, startOffset + startMarker.length)
    : text.length

  if (endMarker && endOffset < 0) {
    throw new Error(`${segmentId}: endMarker non trovato: ${endMarker}`)
  }

  while (endOffset > startOffset && /\s/.test(text[endOffset - 1])) {
    endOffset -= 1
  }

  return {
    segmentId,
    segmentType,
    label,
    order,
    parentSegmentId,
    startOffset,
    endOffset,
    isFormalDivision: true,
  }
}

const text375 =
  '§1. I Vescovi, che per divina istituzione sono successori degli Apostoli, mediante lo Spirito Santo che è stato loro donato, sono costituiti Pastori nella Chiesa, perché siano anch\'essi maestri di dottrina, sacerdoti del sacro culto e ministri del governo.\n\n§2. Con la stessa consacrazione episcopale i Vescovi ricevono, con l\'ufficio di santificare, anche gli uffici di insegnare e governare, i quali tuttavia, per loro natura, non possono essere esercitati se non nella comunione gerarchica col Capo e con le membra del Collegio.'

const text376 =
  'Si chiamano diocesani i Vescovi ai quali è stata affidata la cura di una diocesi; gli altri si chiamano titolari.'

const text377 =
  '§1. Il Sommo Pontefice nomina liberamente i Vescovi, oppure conferma quelli che sono stati legittimamente eletti.\n\n§2. Almeno ogni triennio i Vescovi di una provincia ecclesiastica, oppure, dove le circostanze lo suggeriscono, le Conferenze Episcopali, mediante una consultazione comune e segreta, compilino un elenco di presbiteri, anche membri di istituti di vita consacrata, che risultino particolarmente idonei all\'episcopato, e lo trasmettano alla Sede Apostolica, fermo restando il diritto di ciascun Vescovo di presentare separatamente alla Sede Apostolica i nomi dei presbiteri che giudica degni e idonei alla funzione episcopale.\n\n§3. A meno che non sia stato stabilito legittimamente in modo diverso, ogni volta che deve essere nominato un Vescovo diocesano o un Vescovo coadiutore, per proporre la cosiddetta terna alla Sede Apostolica, spetta al Legato pontificio ricercare singolarmente e comunicare alla stessa Sede Apostolica, insieme con il suo voto, ciò che suggeriscono il Metropolita e i Suffraganei della provincia, alla quale appartiene la diocesi a cui occorre provvedere o con la quale è aggregata, e altresì il presidente della Conferenza Episcopale; il Legato pontificio inoltre ascolti alcuni del collegio dei consultori e del capitolo cattedrale e, se lo riterrà opportuno, richieda anche singolarmente e in segreto il parere di altri, del clero diocesano e religioso, come pure di laici distinti per saggezza.\n\n§4. Se non è stato legittimamente disposto in modo diverso, il Vescovo diocesano che ritenga si debba dare un ausiliare alla sua diocesi, proponga alla Sede Apostolica un elenco di almeno tre presbiteri idonei a tale ufficio.\n\n§5. Per il futuro non verrà concesso alle autorità civili alcun diritto e privilegio di elezione, nomina, presentazione o designazione dei Vescovi.'

const text378 =
  '§1. Per l\'idoneità di un candidato all\'episcopato, si richiede che:\n1) sia eminente per fede salda, buoni costumi, pietà, zelo per le anime, saggezza, prudenza e virtù umane, e inoltre dotato di tutte le altre qualità che lo rendono adatto a compiere l\'ufficio in questione;\n2) goda di buona reputazione;\n3) abbia almeno trentacinque anni di età;\n4) sia presbitero almeno da cinque anni;\n5) abbia conseguito la laurea dottorale o almeno la licenza in sacra Scrittura, teologia o diritto canonico in un istituto di studi superiori approvato dalla Sede Apostolica, oppure sia almeno veramente esperto in tali discipline.\n\n§2. Il giudizio definitivo sull\'idoneità del candidato spetta alla Sede Apostolica.'

const text379 =
  'Se non è legittimamente impedito, chi è promosso all\'Episcopato deve ricevere la consacrazione episcopale, entro tre mesi dalla ricezione della lettera apostolica, e comunque prima che prenda possesso del suo ufficio.'

const text380 =
  'Prima di prendere possesso canonico del suo ufficio, colui che è stato promosso emetta la professione di fede e presti giuramento di fedeltà alla Sede Apostolica, secondo la formula approvata dalla stessa Sede Apostolica.'

export const canons375to380: CanonInput[] = [
  {
    number: 375,
    editorialTitle: 'Missione e uffici dei Vescovi',
    keywords: ['Vescovi', 'successione apostolica', 'consacrazione episcopale'],
    structuralUnitCanonicalId: UNIT,
    status: 'inForce',
    versions: [
      {
        versionId: 'cic-1983-can-375-it-1983',
        versionLabel: 'Versione originaria 1983',
        status: 'current',
        validFrom: '1983-11-27',
        language: 'it',
        text: text375,
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: 'CIC 1983, can. 375',
        sourceUrl: VATICAN_375_380_URL,
        segments: [
          segment(text375, 'can-375-par-1', 'paragraph', '§ 1', 1, '§1.', '§2.'),
          segment(text375, 'can-375-par-2', 'paragraph', '§ 2', 2, '§2.'),
        ],
      },
    ],
  },
  {
    number: 376,
    editorialTitle: 'Vescovi diocesani e titolari',
    keywords: ['Vescovo diocesano', 'Vescovo titolare'],
    structuralUnitCanonicalId: UNIT,
    status: 'inForce',
    versions: [
      {
        versionId: 'cic-1983-can-376-it-1983',
        versionLabel: 'Versione originaria 1983',
        status: 'current',
        validFrom: '1983-11-27',
        language: 'it',
        text: text376,
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: 'CIC 1983, can. 376',
        sourceUrl: VATICAN_375_380_URL,
        segments: [],
      },
    ],
  },
  {
    number: 377,
    editorialTitle: 'Nomina dei Vescovi',
    keywords: ['nomina dei Vescovi', 'Sommo Pontefice', 'Legato pontificio'],
    structuralUnitCanonicalId: UNIT,
    status: 'inForce',
    versions: [
      {
        versionId: 'cic-1983-can-377-it-1983',
        versionLabel: 'Versione originaria 1983',
        status: 'current',
        validFrom: '1983-11-27',
        language: 'it',
        text: text377,
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: 'CIC 1983, can. 377',
        sourceUrl: VATICAN_375_380_URL,
        segments: [
          segment(text377, 'can-377-par-1', 'paragraph', '§ 1', 1, '§1.', '§2.'),
          segment(text377, 'can-377-par-2', 'paragraph', '§ 2', 2, '§2.', '§3.'),
          segment(text377, 'can-377-par-3', 'paragraph', '§ 3', 3, '§3.', '§4.'),
          segment(text377, 'can-377-par-4', 'paragraph', '§ 4', 4, '§4.', '§5.'),
          segment(text377, 'can-377-par-5', 'paragraph', '§ 5', 5, '§5.'),
        ],
      },
    ],
  },
  {
    number: 378,
    editorialTitle: 'Requisiti per l’episcopato',
    keywords: ['idoneità episcopale', 'requisiti', 'Sede Apostolica'],
    structuralUnitCanonicalId: UNIT,
    status: 'inForce',
    versions: [
      {
        versionId: 'cic-1983-can-378-it-1983',
        versionLabel: 'Versione originaria 1983',
        status: 'current',
        validFrom: '1983-11-27',
        language: 'it',
        text: text378,
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: 'CIC 1983, can. 378',
        sourceUrl: VATICAN_375_380_URL,
        segments: [
          segment(text378, 'can-378-par-1', 'paragraph', '§ 1', 1, '§1.', '§2.'),
          segment(text378, 'can-378-num-1', 'number', '1)', 1, '1)', '2)', 'can-378-par-1'),
          segment(text378, 'can-378-num-2', 'number', '2)', 2, '2)', '3)', 'can-378-par-1'),
          segment(text378, 'can-378-num-3', 'number', '3)', 3, '3)', '4)', 'can-378-par-1'),
          segment(text378, 'can-378-num-4', 'number', '4)', 4, '4)', '5)', 'can-378-par-1'),
          segment(text378, 'can-378-num-5', 'number', '5)', 5, '5)', '§2.', 'can-378-par-1'),
          segment(text378, 'can-378-par-2', 'paragraph', '§ 2', 2, '§2.'),
        ],
      },
    ],
  },
  {
    number: 379,
    editorialTitle: 'Consacrazione episcopale',
    keywords: ['consacrazione episcopale', 'lettera apostolica'],
    structuralUnitCanonicalId: UNIT,
    status: 'inForce',
    versions: [
      {
        versionId: 'cic-1983-can-379-it-1983',
        versionLabel: 'Versione originaria 1983',
        status: 'current',
        validFrom: '1983-11-27',
        language: 'it',
        text: text379,
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: 'CIC 1983, can. 379',
        sourceUrl: VATICAN_375_380_URL,
        segments: [],
      },
    ],
  },
  {
    number: 380,
    editorialTitle: 'Professione di fede e giuramento di fedeltà',
    keywords: ['professione di fede', 'giuramento di fedeltà', 'Sede Apostolica'],
    structuralUnitCanonicalId: UNIT,
    status: 'inForce',
    versions: [
      {
        versionId: 'cic-1983-can-380-it-1983',
        versionLabel: 'Versione originaria 1983',
        status: 'current',
        validFrom: '1983-11-27',
        language: 'it',
        text: text380,
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: 'CIC 1983, can. 380',
        sourceUrl: VATICAN_375_380_URL,
        segments: [],
      },
    ],
  },
]
