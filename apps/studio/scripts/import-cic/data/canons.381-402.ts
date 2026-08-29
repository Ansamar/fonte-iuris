import type {CanonInput, CanonSegmentInput} from '../types'

const VATICAN_381_402_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_381-402_it.html'

const UNIT =
  'cic-1983-book-2-part-2-section-2-title-1-chapter-2-article-2'

function paragraphSegments(canon: number, text: string): CanonSegmentInput[] {
  const matches = [...text.matchAll(/(^|\n\n)§(\d+)\./g)]

  return matches.map((match, index) => {
    const prefix = match[1] ?? ''
    const startOffset = (match.index ?? 0) + prefix.length
    const nextMatch = matches[index + 1]
    const endOffset = nextMatch
      ? (nextMatch.index ?? text.length) + (nextMatch[1]?.length ?? 0)
      : text.length

    let trimmedEndOffset = endOffset
    while (trimmedEndOffset > startOffset && /\s/.test(text[trimmedEndOffset - 1])) {
      trimmedEndOffset -= 1
    }

    const paragraphNumber = Number(match[2])

    return {
      segmentId: `can-${canon}-par-${paragraphNumber}`,
      segmentType: 'paragraph',
      label: `§ ${paragraphNumber}`,
      order: paragraphNumber,
      startOffset,
      endOffset: trimmedEndOffset,
      isFormalDivision: true,
    }
  })
}

function canon(
  number: number,
  editorialTitle: string,
  keywords: string[],
  text: string,
): CanonInput {
  return {
    number,
    editorialTitle,
    keywords,
    structuralUnitCanonicalId: UNIT,
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
        sourceUrl: VATICAN_381_402_URL,
        segments: paragraphSegments(number, text),
      },
    ],
  }
}

const text381 = `§1. Compete al Vescovo diocesano nella diocesi affidatagli tutta la potestà ordinaria, propria e immediata che è richiesta per l'esercizio del suo ufficio pastorale, fatta eccezione per quelle cause che dal diritto o da un decreto del Sommo Pontefice sono riservate alla suprema oppure ad altra autorità ecclesiastica.

§2. Nel diritto sono equiparati al Vescovo diocesano, a meno che non risulti diversamente per la natura della cosa o per una disposizione del diritto, coloro che presiedono le altre comunità di fedeli di cui nel can. 368.`

const text382 = `§1. Il Vescovo promosso non può intromettersi nell'esercizio dell'ufficio affidatogli, se prima non ha preso possesso canonico della diocesi; tuttavia può esercitare gli uffici che già aveva nella medesima diocesi al momento della promozione, fermo restando il disposto del can. 409, §2.

§2. Se non è legittimamente impedito, colui che è promosso all'ufficio di Vescovo diocesano deve prendere possesso canonico della sua diocesi entro quattro mesi dalla ricezione della lettera apostolica, se non è già stato consacrato Vescovo; entro due mesi dalla ricezione se è già consacrato.

§3. Il Vescovo prende possesso canonico della diocesi nel momento in cui esibisce nella diocesi stessa, personalmente o mediante un procuratore, la lettera apostolica al collegio dei consultori, alla presenza del cancelliere della curia, che mette agli atti il fatto, oppure, nelle diocesi di nuova erezione, nel momento in cui comunica al clero e al popolo presenti nella chiesa cattedrale tale lettera, mentre il presbitero più anziano tra i presenti mette agli atti il fatto.

§4. Si raccomanda vivamente che la presa di possesso canonico avvenga nella chiesa cattedrale con un atto liturgico, alla presenza del clero e del popolo.`

const text383 = `§1. Nell'esercizio del suo ufficio di pastore, il Vescovo diocesano si mostri sollecito nei confronti di tutti i fedeli che sono affidati alla sua cura, di qualsiasi età, condizione o nazione, sia di coloro che abitano nel territorio sia di coloro che vi si trovano temporaneamente, rivolgendosi con animo apostolico anche verso coloro che per la loro situazione di vita non possono usufruire sufficientemente della cura pastorale ordinaria, come pure verso quelli che si sono allontanati dalla pratica religiosa.

§2. Se ha nella propria diocesi fedeli di rito diverso, provveda alle loro necessità spirituali sia mediante sacerdoti o parrocchie del medesimo rito, sia mediante un Vicario episcopale.

§3. Abbia un atteggiamento di umanità e di carità nei confronti dei fratelli che non sono nella piena comunione con la Chiesa cattolica, favorendo anche l'ecumenismo, come viene inteso dalla Chiesa.

§4. Consideri affidati a sé nel Signore i non battezzati, affinché risplenda anche per loro la carità di Cristo, di cui il Vescovo deve essere testimone di fronte a tutti.`

