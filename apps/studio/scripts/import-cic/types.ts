export type SegmentType =
  | 'paragraph'
  | 'number'
  | 'letter'
  | 'clause'

export type CanonSegmentInput = {
  segmentId: string
  segmentType: SegmentType
  label: string
  order: number
  parentSegmentId?: string
  startOffset?: number
  endOffset?: number
  isFormalDivision: boolean
}

export type CanonVersionInput = {
  versionId: string
  versionLabel: string
  status: 'current' | 'superseded' | 'historical'
  validFrom?: string
  validUntil?: string
  language: 'it' | 'la'
  text: string
  sourceDocumentTitle?: string
  sourceCitation?: string
  sourceUrl?: string
  changeSummary?: string
  segments: CanonSegmentInput[]
}

export type CanonInput = {
  number: number
  editorialTitle?: string
  keywords?: string[]
  structuralUnitCanonicalId: string
  status?: 'inForce' | 'amended' | 'repealed' | 'historical'
  versions: CanonVersionInput[]
}