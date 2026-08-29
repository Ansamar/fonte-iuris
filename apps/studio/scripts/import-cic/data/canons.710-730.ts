import type {CanonInput, CanonSegmentInput} from '../types'

const UNIT = 'cic-1983-book-2-part-3-section-1-title-3'
const SOURCE_URL =
  'https://www.vatican.va/archive/cod-iuris-canonici/ita/documents/cic_libroII_710-730_it.html'

function segments(canon: number, text: string): CanonSegmentInput[] {
  const paragraphMatches = [...text.matchAll(/(^|\n\n)§(\d+)\./g)]
  const result: CanonSegmentInput[] = []

  if (paragraphMatches.length === 0) {
    const numberMatches = [...text.matchAll(/(?:^|\n)(\d+)\)/g)]
    for (let i = 0; i < numberMatches.length; i += 1) {
      const match = numberMatches[i]
      const number = Number(match[1])
      const rawIndex = match.index ?? 0
      const startOffset = rawIndex + (text[rawIndex] === '\n' ? 1 : 0)
      const next = numberMatches[i + 1]
      let endOffset = next
        ? (next.index ?? text.length) + (text[next.index ?? 0] === '\n' ? 1 : 0)
        : text.length
      while (endOffset > startOffset && /\s/.test(text[endOffset - 1])) endOffset -= 1
      result.push({segmentId: `can-${canon}-num-${number}`, segmentType: 'number', label: `${number})`, order: number, startOffset, endOffset, isFormalDivision: true})
    }
    return result
  }

  for (let i = 0; i < paragraphMatches.length; i += 1) {
    const match = paragraphMatches[i]
    const prefix = match[1] ?? ''
    const paragraphNumber = Number(match[2])
    const startOffset = (match.index ?? 0) + prefix.length
    const nextMatch = paragraphMatches[i + 1]
    const nextParagraphOffset = nextMatch ? (nextMatch.index ?? text.length) + (nextMatch[1]?.length ?? 0) : text.length
    let endOffset = nextParagraphOffset
    while (endOffset > startOffset && /\s/.test(text[endOffset - 1])) endOffset -= 1
    const paragraphId = `can-${canon}-par-${paragraphNumber}`
    result.push({segmentId: paragraphId, segmentType: 'paragraph', label: `§ ${paragraphNumber}`, order: paragraphNumber, startOffset, endOffset, isFormalDivision: true})

    const paragraphText = text.slice(startOffset, nextParagraphOffset)
    const numberMatches = [...paragraphText.matchAll(/(?:^|\n)(\d+)\)/g)]
    for (let j = 0; j < numberMatches.length; j += 1) {
      const numberMatch = numberMatches[j]
      const number = Number(numberMatch[1])
      const rawIndex = numberMatch.index ?? 0
      const numberStart = startOffset + rawIndex + (paragraphText[rawIndex] === '\n' ? 1 : 0)
      const nextNumber = numberMatches[j + 1]
      const numberEnd = nextNumber ? startOffset + (nextNumber.index ?? paragraphText.length) + (paragraphText[nextNumber.index ?? 0] === '\n' ? 1 : 0) : nextParagraphOffset
      let trimmedEnd = numberEnd
      while (trimmedEnd > numberStart && /\s/.test(text[trimmedEnd - 1])) trimmedEnd -= 1
      result.push({segmentId: `can-${canon}-par-${paragraphNumber}-num-${number}`, segmentType: 'number', label: `${number})`, order: number, parentSegmentId: paragraphId, startOffset: numberStart, endOffset: trimmedEnd, isFormalDivision: true})
    }
  }
  return result
}

function canon(number: number, editorialTitle: string, keywords: string[], text: string): CanonInput {
  return {number, editorialTitle, keywords, structuralUnitCanonicalId: UNIT, status: 'inForce', versions: [{versionId: `cic-1983-can-${number}-it-1983`, versionLabel: 'Versione originaria 1983', status: 'current', validFrom: '1983-11-27', language: 'it', text, sourceDocumentTitle: 'Codice di Diritto Canonico', sourceCitation: `CIC 1983, can. ${number}`, sourceUrl: SOURCE_URL, segments: segments(number, text)}]}
}