const text384 = `Il Vescovo diocesano segua con particolare sollecitudine i presbiteri che deve ascoltare come collaboratori e consiglieri, difenda i loro diritti e curi che adempiano fedelmente gli obblighi propri del loro stato e che abbiano a disposizione i mezzi e le istituzioni di cui hanno bisogno per alimentare la vita spirituale e intellettuale; così pure faccia in modo che si provveda al loro onesto sostentamento e all'assistenza sociale, a norma del diritto.`

const text385 = `Il Vescovo diocesano favorisca in sommo grado le vocazioni ai diversi ministeri e alla vita consacrata, avendo cura in modo speciale delle vocazioni sacerdotali e missionarie.`

const text386 = `§1. Il Vescovo diocesano è tenuto a proporre e spiegare ai fedeli le verità di fede che si devono credere e applicare nei costumi, predicando personalmente con frequenza; abbia anche cura che si osservino fedelmente le disposizioni dei canoni che riguardano il ministero della parola, soprattutto l'omelia e la formazione catechistica, in modo che venga offerta a tutti l'intera dottrina cristiana.

§2. Difenda con fermezza, usando i mezzi più adatti, l'integrità e l'unità della fede che si deve professare, riconoscendo tuttavia la giusta libertà nell'ulteriore approfondimento delle verità.`

const text387 = `Il Vescovo diocesano, consapevole di essere tenuto ad offrire un esempio di santità nella carità, nell'umiltà e nella semplicità di vita, si impegni a promuovere con ogni mezzo la santità dei fedeli, secondo la vocazione propria di ciascuno, ed essendo il principale dispensatore dei misteri di Dio, si adoperi di continuo perché i fedeli affidati alle sue cure crescano in grazia mediante la celebrazione dei sacramenti e perché conoscano e vivano il mistero pasquale.`

const text388 = `§1. Il Vescovo diocesano, dopo aver preso possesso della diocesi, deve applicare la Messa per il popolo che gli è affidato, ogni domenica e nelle altre feste che nella sua regione sono di precetto.

§2. Il Vescovo deve celebrare ed applicare personalmente la Messa per il popolo nei giorni di cui al §1; se però ne è legittimamente impedito, la applichi in tali giorni tramite un altro, o personalmente in giorni diversi.

§3. Il Vescovo al quale sono affidate, oltre alla propria, altre diocesi, anche a titolo di amministrazione, soddisfa l'obbligo applicando una sola Messa per tutto il popolo che gli è affidato.

§4. Il Vescovo che non abbia soddisfatto l'obbligo di cui ai §§1-3, applichi quanto prima per il popolo tante Messe quante ne ha tralasciate.`

const text389 = `Presieda frequentemente nella chiesa cattedrale o in un'altra chiesa della sua diocesi alla celebrazione della santissima Eucaristia, soprattutto nelle feste di precetto e nelle altre solennità.`

const text390 = `Il Vescovo diocesano può celebrare pontificali in tutta la sua diocesi; non però fuori della sua diocesi senza il consenso espresso, o almeno ragionevolmente presunto, dell'Ordinario del luogo.`

const text391 = `§1. Spetta al Vescovo diocesano governare la Chiesa particolare a lui affidata con potestà legislativa, esecutiva e giudiziaria, a norma del diritto.

§2. Il Vescovo esercita la potestà legislativa personalmente; esercita la potestà esecutiva sia personalmente sia mediante i Vicari generali o episcopali, a norma del diritto; esercita la potestà giudiziaria sia personalmente sia mediante il Vicario giudiziale e i giudici, a norma del diritto.`

