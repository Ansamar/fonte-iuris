export type CanonicalSegmentType = 'paragraph' | 'number' | 'letter' | 'clause'

export type CanonicalSegment = {
  id: string
  type: CanonicalSegmentType
  label: string
  order: number
  parentId?: string
  startOffset: number
  endOffset: number
}

export type CanonicalCanon = {
  number: number
  text: string
  segments: CanonicalSegment[]
}

export type CanonicalBook = {
  schemaVersion: 1
  corpus: 'cic-1983'
  book: 7
  language: 'it'
  range: {from: 1400; to: 1752}
  expectedCanons: 353
  source: {
    authority: 'Santa Sede'
    indexUrl: string
    acquiredAt: string
    sha256: string
  }
  canons: CanonicalCanon[]
}
