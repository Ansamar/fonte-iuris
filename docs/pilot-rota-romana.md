# Pilot Rota Romana — architettura e protocollo di acquisizione

## 1. Funzione istituzionale
La Rota Romana è ordinariamente tribunale superiore di appello presso la Sede Apostolica; tutela i diritti nella Chiesa, provvede all'unità della giurisprudenza e, mediante le proprie sentenze, offre orientamento ai tribunali inferiori. Il corpus Fonte Iuris non deve quindi modellare le decisioni rotali come precedenti vincolanti, ma come giurisprudenza qualificata con particolare funzione di unificazione e orientamento.

## 2. Fonte ufficiale primaria
Per il pilot la fonte primaria è l'edizione ufficiale `Rotae Romanae Tribunalis Decisiones seu Sententiae`, pubblicata a cura del Tribunale e dalla Libreria Editrice Vaticana. Il volume è un contenitore documentario; ogni sentenza/decreto estratto deve diventare una distinta `jurisprudentialDecision`.

Gerarchia delle fonti:
1. testo della singola decisione nell'edizione ufficiale `Decisiones seu Sententiae`;
2. eventuale `Decreta` ufficiale per i decreti;
3. metadati istituzionali Rota/Vaticano/LEV;
4. fonti scientifiche secondarie solo per confronto, bibliografia o reperimento, mai per sostituire silenziosamente il testo ufficiale.

## 3. Differenza rispetto alla Segnatura
La scheda rotale richiede dati specifici:
- grado di giudizio;
- causa pubblica/anonimizzata;
- `coram` / ponens;
- turnus o collegio;
- formula del dubium;
- uno o più `capita` della causa, ciascuno eventualmente associato a canone, parte ed esito;
- dispositivo complessivo;
- riferimenti all'edizione ufficiale (anno, volume, pagine, ISBN quando disponibile);
- holdings con localizzazione puntuale nel testo ufficiale.

Un `caput nullitatis` non coincide con un holding. Il primo descrive il titolo giuridico sul quale si giudica; il secondo è una proposizione giurisprudenziale estratta e verificata dal ragionamento della decisione.

## 4. Modello Fonte Iuris
Il tipo `jurisprudentialDecision` viene esteso senza creare un secondo tipo Rota-specifico. I nuovi campi sono opzionali e quindi non rompono il corpus della Segnatura:
- `instanceLevel`
- `rotalGrounds[]` (`label`, `canon`, `party`, `outcome`)
- `rotalPublication` (`year`, `volumeRoman`, `volumeArabic`, `pages`, `isbn`)
- `holding.paragraphOrPage`
- `holding.basis = officialRotalEdition`

Il `sourceDocument` resta il livello di provenienza/documentazione. La decisione resta l'entità giurisprudenziale interrogabile.

## 5. Pilot operativo
Il primo lotto deve essere piccolo: 5 decisioni ufficialmente pubblicate, preferibilmente post-CIC 1983 e matrimoniali, selezionate per coprire almeno tre nuclei tra:
- can. 1095 (incapacità consensuale);
- can. 1097 (errore);
- can. 1098 (dolo);
- can. 1101 §2 (simulazione/esclusione);
- can. 1103 (violenza/timore);
- questioni probatorie o processuali direttamente collegate.

La selezione definitiva avviene soltanto quando la singola decisione è identificabile nell'edizione ufficiale con dati sufficienti. Non si crea una scheda completa da una citazione dottrinale isolata.

## 6. Pipeline
`edizione ufficiale → identificazione decisione → snapshot/testo acquisibile → hash → canonical JSON → validazione → dry-run → import idempotente → read-back`

Per ogni decisione il canonical JSON deve distinguere:
- dati attestati direttamente dal testo/frontespizio/indice ufficiale;
- sintesi editoriale;
- holdings verificati con pagina o numero della decisione;
- riferimenti dottrinali secondari.

## 7. Regole di qualità
- Nessun nome di parte viene ricostruito se l'edizione è anonimizzata.
- Nessun `dubium`, `caput`, esito o ponens viene inferito da conoscenza generale.
- Nessun holding viene creato da una mera associazione canone-materia.
- `juridical-verified` richiede controllo della decisione o dell'edizione ufficiale pertinente.
- Se è disponibile solo il riferimento bibliografico ufficiale, usare `officialReference` e lasciare vuoti i campi analitici non sostenuti.
- Una decisione può avere più capita e risultati differenti: non appiattire tutto in un unico `proceduralOutcome`.

## 8. UX prevista
Percorso principale:
`Canone → decisioni rotali → causa/capita → principio giurisprudenziale → localizzazione nel testo → edizione ufficiale`.

La pagina della decisione dovrà mostrare distintamente:
1. identificazione (`coram`, data, grado, pubblicazione);
2. dubium;
3. capita e relativo esito;
4. ratio / holdings verificati;
5. canoni;
6. fonte ufficiale e apparato bibliografico.

## 9. Fonti istituzionali di riferimento
- Rota Romana, Profilo istituzionale: https://www.rotaromana.va/content/rotaromana/it/profilo.html
- Santa Sede, Tribunale della Rota Romana: https://www.vatican.va/content/romancuria/it/organismi-di-giustizia/tribunale-della-rota-romana/profilo.html
- Libreria Editrice Vaticana, collana `Decisiones seu Sententiae`: https://www.libreriaeditricevaticana.va/

## 10. Prossima lavorazione
Individuare nell'edizione ufficiale 5 decisioni post-1983 con testo/metadati sufficienti; solo allora creare `rota-romana-pilot.json` e l'importer canonico. La progettazione non autorizza l'invenzione di un lotto sulla base di citazioni secondarie.