const text392 = `§1. Poiché deve difendere l'unità della Chiesa universale, il Vescovo è tenuto a promuovere la disciplina comune a tutta la Chiesa e perciò a urgere l'osservanza di tutte le leggi ecclesiastiche.

§2. Vigili che non si insinuino abusi nella disciplina ecclesiastica, soprattutto nel ministero della parola, nella celebrazione dei sacramenti e dei sacramentali, nel culto di Dio e dei Santi e nell'amministrazione dei beni.`

const text393 = `In tutti i negozi giuridici della diocesi, è il Vescovo diocesano che la rappresenta.`

const text394 = `§1. Il Vescovo favorisca nella diocesi le diverse forme dell'apostolato e curi che in tutta la diocesi o nei suoi distretti particolari tutte le opere di apostolato, mentre conservano l'indole propria di ciascuna, siano coordinate sotto la sua direzione.

§2. Solleciti l'adempimento del dovere, a cui sono tenuti i fedeli, di esercitare l'apostolato secondo la condizione e l'attitudine di ciascuno e li esorti a partecipare e a sostenere le varie opere di apostolato, secondo le necessità di luogo e di tempo.`

const text395 = `§1. Il Vescovo diocesano, anche se ha il coadiutore o l'ausiliare, è tenuto alla legge della residenza personale in diocesi.

§2. Tranne che a motivo della visita ad Limina, dei Concili, del sinodo dei Vescovi, della Conferenza Episcopale, a cui debba partecipare, oppure di un altro ufficio legittimamente affidatogli, può rimanere assente dalla diocesi per giusta causa non più di un mese, sia continuo sia interrotto, purché rimanga assicurato che per la sua assenza la diocesi non risenta alcun danno.

§3. Non sia assente dalla diocesi nei giorni di Natale, della Settimana Santa e della Risurrezione del Signore, della Pentecoste e del Corpo e del Sangue di Cristo, se non per una causa grave e urgente.

§4. Se il Vescovo è rimasto assente illegittimamente dalla diocesi più di sei mesi, il Metropolita informi la Sede Apostolica della sua assenza; se poi si tratta del Metropolita, faccia la stessa cosa il suffraganeo più anziano.`

const text396 = `§1. Il Vescovo è tenuto all'obbligo di visitare ogni anno la diocesi, o tutta o in parte, in modo da visitare l'intera diocesi almeno ogni cinque anni, o personalmente oppure, se è legittimamente impedito, tramite il Vescovo coadiutore, o l'ausiliare, o il Vicario generale o episcopale, o un altro presbitero.

§2. È in facoltà del Vescovo scegliere i chierici che preferisce come accompagnatori e aiutanti nella visita, riprovato ogni privilegio o consuetudine contraria.`

const text397 = `§1. Sono soggetti alla visita ordinaria del Vescovo le persone, le istituzioni cattoliche, le cose e i luoghi sacri che sono nell'àmbito della diocesi.

§2. Il Vescovo può visitare i membri degli istituti religiosi di diritto pontificio e le loro case solo nei casi espressamente previsti dal diritto.`

const text398 = `Il Vescovo si impegni a compiere la visita pastorale con la dovuta diligenza; faccia attenzione a non gravare su alcuno con spese superflue.`

const text399 = `§1. Il Vescovo diocesano è tenuto a presentare ogni cinque anni una relazione al Sommo Pontefice sullo stato della diocesi affidatagli, secondo la forma e il tempo stabiliti dalla Sede Apostolica.

§2. Se l'anno fissato per la presentazione della relazione coincide in tutto o in parte con il primo biennio dall'inizio del governo della diocesi, il Vescovo, per quella volta, può astenersi dal compilare e presentare la relazione.`

const text400 = `§1. Il Vescovo diocesano nell'anno in cui è tenuto a presentare la relazione al Sommo Pontefice, se non è stato stabilito diversamente dalla Sede Apostolica, si rechi nell'Urbe per venerare le tombe dei Beati Apostoli Pietro e Paolo e si presenti al Romano Pontefice.

§2. Il Vescovo adempia personalmente tale obbligo, se non ne è legittimamente impedito; in tal caso vi soddisfi tramite il coadiutore, se lo ha, o l'ausiliare, oppure tramite un sacerdote idoneo del suo presbiterio, che risieda nella sua diocesi.

§3. Il Vicario apostolico può soddisfare tale obbligo tramite un procuratore, anche residente nell'Urbe; il Prefetto apostolico non è tenuto a tale obbligo.`

