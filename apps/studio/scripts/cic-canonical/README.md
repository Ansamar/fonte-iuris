# CIC canonical TXT pipeline

Nuova pipeline isolata dalla pipeline HTML esistente.

## Principio

`source TXT -> canonical JSON -> validation -> Sanity writer -> read-back`

La sorgente testuale e la struttura giuridica sono fasi separate. Il writer Sanity non deve mai interpretare HTML o dedurre segmenti.

## Gate Libro VII

Prima di qualsiasi write Sanity il build del Libro VII deve verificare:

- range 1400-1752
- 353 canoni esatti
- nessun canone mancante o duplicato
- nessun testo vuoto
- segmentId unici per versione
- parentSegmentId esistenti
- regression test sui cann. 1405, 1422, 1423 e 1445
- zero errori

## Stato

Questa directory e' intenzionalmente indipendente da `scripts/import-cic`: finche' i gate non sono verdi non modifica la pipeline di produzione e non scrive nel dataset Sanity.
