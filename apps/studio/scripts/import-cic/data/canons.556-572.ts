import type {CanonInput, CanonSegmentInput} from '../types'

const CHAPTER = 'cic-1983-book-2-part-2-section-2-title-3-chapter-8'
const ARTICLE_1 = `${CHAPTER}-article-1`
const ARTICLE_2 = `${CHAPTER}-article-2`

const SOURCE_URL_556_563 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_556-563_it.html'
const SOURCE_URL_564_572 =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_564-572_it.html'

function segments(canon: number, text: string): CanonSegmentInput[] {
  const paragraphMatches = [...text.matchAll(/(^|\n\n)§(\d+)\./g)]
  const result: CanonSegmentInput[] = []

  if (paragraphMatches.length === 0) return result

  for (let i = 0; i < paragraphMatches.length; i += 1) {
    const match = paragraphMatches[i]
    const prefix = match[1] ?? ''
    const paragraphNumber = Number(match[2])
    const startOffset = (match.index ?? 0) + prefix.length
    const nextMatch = paragraphMatches[i + 1]
    const nextParagraphOffset = nextMatch
      ? (nextMatch.index ?? text.length) + (nextMatch[1]?.length ?? 0)
      : text.length

    let endOffset = nextParagraphOffset
    while (endOffset > startOffset && /\s/.test(text[endOffset - 1])) endOffset -= 1

    result.push({
      segmentId: `can-${canon}-par-${paragraphNumber}`,
      segmentType: 'paragraph',
      label: `§ ${paragraphNumber}`,
      order: paragraphNumber,
      startOffset,
      endOffset,
      isFormalDivision: true,
    })
  }

  return result
}

function canon(
  number: number,
  editorialTitle: string,
  keywords: string[],
  structuralUnitCanonicalId: string,
  sourceUrl: string,
  text: string,
): CanonInput {
  return {
    number,
    editorialTitle,
    keywords,
    structuralUnitCanonicalId,
    status: 'inForce',
    versions: [
      {
        versionId: `cic-1983-can-${number}-it-1983`,
        versionLabel: 'Versione originaria 1983',
        status: 'current',
        validFrom: '1983-11-27',
        language: 'it',
        text,
        sourceDocumentTitle: 'Codice di Diritto Canonico',
        sourceCitation: `CIC 1983, can. ${number}`,
        sourceUrl,
        segments: segments(number, text),
      },
    ],
  }
}

const t556 = `In questo contesto con il nome di rettore di una chiesa si intende il sacerdote al quale è demandata la cura di una chiesa che non è né parrocchiale, né capitolare, né annessa alla casa di una comunità religiosa o di una società di vita apostolica che celebri in essa le funzioni religiose.`

const t557 = `§1. Il rettore di una chiesa viene nominato liberamente dal Vescovo diocesano, a meno che a qualcuno non competa legittimamente il diritto di elezione o di presentazione; in tal caso spetta al Vescovo diocesano confermare o istituire il rettore.

§2. Anche se la chiesa appartiene ad un istituto clericale religioso di diritto pontificio, spetta al Vescovo diocesano istituire il rettore presentato dal Superiore.

§3. Il rettore di una chiesa che sia unita al seminario o ad un collegio retto da chierici, è il rettore del seminario o del collegio, a meno che il Vescovo diocesano non abbia stabilito altrimenti.`

const t558 = `Salvo il disposto del can. 262, non è lecito al rettore compiere nella chiesa affidatagli le funzioni parrocchiali di cui al can. 530, nn. 1-6, a meno che non ci sia il consenso del parroco oppure, se è il caso, la sua delega.`

const t559 = `Nella chiesa affidatagli il rettore può compiere celebrazioni liturgiche anche solenni, salve le legittime leggi di fondazione e purché, a giudizio dell'Ordinario del luogo, non rechino danno in alcun modo al ministero parrocchiale.`

const t560 = `Quando lo ritenga opportuno, l'Ordinario del luogo può ingiungere al rettore di celebrare nella sua chiesa determinate funzioni anche parrocchiali per il popolo e inoltre di aprire la chiesa a determinati gruppi di fedeli perché vi celebrino funzioni liturgiche.`

const t561 = `Senza licenza del rettore o di un altro superiore legittimo, a nessuno è lecito celebrare nella chiesa l'Eucaristia, amministrare i sacramenti o compiere altre funzioni sacre: licenza che deve essere data o negata a norma del diritto.`

const t562 = `Il rettore di una chiesa, sotto l'autorità dell'Ordinario del luogo e osservando i legittimi statuti e i diritti acquisiti, è tenuto all'obbligo di vigilare che le funzioni sacre vengano celebrate nella chiesa con decoro, secondo le norme liturgiche e le disposizioni dei canoni, che gli oneri siano fedelmente adempiuti, che i beni siano amministrati diligentemente, che si provveda alla conservazione e al decoro della suppellettile sacra e degli edifici sacri, e che non vi avvenga nulla che sia in qualunque modo sconveniente alla santità del luogo e al rispetto dovuto alla casa di Dio.`

const t563 = `L'Ordinario del luogo, per giusta causa, può rimuovere dall'ufficio, secondo il suo prudente giudizio, il rettore di una chiesa, anche se è stato eletto o presentato da altri, fermo restando il disposto del can. 682, §2.`

const t564 = `Il cappellano è il sacerdote cui viene affidata in modo stabile la cura pastorale, almeno in parte, di una comunità o di un gruppo particolare di fedeli, e che deve essere esercitata a norma del diritto universale e particolare.`

