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
    canonicalId:
      'cic-1983-book-2-part-2-section-2-title-1-chapter-2-article-1',
    unitType: 'article',
    number: '1',
    title: 'I Vescovi in genere',
    canonicalLabel: 'Articolo 1 — I Vescovi in genere',
    parentCanonicalId:
      'cic-1983-book-2-part-2-section-2-title-1-chapter-2',
    order: 1,
  },
  {
    canonicalId:
      'cic-1983-book-2-part-2-section-2-title-1-chapter-2-article-2',
    unitType: 'article',
    number: '2',
    title: 'I Vescovi diocesani',
    canonicalLabel: 'Articolo 2 — I Vescovi diocesani',
    parentCanonicalId:
      'cic-1983-book-2-part-2-section-2-title-1-chapter-2',
    order: 2,
  },
]
