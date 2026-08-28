export type PortableTextSpan = {
  _type: 'span'
  _key: string
  text: string
  marks: string[]
}

export type PortableTextBlock = {
  _type: 'block'
  _key: string
  style: 'normal'
  markDefs: unknown[]
  children: PortableTextSpan[]
}

export function normalizeCanonicalText(input: string): string {
  return input
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function canonicalTextToPortableText(input: string): PortableTextBlock[] {
  const normalized = normalizeCanonicalText(input)

  if (!normalized) return []

  return normalized.split(/\n{2,}/).map((paragraph, index) => ({
    _type: 'block',
    _key: `block-${index + 1}`,
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: `span-${index + 1}`,
        text: paragraph,
        marks: [],
      },
    ],
  }))
}
