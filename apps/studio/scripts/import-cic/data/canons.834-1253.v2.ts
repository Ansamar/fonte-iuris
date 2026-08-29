import {execFileSync} from 'node:child_process'
import {existsSync, readFileSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

import type {CanonInput} from '../types'
import {segments} from './canonSource'

const INDEX_URLS = [
  'https://press.vatican.va/archive/cod-iuris-canonici/cic_index_it.html',
  'https://www.vatican.va/archive/cod-iuris-canonici/cic_index_it.html',
]
const CACHE_FILE = join(tmpdir(), 'fonte-iuris-cic-book4-v7.json')
const FIRST_CANON = 834
const LAST_CANON = 1253
const EXPECTED_CANONS = LAST_CANON - FIRST_CANON + 1

const amendedCanons = new Set([
  838,
  868,
  1008,
  1009,
  1086,
  1108,
  1109,
  1111,
  1112,
  1116,
  1117,
  1124,
  1127,
])

type CachedCanon = {
  number: number
  text: string
  sourceUrl: string
}

type CachePayload = {
  generatedAt: string
  canons: CachedCanon[]
}

type UnitRange = {
  from: number
  to: number
  unit: string
}

const ranges: UnitRange[] = [
  {from:834,to:839,unit:'cic-1983-book-4'},
  {from:840,to:848,unit:'cic-1983-book-4-part-1'},
  {from:849,to:849,unit:'cic-1983-book-4-part-1-title-1'},
  {from:850,to:860,unit:'cic-1983-book-4-part-1-title-1-chapter-1'},
  {from:861,to:863,unit:'cic-1983-book-4-part-1-title-1-chapter-2'},
  {from:864,to:871,unit:'cic-1983-book-4-part-1-title-1-chapter-3'},
  {from:872,to:874,unit:'cic-1983-book-4-part-1-title-1-chapter-4'},
  {from:875,to:878,unit:'cic-1983-book-4-part-1-title-1-chapter-5'},
  {from:879,to:879,unit:'cic-1983-book-4-part-1-title-2'},
  {from:880,to:881,unit:'cic-1983-book-4-part-1-title-2-chapter-1'},
  {from:882,to:888,unit:'cic-1983-book-4-part-1-title-2-chapter-2'},
  {from:889,to:891,unit:'cic-1983-book-4-part-1-title-2-chapter-3'},
  {from:892,to:893,unit:'cic-1983-book-4-part-1-title-2-chapter-4'},
  {from:894,to:896,unit:'cic-1983-book-4-part-1-title-2-chapter-5'},
  {from:897,to:898,unit:'cic-1983-book-4-part-1-title-3'},
  {from:899,to:899,unit:'cic-1983-book-4-part-1-title-3-chapter-1'},
  {from:900,to:911,unit:'cic-1983-book-4-part-1-title-3-chapter-1-article-1'},
  {from:912,to:923,unit:'cic-1983-book-4-part-1-title-3-chapter-1-article-2'},
  {from:924,to:930,unit:'cic-1983-book-4-part-1-title-3-chapter-1-article-3'},
  {from:931,to:933,unit:'cic-1983-book-4-part-1-title-3-chapter-1-article-4'},
  {from:934,to:944,unit:'cic-1983-book-4-part-1-title-3-chapter-2'},
  {from:945,to:958,unit:'cic-1983-book-4-part-1-title-3-chapter-3'},
  {from:959,to:959,unit:'cic-1983-book-4-part-1-title-4'},
  {from:960,to:964,unit:'cic-1983-book-4-part-1-title-4-chapter-1'},
  {from:965,to:986,unit:'cic-1983-book-4-part-1-title-4-chapter-2'},
  {from:987,to:991,unit:'cic-1983-book-4-part-1-title-4-chapter-3'},
  {from:992,to:997,unit:'cic-1983-book-4-part-1-title-4-chapter-4'},
  {from:998,to:998,unit:'cic-1983-book-4-part-1-title-5'},
  {from:999,to:1002,unit:'cic-1983-book-4-part-1-title-5-chapter-1'},
  {from:1003,to:1003,unit:'cic-1983-book-4-part-1-title-5-chapter-2'},
  {from:1004,to:1007,unit:'cic-1983-book-4-part-1-title-5-chapter-3'},
  {from:1008,to:1009,unit:'cic-1983-book-4-part-1-title-6'},
  {from:1010,to:1023,unit:'cic-1983-book-4-part-1-title-6-chapter-1'},
  {from:1024,to:1025,unit:'cic-1983-book-4-part-1-title-6-chapter-2'},
  {from:1026,to:1032,unit:'cic-1983-book-4-part-1-title-6-chapter-2-article-1'},
  {from:1033,to:1039,unit:'cic-1983-book-4-part-1-title-6-chapter-2-article-2'},
  {from:1040,to:1049,unit:'cic-1983-book-4-part-1-title-6-chapter-2-article-3'},
  {from:1050,to:1052,unit:'cic-1983-book-4-part-1-title-6-chapter-2-article-4'},
  {from:1053,to:1054,unit:'cic-1983-book-4-part-1-title-6-chapter-3'},
  {from:1055,to:1062,unit:'cic-1983-book-4-part-1-title-7'},
  {from:1063,to:1072,unit:'cic-1983-book-4-part-1-title-7-chapter-1'},
  {from:1073,to:1082,unit:'cic-1983-book-4-part-1-title-7-chapter-2'},
  {from:1083,to:1094,unit:'cic-1983-book-4-part-1-title-7-chapter-3'},
  {from:1095,to:1107,unit:'cic-1983-book-4-part-1-title-7-chapter-4'},
  {from:1108,to:1123,unit:'cic-1983-book-4-part-1-title-7-chapter-5'},
  {from:1124,to:1129,unit:'cic-1983-book-4-part-1-title-7-chapter-6'},
  {from:1130,to:1133,unit:'cic-1983-book-4-part-1-title-7-chapter-7'},
  {from:1134,to:1140,unit:'cic-1983-book-4-part-1-title-7-chapter-8'},
  {from:1141,to:1150,unit:'cic-1983-book-4-part-1-title-7-chapter-9-article-1'},
  {from:1151,to:1155,unit:'cic-1983-book-4-part-1-title-7-chapter-9-article-2'},
  {from:1156,to:1160,unit:'cic-1983-book-4-part-1-title-7-chapter-10-article-1'},
  {from:1161,to:1165,unit:'cic-1983-book-4-part-1-title-7-chapter-10-article-2'},
  {from:1166,to:1172,unit:'cic-1983-book-4-part-2-title-1'},
  {from:1173,to:1175,unit:'cic-1983-book-4-part-2-title-2'},
  {from:1176,to:1176,unit:'cic-1983-book-4-part-2-title-3'},
  {from:1177,to:1182,unit:'cic-1983-book-4-part-2-title-3-chapter-1'},
  {from:1183,to:1185,unit:'cic-1983-book-4-part-2-title-3-chapter-2'},
  {from:1186,to:1190,unit:'cic-1983-book-4-part-2-title-4'},
  {from:1191,to:1198,unit:'cic-1983-book-4-part-2-title-5-chapter-1'},
  {from:1199,to:1204,unit:'cic-1983-book-4-part-2-title-5-chapter-2'},
  {from:1205,to:1213,unit:'cic-1983-book-4-part-3-title-1'},
  {from:1214,to:1222,unit:'cic-1983-book-4-part-3-title-1-chapter-1'},
  {from:1223,to:1229,unit:'cic-1983-book-4-part-3-title-1-chapter-2'},
  {from:1230,to:1234,unit:'cic-1983-book-4-part-3-title-1-chapter-3'},
  {from:1235,to:1239,unit:'cic-1983-book-4-part-3-title-1-chapter-4'},
  {from:1240,to:1243,unit:'cic-1983-book-4-part-3-title-1-chapter-5'},
  {from:1244,to:1245,unit:'cic-1983-book-4-part-3-title-2'},
  {from:1246,to:1248,unit:'cic-1983-book-4-part-3-title-2-chapter-1'},
  {from:1249,to:1253,unit:'cic-1983-book-4-part-3-title-2-chapter-2'},
]

function unitForCanon(number: number) {
  const match = ranges.find((range) => number >= range.from && number <= range.to)
  if (!match) throw new Error(`Libro IV: nessuna unità strutturale per Can. ${number}`)
  return match.unit
}

function curl(url: string) {
  return execFileSync(
    'curl',
    ['-fsSL', '--retry', '2', '--connect-timeout', '10', '--max-time', '45', url],
    {
      encoding: 'utf8',
      maxBuffer: 30 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    },
  )
}

function tryCurl(url: string) {
  try {
    return curl(url)
  } catch {
    return null
  }
}

function decodeEntities(value: string) {
  const named: Record<string, string> = {
    nbsp: ' ',
    amp: '&',
    quot: '"',
    apos: "'",
    lt: '<',
    gt: '>',
    agrave: 'à',
    egrave: 'è',
    eacute: 'é',
    igrave: 'ì',
    ograve: 'ò',
    ugrave: 'ù',
    Agrave: 'À',
    Egrave: 'È',
    Eacute: 'É',
    Igrave: 'Ì',
    Ograve: 'Ò',
    Ugrave: 'Ù',
    rsquo: '’',
    lsquo: '‘',
    ldquo: '“',
    rdquo: '”',
    ndash: '–',
    mdash: '—',
    deg: '°',
  }

  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-zA-Z]+);/g, (full, name) => named[name] ?? full)
}

