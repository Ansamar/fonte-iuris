export type StructuralUnitInput = {
  canonicalId: string
  unitType: 'book' | 'part' | 'section' | 'title' | 'chapter' | 'article'
  number?: string
  title: string
  canonicalLabel?: string
  parentCanonicalId: string
  order: number
}

export const structuralUnits: StructuralUnitInput[] = [
  {
    canonicalId: 'cic-1983-book-2-part-2-section-2-title-1-chapter-2',
    unitType: 'chapter',
    number: 'II',
    title: 'I Vescovi',
    canonicalLabel: 'CAPITOLO II — I VESCOVI',
    parentCanonicalId: 'cic-1983-book-2-part-2-section-2-title-1',
    order: 2,
  },
  {
    canonicalId: 'cic-1983-book-2-part-2-section-2-title-1-chapter-2-article-1',
    unitType: 'article',
    number: '1',
    title: 'I Vescovi in genere',
    canonicalLabel: 'Articolo 1 — I Vescovi in genere',
    parentCanonicalId: 'cic-1983-book-2-part-2-section-2-title-1-chapter-2',
    order: 1,
  },
  {
    canonicalId: 'cic-1983-book-2-part-2-section-2-title-1-chapter-2-article-2',
    unitType: 'article',
    number: '2',
    title: 'I Vescovi diocesani',
    canonicalLabel: 'Articolo 2 — I Vescovi diocesani',
    parentCanonicalId: 'cic-1983-book-2-part-2-section-2-title-1-chapter-2',
    order: 2,
  },
  {
    canonicalId: 'cic-1983-book-2-part-2-section-2-title-1-chapter-2-article-3',
    unitType: 'article',
    number: '3',
    title: 'I Vescovi coadiutori e ausiliari',
    canonicalLabel: 'Articolo 3 — I Vescovi coadiutori e ausiliari',
    parentCanonicalId: 'cic-1983-book-2-part-2-section-2-title-1-chapter-2',
    order: 3,
  },
  {
    canonicalId: 'cic-1983-book-2-part-2-section-2-title-1-chapter-3',
    unitType: 'chapter',
    number: 'III',
    title: 'Sede impedita e sede vacante',
    canonicalLabel: 'CAPITOLO III — SEDE IMPEDITA E SEDE VACANTE',
    parentCanonicalId: 'cic-1983-book-2-part-2-section-2-title-1',
    order: 3,
  },
  {
    canonicalId: 'cic-1983-book-2-part-2-section-2-title-1-chapter-3-article-1',
    unitType: 'article',
    number: '1',
    title: 'La sede impedita',
    canonicalLabel: 'Articolo 1 — La sede impedita',
    parentCanonicalId: 'cic-1983-book-2-part-2-section-2-title-1-chapter-3',
    order: 1,
  },
  {
    canonicalId: 'cic-1983-book-2-part-2-section-2-title-1-chapter-3-article-2',
    unitType: 'article',
    number: '2',
    title: 'La sede vacante',
    canonicalLabel: 'Articolo 2 — La sede vacante',
    parentCanonicalId: 'cic-1983-book-2-part-2-section-2-title-1-chapter-3',
    order: 2,
  },
  {
    canonicalId: 'cic-1983-book-2-part-2-section-2-title-2',
    unitType: 'title',
    number: 'II',
    title: 'I raggruppamenti di Chiese particolari',
    canonicalLabel: 'TITOLO II — I RAGGRUPPAMENTI DI CHIESE PARTICOLARI',
    parentCanonicalId: 'cic-1983-book-2-part-2-section-2',
    order: 2,
  },
  {
    canonicalId: 'cic-1983-book-2-part-2-section-2-title-2-chapter-1',
    unitType: 'chapter',
    number: 'I',
    title: 'Province ecclesiastiche e regioni ecclesiastiche',
    canonicalLabel: 'CAPITOLO I — PROVINCE ECCLESIASTICHE E REGIONI ECCLESIASTICHE',
    parentCanonicalId: 'cic-1983-book-2-part-2-section-2-title-2',
    order: 1,
  },
  {
    canonicalId: 'cic-1983-book-2-part-2-section-2-title-2-chapter-2',
    unitType: 'chapter',
    number: 'II',
    title: 'I Metropoliti',
    canonicalLabel: 'CAPITOLO II — I METROPOLITI',
    parentCanonicalId: 'cic-1983-book-2-part-2-section-2-title-2',
    order: 2,
  },
  {
    canonicalId: 'cic-1983-book-2-part-2-section-2-title-2-chapter-3',
    unitType: 'chapter',
    number: 'III',
    title: 'I Concili particolari',
    canonicalLabel: 'CAPITOLO III — I CONCILI PARTICOLARI',
    parentCanonicalId: 'cic-1983-book-2-part-2-section-2-title-2',
    order: 3,
  },
  {
    canonicalId: 'cic-1983-book-2-part-2-section-2-title-2-chapter-4',
    unitType: 'chapter',
    number: 'IV',
    title: 'Le Conferenze Episcopali',
    canonicalLabel: 'CAPITOLO IV — LE CONFERENZE EPISCOPALI',
    parentCanonicalId: 'cic-1983-book-2-part-2-section-2-title-2',
    order: 4,
  },
]