const t565 = `A meno che il diritto non preveda altro o a meno che a qualcuno non spettino legittimamente diritti speciali, il cappellano viene nominato dall'Ordinario del luogo, al quale pure compete istituire chi è stato presentato o confermare chi è stato eletto.`

const t566 = `§1. È necessario che il cappellano sia fornito di tutte le facoltà che richiede una ordinata cura pastorale. Oltre a quelle che vengono concesse dal diritto particolare o da una delega speciale, il cappellano, in forza dell'ufficio, ha la facoltà di udire le confessioni dei fedeli affidati alle sue cure, di predicare loro la parola di Dio, di amministrare loro il Viatico e l'unzione degli infermi, nonché di conferire il sacramento della confermazione a coloro che versano in pericolo di morte.

§2. Negli ospedali, nelle carceri e nei viaggi in mare il cappellano ha inoltre la facoltà, esercitabile solo in tali luoghi, di assolvere dalle censure latae sententiae non riservate né dichiarate, fermo restando tuttavia il disposto del can. 976.`

const t567 = `§1. L'Ordinario del luogo non proceda alla nomina del cappellano di una casa di un istituto religioso laicale senza aver consultato il Superiore, il quale ha il diritto, sentita la comunità, di proporre qualche sacerdote.

§2. Spetta al cappellano celebrare o dirigere le funzioni liturgiche; non gli è lecito però ingerirsi nel governo interno dell'istituto.`

const t568 = `Per quanto è possibile, siano costituiti dei cappellani per coloro che non possono usufruire, per la loro situazione di vita, della cura ordinaria dei parroci, come gli emigranti, gli esuli, i profughi, i nomadi, i naviganti.`

const t569 = `I cappellani militari sono retti da leggi speciali.`

const t570 = `Se alla sede di una comunità o di un gruppo è annessa una chiesa non parrocchiale, il cappellano sia rettore della chiesa stessa, a meno che la cura della comunità o della chiesa non esiga altro.`

const t571 = `Nell'esercizio del suo incarico pastorale, il cappellano mantenga il debito rapporto con il parroco.`

const t572 = `Per quanto riguarda la rimozione del cappellano, si osservi il disposto del can. 563.`

export const canons556to572: CanonInput[] = [
  canon(556, 'Nozione di rettore di una chiesa', ['rettore', 'chiesa non parrocchiale', 'sacerdote'], ARTICLE_1, SOURCE_URL_556_563, t556),
  canon(557, 'Nomina del rettore', ['rettore', 'Vescovo diocesano', 'nomina'], ARTICLE_1, SOURCE_URL_556_563, t557),
  canon(558, 'Funzioni parrocchiali riservate', ['rettore', 'funzioni parrocchiali', 'parroco'], ARTICLE_1, SOURCE_URL_556_563, t558),
  canon(559, 'Celebrazioni liturgiche del rettore', ['rettore', 'celebrazioni liturgiche', 'ministero parrocchiale'], ARTICLE_1, SOURCE_URL_556_563, t559),
  canon(560, 'Funzioni affidate dall’Ordinario', ['Ordinario del luogo', 'rettore', 'funzioni liturgiche'], ARTICLE_1, SOURCE_URL_556_563, t560),
  canon(561, 'Licenza del rettore', ['licenza', 'Eucaristia', 'sacramenti'], ARTICLE_1, SOURCE_URL_556_563, t561),
  canon(562, 'Obblighi di vigilanza del rettore', ['rettore', 'vigilanza', 'beni ecclesiastici'], ARTICLE_1, SOURCE_URL_556_563, t562),
  canon(563, 'Rimozione del rettore', ['rettore', 'rimozione', 'Ordinario del luogo'], ARTICLE_1, SOURCE_URL_556_563, t563),
  canon(564, 'Nozione di cappellano', ['cappellano', 'cura pastorale', 'fedeli'], ARTICLE_2, SOURCE_URL_564_572, t564),
  canon(565, 'Nomina del cappellano', ['cappellano', 'Ordinario del luogo', 'nomina'], ARTICLE_2, SOURCE_URL_564_572, t565),
  canon(566, 'Facoltà del cappellano', ['cappellano', 'facoltà', 'sacramenti'], ARTICLE_2, SOURCE_URL_564_572, t566),
  canon(567, 'Cappellano di una casa religiosa laicale', ['cappellano', 'istituto religioso laicale', 'Superiore'], ARTICLE_2, SOURCE_URL_564_572, t567),
  canon(568, 'Cappellani per particolari categorie di fedeli', ['cappellano', 'emigranti', 'profughi'], ARTICLE_2, SOURCE_URL_564_572, t568),
  canon(569, 'Cappellani militari', ['cappellani militari', 'leggi speciali'], ARTICLE_2, SOURCE_URL_564_572, t569),
  canon(570, 'Cappellano e rettore della chiesa', ['cappellano', 'rettore', 'chiesa non parrocchiale'], ARTICLE_2, SOURCE_URL_564_572, t570),
  canon(571, 'Rapporto del cappellano con il parroco', ['cappellano', 'parroco', 'cura pastorale'], ARTICLE_2, SOURCE_URL_564_572, t571),
  canon(572, 'Rimozione del cappellano', ['cappellano', 'rimozione', 'can. 563'], ARTICLE_2, SOURCE_URL_564_572, t572),
]
