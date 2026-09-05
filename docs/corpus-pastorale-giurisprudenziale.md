# Fonte Iuris — Corpus pastorale e corpus giurisprudenziale

## Principio architetturale

`sourceDocument` resta il livello documentale: conserva titolo, URL ufficiale, testo acquisito, snapshot, hash, lingua, pubblicazione e metadati di provenienza.

Il significato giuridico non deve essere dedotto direttamente dal documento sorgente. Per questo vengono introdotte due entità autonome:

- `pastoralDocument`: qualifica funzione pastorale, destinatari, finalità, rilevanza canonica, materie e canoni collegati;
- `jurisprudentialDecision`: rappresenta la singola decisione, con tribunale, data, tipo, causa, dubium, dispositivo, ratio, proposizioni giurisprudenziali, canoni e materie.

La separazione evita tre errori: trattare ogni documento come norma; trasformare automaticamente la giurisprudenza in precedente vincolante; confondere il testo documentale con la sua analisi editoriale.

## Corpus giurisprudenziale — priorità

### 1. Supremo Tribunale della Segnatura Apostolica

Fonte ufficiale prioritaria: Santa Sede / Vatican.va, sezione “Giurisprudenza pubblicata”. Il repertorio ufficiale offre un Conspectus della giurisprudenza pubblicata 1968–2022 e distingue gli ambiti di vigilanza sull'amministrazione della giustizia, giudiziale e contenzioso-amministrativo.

URL di riferimento:
- https://www.vatican.va/roman_curia/tribunals/apost_signat/documents/trib_segnatura-apost_giurisprudenza-pubblicata_it.html
- https://www.vatican.va/roman_curia/tribunals/apost_signat/documents/CONSPECTUS_DECISIONUM_I.pdf
- https://www.vatican.va/roman_curia/tribunals/apost_signat/index.htm

Strategia di acquisizione: partire dal Conspectus come indice controllato; per ogni decisione registrare identificatore, protocollo/citazione, data, settore, tipo di decisione, fonte di pubblicazione e canoni richiamati. Acquisire il testo soltanto quando ufficialmente disponibile e compatibile con la pubblicazione interna.

### 2. Tribunale della Rota Romana

Fonte istituzionale: https://www.rotaromana.va/

Il corpus deve essere centrato sulla decisione, non sul semplice documento. La struttura minima deve conservare: causa anonimizzata, turnus/collegio, ponens, data, dubium, capo o materia della causa, dispositivo, locus di pubblicazione e canoni rilevanti.

Le pubblicazioni storiche delle `Sacrae Romanae Rotae Decisiones` e gli eventuali repertori ufficiali devono essere trattati come fonti documentali distinte dalle singole decisioni estratte.

### 3. Tribunali ecclesiastici italiani

Seconda fase. Si acquisiscono esclusivamente decisioni o massime rese pubbliche da fonti istituzionali o raccolte scientifiche verificabili e utilizzabili. Va sempre registrato lo stato di anonimizzazione e di pubblicazione. Nessun dato personale processuale deve essere ricostruito o inferito.

### 4. Giurisprudenza civile rilevante

Terza fase, limitata ai punti di contatto con il diritto canonico e il diritto ecclesiastico italiano: effetti civili del matrimonio canonico, delibazione/riconoscimento, enti ecclesiastici, rapporti patrimoniali e altre materie direttamente pertinenti. Deve rimanere chiaramente distinta dalla giurisprudenza canonica.

## Modello della decisione

La decisione è identificata indipendentemente dalla copia documentale. I campi fondamentali sono:

`decisionId → tribunal → tribunalLevel → decisionType → decisionDate → protocolNumber / officialCitation → causeType → caseLabel anonimizzato → ponens / panel → publicationStatus → privacyStatus → sourceDocument → dubium → proceduralOutcome → dispositive → ratioSummary → holdings → relatedCanons → relatedConcepts`.

Le `holdings` sono proposizioni editoriali estratte dalla decisione. Ogni proposizione conserva la propria funzione (interpretazione, applicazione, criterio probatorio, criterio processuale, distinzione), i canoni collegati e lo stato di verifica. Non sono norme e non vanno presentate come massime vincolanti.

## Corpus pastorale — priorità

### 1. Santa Sede / Dicasteri

Le pagine ufficiali dei Dicasteri raccolgono direttori, orientamenti, note, lettere, istruzioni e documenti applicativi. La classificazione deve dipendere dalla natura concreta dell'atto e non dal solo titolo “istruzione” o “direttorio”, perché alcuni documenti possono avere anche funzione normativa o applicativa.

Fonti iniziali:
- Dicastero per i Vescovi: https://www.vatican.va/content/romancuria/it/dicasteri/dicastero-vescovi/documenti.html
- Dicastero per il Clero: https://www.vatican.va/content/romancuria/it/dicasteri/dicastero-clero/documenti.html
- Dicastero per il Culto Divino: https://www.vatican.va/content/romancuria/it/dicasteri/dicastero-culto-divino-e-disciplina-sacramenti/documenti.html
- altri Dicasteri da integrare per materia.

### 2. Conferenza Episcopale Italiana

Fonte prioritaria: Ufficio nazionale per i problemi giuridici e sezioni tematiche CEI. Per il matrimonio sono già individuabili documenti di indirizzo pastorale relativi a matrimoni misti, cattolici-musulmani e orientali non cattolici.

URL iniziale:
- https://giuridico.chiesacattolica.it/matrimonio/
- https://repertoriogiuridico.chiesacattolica.it/

Il Repertorio giuridico CEI è utile anche per il diritto particolare regionale e diocesano; gli atti normativi devono tuttavia restare nel corpus normativo, mentre orientamenti e vademecum vanno qualificati nel corpus pastorale.

## Regole editoriali comuni

1. Fonte ufficiale prima di fonte secondaria.
2. Snapshot e SHA-256 per ogni testo acquisito quando tecnicamente possibile.
3. Entità documentale distinta dall'entità giuridica/editoriale.
4. Nessuna qualificazione automatica di forza normativa.
5. Nessuna decisione giurisprudenziale presentata automaticamente come precedente vincolante.
6. Dati personali processuali: solo quanto pubblicato legittimamente; preferenza per materiale già anonimizzato; possibilità di scheda `metadataOnly` o `restricted`.
7. Collegamenti ai canoni e alle materie verificati separatamente dal testo sorgente.
8. Ricerca futura: partire da canone, materia, tribunale/autorità, data e tipo di documento/decisione.

## Prima tranche operativa

- rendere compilabili in Sanity `pastoralDocument` e `jurisprudentialDecision`;
- estendere `legalRelation` ai due nuovi tipi senza confonderne l'autorità con quella normativa;
- costruire un dataset pilota piccolo ma altamente verificato;
- pilot giurisprudenziale: Segnatura Apostolica, perché dispone di un repertorio ufficiale strutturato;
- pilot pastorale: matrimonio in Italia, sfruttando le fonti CEI già individuate;
- solo dopo il read-back del pilot estendere importatori e interfacce web.