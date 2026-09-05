import {defineField, defineType} from 'sanity'

export const sourceDocumentType = defineType({
  name: 'sourceDocument', title: 'Fonte documentale', type: 'document',
  fields: [
    defineField({name: 'documentId', title: 'Identificatore canonico', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'title', title: 'Titolo', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'shortTitle', title: 'Titolo breve', type: 'string'}),
    defineField({name: 'documentType', title: 'Natura del documento', type: 'string', options: {list: [
      {title: 'Codice', value: 'code'}, {title: 'Costituzione apostolica', value: 'apostolicConstitution'}, {title: 'Motu proprio', value: 'motuProprio'},
      {title: 'Legge', value: 'law'}, {title: 'Decreto', value: 'decree'}, {title: 'Istruzione', value: 'instruction'}, {title: 'Rescritto', value: 'rescript'},
      {title: 'Interpretazione autentica', value: 'authenticInterpretation'}, {title: 'Delibera', value: 'resolution'}, {title: 'Norma particolare', value: 'particularLaw'},
      {title: 'Documento pastorale', value: 'pastoralDocument'}, {title: 'Decisione giurisprudenziale', value: 'judicialDecision'}, {title: 'Altro', value: 'other'},
    ]}, validation: (Rule) => Rule.required()}),
    defineField({name: 'issuer', title: 'Autorità emanante / organismo', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'issuedAt', title: 'Data di emanazione', type: 'date'}),
    defineField({name: 'promulgatedAt', title: 'Data di promulgazione', type: 'date'}),
    defineField({name: 'publishedAt', title: 'Data di pubblicazione', type: 'date'}),
    defineField({name: 'publicationReference', title: 'Riferimento di pubblicazione', type: 'string'}),
    defineField({name: 'effectiveFrom', title: 'Entrata in vigore', type: 'date'}),
    defineField({name: 'effectiveUntil', title: 'Cessazione efficacia', type: 'date'}),
    defineField({name: 'territorialScope', title: 'Ambito territoriale', type: 'string', initialValue: 'universal', options: {list: [
      {title: 'Universale', value: 'universal'}, {title: 'Italia', value: 'italy'}, {title: 'Particolare / locale', value: 'particular'}, {title: 'Altro', value: 'other'},
    ]}, validation: (Rule) => Rule.required()}),
    defineField({name: 'legalForce', title: 'Valore / funzione', type: 'string', options: {list: [
      {title: 'Normativo', value: 'normative'}, {title: 'Interpretativo', value: 'interpretative'}, {title: 'Applicativo', value: 'applicative'},
      {title: 'Pastorale', value: 'pastoral'}, {title: 'Prassi / giurisprudenza', value: 'practice'},
    ]}}),
    defineField({name: 'status', title: 'Stato', type: 'string', initialValue: 'inForce', options: {list: [
      {title: 'Vigente', value: 'inForce'}, {title: 'Modificato', value: 'amended'}, {title: 'Abrogato', value: 'repealed'}, {title: 'Storico', value: 'historical'}, {title: 'Non determinato', value: 'undetermined'},
    ]}, validation: (Rule) => Rule.required()}),
    defineField({name: 'language', title: 'Lingua', type: 'string', options: {list: [{title: 'Latino', value: 'la'}, {title: 'Italiano', value: 'it'}, {title: 'Altra', value: 'other'}]}, validation: (Rule) => Rule.required()}),
    defineField({name: 'officialCitation', title: 'Citazione ufficiale', type: 'string'}),
    defineField({name: 'officialUrl', title: 'URL ufficiale', type: 'url', validation: (Rule) => Rule.required()}),
    defineField({name: 'sourceText', title: 'Testo della fonte', type: 'text', rows: 12}),
    defineField({name: 'snapshot', title: 'Snapshot sorgente', type: 'object', fields: [
      defineField({name: 'sourceUrl', title: 'URL acquisito', type: 'url'}), defineField({name: 'capturedAt', title: 'Acquisito il', type: 'datetime'}),
      defineField({name: 'sha256', title: 'SHA-256', type: 'string', validation: (Rule) => Rule.regex(/^[a-f0-9]{64}$/).error('SHA-256 non valido')}),
      defineField({name: 'path', title: 'Percorso snapshot nel repository', type: 'string'}),
    ]}),
    defineField({name: 'canonicalDataVersion', title: 'Versione canonical JSON', type: 'string'}),
    defineField({name: 'notes', title: 'Note editoriali', type: 'text', rows: 4}),
  ],
  preview: {select: {title: 'title', documentType: 'documentType', issuer: 'issuer', status: 'status'}, prepare({title, documentType, issuer, status}) {return {title, subtitle: `${documentType ?? 'Fonte'} · ${issuer ?? ''} · ${status ?? ''}`}}},
})