const text401 = `§1. Il Vescovo diocesano che abbia compiuto i settantacinque anni di età è invitato a presentare la rinuncia all'ufficio al Sommo Pontefice, il quale provvederà, dopo aver valutato tutte le circostanze.

§2. Il Vescovo diocesano che per infermità o altra grave causa risultasse meno idoneo all'adempimento del suo ufficio, è vivamente invitato a presentare la rinuncia all'ufficio.`

const text402 = `§1. Il Vescovo, la cui rinuncia all'ufficio sia stata accettata, mantiene il titolo di emerito della sua diocesi e, se lo desidera, può conservare l'abitazione nella stessa diocesi, a meno che in casi determinati, per speciali circostanze, la Sede Apostolica non provveda diversamente.

§2. La Conferenza Episcopale deve curare che si provveda ad un adeguato e degno sostentamento del Vescovo che rinuncia, avuto presente tuttavia l'obbligo primario a cui è tenuta la diocesi per la quale ha prestato servizio.`

export const canons381to402: CanonInput[] = [
  canon(381, 'Potestà del Vescovo diocesano', ['Vescovo diocesano', 'potestà ordinaria', 'Chiesa particolare'], text381),
  canon(382, 'Presa di possesso canonico della diocesi', ['presa di possesso', 'lettera apostolica', 'collegio dei consultori'], text382),
  canon(383, 'Sollecitudine pastorale verso tutti', ['cura pastorale', 'ecumenismo', 'fedeli di altro rito'], text383),
  canon(384, 'Cura dei presbiteri', ['presbiteri', 'sostentamento', 'assistenza sociale'], text384),
  canon(385, 'Promozione delle vocazioni', ['vocazioni', 'ministeri', 'vita consacrata'], text385),
  canon(386, 'Ministero della parola e integrità della fede', ['predicazione', 'catechesi', 'integrità della fede'], text386),
  canon(387, 'Esempio di santità del Vescovo', ['santità', 'sacramenti', 'mistero pasquale'], text387),
  canon(388, 'Messa per il popolo', ['Messa pro populo', 'feste di precetto', 'obbligo pastorale'], text388),
  canon(389, 'Celebrazione dell’Eucaristia', ['Eucaristia', 'chiesa cattedrale', 'solennità'], text389),
  canon(390, 'Celebrazioni pontificali', ['pontificali', 'Ordinario del luogo'], text390),
  canon(391, 'Potestà legislativa, esecutiva e giudiziaria', ['potestà legislativa', 'potestà esecutiva', 'potestà giudiziaria'], text391),
  canon(392, 'Tutela della disciplina ecclesiastica', ['disciplina ecclesiastica', 'leggi ecclesiastiche', 'abusi'], text392),
  canon(393, 'Rappresentanza giuridica della diocesi', ['rappresentanza', 'negozi giuridici', 'diocesi'], text393),
  canon(394, 'Coordinamento dell’apostolato', ['apostolato', 'fedeli', 'coordinamento pastorale'], text394),
  canon(395, 'Residenza del Vescovo diocesano', ['residenza', 'assenza dalla diocesi', 'Metropolita'], text395),
  canon(396, 'Visita pastorale della diocesi', ['visita pastorale', 'Vescovo coadiutore', 'Vicario episcopale'], text396),
  canon(397, 'Soggetti alla visita pastorale', ['visita pastorale', 'istituti religiosi', 'luoghi sacri'], text397),
  canon(398, 'Modalità della visita pastorale', ['visita pastorale', 'diligenza', 'spese'], text398),
  canon(399, 'Relazione quinquennale alla Sede Apostolica', ['relazione quinquennale', 'Sommo Pontefice', 'Sede Apostolica'], text399),
  canon(400, 'Visita ad limina', ['visita ad limina', 'Romano Pontefice', 'Apostoli Pietro e Paolo'], text400),
  canon(401, 'Rinuncia del Vescovo diocesano', ['rinuncia', 'settantacinque anni', 'Sommo Pontefice'], text401),
  canon(402, 'Vescovo emerito e sostentamento', ['Vescovo emerito', 'sostentamento', 'Conferenza Episcopale'], text402),
]