function htmlToText(html: string) {
  return decodeEntities(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\r/g, '')
    .replace(/[\t\f\v ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function cutFooter(text: string) {
  let result = text
  for (const marker of [
    'Indica che il testo corrisponde',
    'Articoli modificati da',
    'Redazione originaria degli articoli modificati',
    'Per la nuova redazione',
    'Copyright ©',
  ]) {
    const index = result.indexOf(marker)
    if (index >= 0) result = result.slice(0, index)
  }
  return result.trim()
}

function normalizeCanonBody(value: string) {
  let text = value.trim()

  // Il sito Vaticano rende i <sup> come testo semplice dopo la conversione HTML:
  // "Can. 838 n - ..." oppure "Can. 1127 §1 n - ...".
  text = text.replace(
    /^\s*§\s*(\d+)\s*(?:\^?\{?n\}?\s*)?[-–—]\s*/i,
    (_, paragraph) => `§${paragraph}. `,
  )
  text = text.replace(/^\s*(?:\^?\{?n\}?\s*)?[-–—]\s*/i, '')

  return text
    .replace(/§\s+(\d+)\s*\./g, '§$1.')
    .replace(/§(\d+)\s*\./g, '§$1.')
    .replace(/\s+(?=§\d+\.)/g, '\n\n')
    .replace(/\s+(?=\d+\)\s)/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function extractCanonsFromPage(url: string, html: string): CachedCanon[] {
  const text = cutFooter(htmlToText(html))

  // Deliberatamente non tentiamo di interpretare il markup posto tra numero e testo.
  // Il numero del canone è l'unico marker stabile nelle pagine storiche del Vaticano.
  const markers = [...text.matchAll(/\bCan\.\s*(\d{3,4})\b/g)].filter((match) => {
    const number = Number(match[1])
    return number >= FIRST_CANON && number <= LAST_CANON
  })

  const bestByNumber = new Map<number, CachedCanon>()

  for (let index = 0; index < markers.length; index += 1) {
    const marker = markers[index]
    const number = Number(marker[1])
    const start = (marker.index ?? 0) + marker[0].length
    const end = markers[index + 1]?.index ?? text.length
    const body = normalizeCanonBody(text.slice(start, end))

    if (!body) continue

    const candidate: CachedCanon = {number, text: body, sourceUrl: url}
    const previous = bestByNumber.get(number)

    // Intestazioni/navigazione possono ripetere "Can. N". Il testo normativo è
    // sistematicamente il candidato più sostanzioso prima del marker successivo.
    if (!previous || candidate.text.length > previous.text.length) {
      bestByNumber.set(number, candidate)
    }
  }

  return [...bestByNumber.values()].sort((a, b) => a.number - b.number)
}

function discoverBookPages() {
  for (const indexUrl of INDEX_URLS) {
    const html = tryCurl(indexUrl)
    if (!html) continue

    const links = new Set<string>()
    const hrefPattern = /href\s*=\s*["']([^"']*cic_libroIV_[^"']+_it\.html(?:\?[^"']*)?)["']/gi

    for (const match of html.matchAll(hrefPattern)) {
      try {
        const absolute = new URL(match[1], indexUrl)
        if (!/^(press|www)\.vatican\.va$/i.test(absolute.hostname)) continue
        links.add(absolute.href)
      } catch {
        // Ignora soltanto href realmente malformati.
      }
    }

    if (links.size > 0) {
      return [...links].sort((left, right) => {
        const a = left.match(/cic_libroIV_(\d+)/)?.[1]
        const b = right.match(/cic_libroIV_(\d+)/)?.[1]
        return Number(a ?? 0) - Number(b ?? 0) || left.localeCompare(right)
      })
    }
  }

  throw new Error(
    'Libro IV: impossibile ricavare dall’indice ufficiale l’elenco delle pagine del Libro IV.',
  )
}

function buildCache(): CachePayload {
  console.log('Libro IV: acquisizione dall’indice ufficiale della Santa Sede...')

  const pageUrls = discoverBookPages()
  console.log(`Libro IV: ${pageUrls.length} pagine ufficiali individuate dall’indice.`)

  const byNumber = new Map<number, CachedCanon>()
  let downloadedPages = 0

  for (const [index, url] of pageUrls.entries()) {
    const html = tryCurl(url)
    if (!html) {
      console.warn(`\nLibro IV: pagina non raggiungibile, continuo: ${url}`)
      continue
    }

    downloadedPages += 1
    const pageCanons = extractCanonsFromPage(url, html)

    process.stdout.write(
      `\rLibro IV: pagina ${index + 1}/${pageUrls.length} — canoni raccolti ${byNumber.size}`,
    )

    for (const canon of pageCanons) {
      const previous = byNumber.get(canon.number)
      if (!previous || canon.text.length > previous.text.length) {
        byNumber.set(canon.number, canon)
      }
    }
  }
  process.stdout.write('\n')

  const missing: number[] = []
  for (let number = FIRST_CANON; number <= LAST_CANON; number += 1) {
    if (!byNumber.has(number)) missing.push(number)
  }

  if (missing.length > 0) {
    throw new Error(
      `Libro IV: acquisizione incompleta. Pagine scaricate ${downloadedPages}/${pageUrls.length}; ` +
        `canoni presenti ${byNumber.size}/${EXPECTED_CANONS}; mancanti: ${missing.join(', ')}`,
    )
  }

  const canons = [...byNumber.values()].sort((a, b) => a.number - b.number)
  if (canons.length !== EXPECTED_CANONS) {
    throw new Error(
      `Libro IV: attesi ${EXPECTED_CANONS} canoni, trovati ${canons.length}.`,
    )
  }

  const payload: CachePayload = {
    generatedAt: new Date().toISOString(),
    canons,
  }

  writeFileSync(CACHE_FILE, JSON.stringify(payload), 'utf8')
  console.log(`Libro IV: cache verificata, ${EXPECTED_CANONS}/${EXPECTED_CANONS} canoni.`)
  return payload
}

function loadCache() {
  if (process.env.CIC_BOOK4_REFRESH === '1' || !existsSync(CACHE_FILE)) {
    return buildCache()
  }

  const payload = JSON.parse(readFileSync(CACHE_FILE, 'utf8')) as CachePayload
  if (!Array.isArray(payload.canons) || payload.canons.length !== EXPECTED_CANONS) {
    return buildCache()
  }

  return payload
}

const payload = loadCache()

export const canons834to1253: CanonInput[] = payload.canons.map((source) => ({
  number: source.number,
  structuralUnitCanonicalId: unitForCanon(source.number),
  status: amendedCanons.has(source.number) ? 'amended' : 'inForce',
  versions: [
    {
      versionId: `cic-1983-can-${source.number}-it-current`,
      versionLabel: 'Testo vigente — fonte ufficiale della Santa Sede',
      status: 'current',
      language: 'it',
      text: source.text,
      sourceDocumentTitle: 'Codice di Diritto Canonico',
      sourceCitation: `CIC, can. ${source.number} — testo vigente`,
      sourceUrl: source.sourceUrl,
      segments: segments(source.number, source.text),
    },
  ],
}))