function amendedCanon729(original: string, current: string): CanonInput {
  return {number: 729, editorialTitle: 'Dimissione dall’istituto secolare', keywords: ['dimissione', 'istituto secolare', 'procedura'], structuralUnitCanonicalId: UNIT, status: 'amended', versions: [
    {versionId: 'cic-1983-can-729-it-1983', versionLabel: 'Versione originaria 1983', status: 'superseded', validFrom: '1983-11-27', validUntil: '2019-04-09', language: 'it', text: original, sourceDocumentTitle: 'Codice di Diritto Canonico', sourceCitation: 'CIC 1983, can. 729 — redazione originaria', sourceUrl: SOURCE_URL, segments: segments(729, original)},
    {versionId: 'cic-1983-can-729-it-2019', versionLabel: 'Versione vigente dopo Communis vita', status: 'current', validFrom: '2019-04-10', language: 'it', text: current, sourceDocumentTitle: 'Codice di Diritto Canonico', sourceCitation: 'CIC 1983, can. 729', sourceUrl: SOURCE_URL, changeSummary: 'Canone modificato dal Motu Proprio Communis vita (19 marzo 2019).', segments: segments(729, current)},
  ]}
}

const texts: Record<number, string> = {
710: `L'istituto secolare è un istituto di vita consacrata in cui i fedeli, vivendo nel mondo, tendono alla perfezione della carità e si impegnano per la santificazione del mondo, soprattutto operando all'interno di esso.`,
711: `Un membro di istituto secolare, in forza della consacrazione, non cambia la propria condizione canonica, clericale o laicale, che gli è propria nel popolo di Dio, salve le disposizioni del diritto che riguardano gli istituti di vita consacrata.`,
712: `Ferme restando le disposizioni dei cann. 598-601, le costituzioni stabiliscano i vincoli sacri con cui vengono assunti nell'istituto i consigli evangelici e definiscano gli obblighi che essi comportano, salva sempre però, nello stile di vita, la secolarità propria dell'istituto.`,
713: `§1. I membri di tali istituti esprimono e realizzano la propria consacrazione nell'attività apostolica e a modo di fermento si sforzano di permeare ogni realtà di spirito evangelico per consolidare e far crescere il Corpo di Cristo.\n\n§2. I membri laici, nel mondo e dall'interno di esso, partecipano della funzione evangelizzatrice della Chiesa sia mediante la testimonianza di vita cristiana e di fedeltà alla propria consacrazione, sia attraverso l'aiuto che dànno perché le realtà temporali siano ordinate secondo Dio e il mondo sia vivificato dalla forza del Vangelo. Essi offrono inoltre la propria collaborazione per il servizio della comunità ecclesiale, secondo lo stile di vita secolare loro proprio.\n\n§3. I membri chierici, attraverso la testimonianza della vita consacrata, soprattutto nel presbiterio, sono di aiuto ai confratelli con una peculiare carità apostolica e in mezzo al popolo di Dio realizzano la santificazione del mondo con il proprio ministero sacro.`,
714: `I membri degli istituti secolari conducano la propria vita nelle situazioni ordinarie del mondo, soli, o ciascuno nella propria famiglia, oppure in gruppi di vita fraterna a norma delle costituzioni.`,
715: `§1. I membri chierici incardinati in una diocesi dipendono dal Vescovo diocesano, salvo quanto riguarda la vita consacrata nel proprio istituto.\n\n§2. Quelli invece che a norma del can. 266, §3 vengono incardinati nell'istituto, se sono destinati alle opere proprie dell'istituto o a funzioni di governo all'interno di esso, dipendono dal Vescovo allo stesso modo dei religiosi.`,
716: `§1. Tutti i membri partecipino attivamente alla vita dell'istituto secondo il diritto proprio.\n\n§2. I membri di uno stesso istituto conservino la comunione tra loro curando con sollecitudine l'unità dello spirito e una vera fraternità.`,
717: `§1. Le costituzioni definiscano la forma di governo propria dell'istituto, la durata in carica dei Moderatori e il modo della loro designazione.\n\n§2. Nessuno sia designato come Moderatore supremo se non è stato incorporato nell'istituto in modo definitivo.\n\n§3. Coloro che sono preposti al governo dell'istituto abbiano cura che sia conservata l'unità dello spirito e che sia promossa l'attiva partecipazione dei membri.`,
718: `L'amministrazione dei beni dell'istituto, che deve esprimere e favorire la povertà evangelica, è regolata dalle norme del Libro V, I beni temporali della Chiesa, nonché dal diritto proprio dell'istituto. Il diritto proprio deve parimenti definire gli obblighi, specialmente di carattere economico, dell'istituto verso i membri che ad esso prestano la propria attività.`,
719: `§1. Per rispondere fedelmente alla propria vocazione e perché la loro azione apostolica scaturisca dalla stessa unione con Cristo, i membri siano assidui all'orazione, attendano convenientemente alla lettura delle sacre Scritture, osservino i tempi di ritiro annuale e compiano le altre pratiche spirituali secondo il diritto proprio.\n\n§2. La celebrazione dell'Eucaristia, in quanto possibile quotidiana, sia la sorgente e la forza di tutta la loro vita consacrata.\n\n§3. Si accostino liberamente e con frequenza al sacramento della penitenza.\n\n§4. Siano liberi di ricevere la necessaria direzione della coscienza e di richiedere consigli in materia, se lo desiderano, anche ai propri Moderatori.`,
720: `Il diritto di ammettere nell'istituto per il periodo di prova oppure per assumere i vincoli sacri, sia temporanei sia perpetui o definitivi, compete ai Moderatori maggiori con il loro consiglio, a norma delle costituzioni.`,
721: `§1. È ammesso invalidamente al periodo di prova iniziale:\n1) chi non ha ancora raggiunto la maggiore età;\n2) chi è legato attualmente con vincolo sacro ad un istituto di vita consacrata o è incorporato in una società di vita apostolica;\n3) il coniuge durante il matrimonio.\n\n§2. Le costituzioni possono stabilire altri impedimenti anche per la validità dell'ammissione, o porre condizioni.\n\n§3. Per essere accettati si richiede inoltre la maturità necessaria a condurre in modo conveniente la vita propria dell'istituto.`,
722: `§1. La prova iniziale sia ordinata a far sì che i candidati prendano più chiara coscienza della loro vocazione divina e di quella specifica dell'istituto e ne sperimentino lo spirito e il genere di vita.\n\n§2. I candidati siano debitamente formati a condurre una vita secondo i consigli evangelici e istruiti a trasformarla integralmente in apostolato, adottando quelle forme di evangelizzazione che meglio rispondano al fine, allo spirito e all'indole dell'istituto.\n\n§3. Le costituzioni devono definire il metodo e la durata di tale prova, non inferiore a due anni, che precede il primo impegno con vincoli sacri nell'istituto.`,
723: `§1. Compiuto il tempo della prova iniziale il candidato che viene giudicato idoneo assuma i tre consigli evangelici, confermati dal vincolo sacro, oppure lasci l'istituto.\n\n§2. Questa prima incorporazione, non inferiore a cinque anni, sia temporanea a norma delle costituzioni.\n\n§3. Trascorso tale periodo di tempo, il membro giudicato idoneo sia ammesso all'incorporazione perpetua oppure a quella definitiva, cioè con vincoli temporanei da rinnovarsi sempre alla scadenza.\n\n§4. L'incorporazione definitiva è equiparata a quella perpetua, in ordine a determinati effetti giuridici, che devono essere stabiliti nelle costituzioni.`,
724: `§1. Dopo il primo impegno con vincoli sacri, la formazione deve essere continuata costantemente a norma delle costituzioni.\n\n§2. I membri devono essere preparati di pari passo tanto nelle scienze umane quanto in quelle divine; i Moderatori dell'istituto sentano seriamente la responsabilità della loro continua formazione spirituale.`,
725: `L'istituto può associare a sé, con qualche vincolo determinato dalle costituzioni, altri fedeli che si impegnino a tendere alla perfezione evangelica secondo lo spirito dell'istituto e a partecipare della sua stessa missione.`,
726: `§1. Trascorso il periodo dell'incorporazione temporanea il membro può liberamente lasciare l'istituto, o per giusta causa può essere escluso dalla rinnovazione dei vincoli sacri da parte del Moderatore maggiore, udito il suo consiglio.\n\n§2. Il membro di incorporazione temporanea che lo richieda spontaneamente, per grave causa può ottenere dal Moderatore supremo, con il consenso del suo consiglio, l'indulto di lasciare l'istituto.`,
727: `§1. Se un membro incorporato con vincolo perpetuo vuole lasciare l'istituto, dopo avere seriamente ponderato la cosa davanti al Signore deve chiederne l'indulto, per mezzo del Moderatore supremo, alla Sede Apostolica se l'istituto è di diritto pontificio; altrimenti anche al Vescovo diocesano, secondo quanto è definito dalle costituzioni.\n\n§2. Trattandosi di sacerdote incardinato nell'istituto si osservi il disposto del can. 693.`,
728: `Con la legittima concessione dell'indulto di lasciare l'istituto cessano tutti i vincoli, e insieme i diritti e gli obblighi derivanti dall'incorporazione.`,
730: `Per il passaggio di un membro di istituto secolare ad un altro istituto secolare si osservino le disposizioni dei cann. 684, §§1, 2, 4 e 685; invece per il passaggio ad un istituto religioso o ad una società di vita apostolica, o da questi ad un istituto secolare, si richiede la licenza della Sede Apostolica, alle cui disposizioni ci si deve attenere.`,
}

