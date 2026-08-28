import type {CanonInput} from '../types'

const VATICAN_368_374_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_368-374_it.html'

export const sampleCanons: CanonInput[] = [
  {
    number: 368,
    editorialTitle: 'Le Chiese particolari',
    keywords: ['Chiesa particolare', 'diocesi', 'vescovo diocesano', 'popolo di Dio'],
    structuralUnitCanonicalId:
      'cic-1983-book-2-part-2-section-2-title-1-chapter-1',
    status: 'inForce',
    versions: [
      {
        versionId: 'cic-1983-can-368-it-1983',
        versionLabel: 'Versione originaria 1983',
        status: 'current',
        validFrom: '1983-11-27',
        language: 'it',
        text:
          "Le Chiese particolari, nelle quali e dalle quali sussiste la sola e unica Chiesa cattolica, sono innanzitutto le diocesi, alle quali, se non consta altro, vengono assimilate la prelatura territoriale e l'abbazia territoriale, il vicariato apostolico e la prefettura apostolica e altresì l'amministrazione apostolica eretta stabilmente.",
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: 'CIC 1983, can. 368',
        sourceUrl: VATICAN_368_374_URL,
        segments: [],
      },
    ],
  },
  {
    number: 369,
    editorialTitle: 'La diocesi',
    keywords: [
      'diocesi',
      'vescovo diocesano',
      'popolo di Dio',
      'Chiesa particolare',
      'presbiterio',
    ],
    structuralUnitCanonicalId:
      'cic-1983-book-2-part-2-section-2-title-1-chapter-1',
    status: 'inForce',
    versions: [
      {
        versionId: 'cic-1983-can-369-it-1983',
        versionLabel: 'Versione originaria 1983',
        status: 'current',
        validFrom: '1983-11-27',
        language: 'it',
        text:
          "La diocesi è la porzione del popolo di Dio che viene affidata alla cura pastorale del Vescovo con la cooperazione del presbiterio, in modo che, aderendo al suo pastore e da lui riunita nello Spirito Santo mediante il Vangelo e l'Eucaristia, costituisca una Chiesa particolare in cui è veramente presente e operante la Chiesa di Cristo una, santa, cattolica e apostolica.",
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: 'CIC 1983, can. 369',
        sourceUrl: VATICAN_368_374_URL,
        segments: [],
      },
    ],
  },
]
