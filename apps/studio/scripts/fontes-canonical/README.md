# Fontes Iuris — canonical ETL

Pipeline obbligatoria per le fonti normative:

`fonte ufficiale → snapshot congelato → SHA-256 → canonical JSON → validazione → importer idempotente → Sanity → read-back`

## Separazione delle entità

- `sourceDocument`: identità documentale e prova della fonte ufficiale (URL, pubblicazione, snapshot, hash).
- `canonVersion`: testo del canone valido in un intervallo temporale.
- `legalRelation`: effetto giuridico verificato fra documento, canone, versione e segmento.
- `italianProvision`: norma/disposizione italiana distinta dal documento che la contiene.

## Regole

1. Non scrivere in Sanity prima che il canonical JSON sia valido.
2. Lo snapshot è immutabile; una nuova acquisizione produce un nuovo hash.
3. Un documento che modifica il testo di un canone deve produrre una nuova `canonVersion`; la sola `legalRelation` non basta.
4. `verified` indica verifica giuridica, non semplice validazione tecnica.
5. Gli ID devono essere deterministici e gli importer idempotenti.
6. Ogni import termina con read-back e confronto degli identificatori attesi.

## Canonical document contract (v1)

Campi minimi: `documentId`, `title`, `documentType`, `issuer`, `issuedAt`, `promulgatedAt`/`publishedAt` quando noti, `effectiveFrom` quando accertato, `officialUrl`, `language`, `territorialScope`, `status`, `snapshot`, `effects`.

Ogni `effect` identifica almeno `article`, `canon`, `effect` (`replaces`, `adds`, `amends`) e, quando necessario, `segment`.