const t729Original = `La dimissione di un membro dall'istituto avviene a norma dei cann. 694 e 695; le costituzioni definiscano inoltre altre cause di dimissione, purché siano proporzionatamente gravi, esterne, imputabili e comprovate giuridicamente, e si osservi inoltre la procedura stabilita nei cann. 697-700. Al membro dimesso si applica il disposto del can. 701.`
const t729Current = `La dimissione di un membro dall’istituto avviene a norma dei cann. 694 § 1, 1 e 2 e 695. Le costituzioni definiscano anche altre cause di dimissione, purché siano proporzionatamente gravi, esterne, imputabili e comprovate giuridicamente, e si osservi inoltre la procedura stabilita nei cann. 697-700. Al membro dimesso si applica il disposto del can. 701.`

const titles: Record<number, [string, string[]]> = {
710: ['Natura dell’istituto secolare', ['istituto secolare', 'vita consacrata', 'secolarità']], 711: ['Condizione canonica dei membri', ['condizione canonica', 'chierici', 'laici']], 712: ['Vincoli sacri e secolarità', ['consigli evangelici', 'vincoli sacri', 'costituzioni']], 713: ['Consacrazione e attività apostolica', ['apostolato', 'evangelizzazione', 'santificazione del mondo']], 714: ['Forma di vita nel mondo', ['vita secolare', 'famiglia', 'vita fraterna']], 715: ['Membri chierici e dipendenza dal Vescovo', ['chierici', 'incardinazione', 'Vescovo diocesano']], 716: ['Partecipazione e comunione nell’istituto', ['comunione', 'fraternità', 'partecipazione']], 717: ['Governo dell’istituto', ['governo', 'Moderatore supremo', 'costituzioni']], 718: ['Amministrazione dei beni', ['beni temporali', 'povertà', 'amministrazione']], 719: ['Vita spirituale dei membri', ['orazione', 'Eucaristia', 'penitenza']], 720: ['Ammissione e assunzione dei vincoli', ['ammissione', 'vincoli sacri', 'Moderatori maggiori']], 721: ['Requisiti per la prova iniziale', ['prova iniziale', 'impedimenti', 'ammissione']], 722: ['Prova iniziale e formazione', ['formazione', 'prova iniziale', 'apostolato']], 723: ['Incorporazione nell’istituto', ['incorporazione', 'vincoli sacri', 'perpetua']], 724: ['Formazione permanente', ['formazione permanente', 'scienze umane', 'scienze divine']], 725: ['Associazione di altri fedeli', ['associati', 'fedeli', 'missione']], 726: ['Uscita durante l’incorporazione temporanea', ['uscita', 'incorporazione temporanea', 'indulto']], 727: ['Indulto per il membro incorporato perpetuamente', ['indulto', 'Sede Apostolica', 'uscita']], 728: ['Effetti dell’indulto di uscita', ['indulto', 'vincoli', 'diritti e obblighi']], 730: ['Passaggio ad altro istituto', ['passaggio', 'istituto secolare', 'Sede Apostolica']],
}

export const canons710to730: CanonInput[] = [
  ...Object.keys(texts).map(Number).filter((n) => n !== 729).sort((a,b) => a-b).map((n) => canon(n, titles[n][0], titles[n][1], texts[n])),
  amendedCanon729(t729Original, t729Current),
].sort((a,b) => a.number-b.number)
