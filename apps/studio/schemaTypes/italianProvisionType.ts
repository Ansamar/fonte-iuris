import {defineField, defineType} from 'sanity'

export const italianProvisionType = defineType({
  name: 'italianProvision', title: 'Norma / disposizione italiana', type: 'document',
  fields: [
    defineField({name: 'provisionId', title: 'Identificatore della norma', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'title', title: 'Titolo', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'provisionType', title: 'Tipo di disposizione', type: 'string', options: {list: [
      {title: 'Delibera CEI', value: 'ceiResolution'}, {title: 'Decreto CEI', value: 'ceiDecree'}, {title: 'Istruzione CEI', value: 'ceiInstruction'},
      {title: 'Decreto generale', value: 'generalDecree'}, {title: 'Norma particolare', value: 'particularLaw'}, {title: 'Disposizione applicativa', value: 'implementingProvision'},
      {title: 'Accordo / Intesa', value: 'agreement'}, {title: 'Documento pastorale', value: 'pastoralDocument'}, {title: 'Prassi', value: 'practice'}, {title: 'Altro', value: 'other'},
    ]}, validation: (Rule) => Rule.required()}),
    defineField({name: 'issuer', title: 'Autorità competente', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'territorialScope', title: 'Ambito di applicazione', type: 'string', initialValue: 'italy', options: {list: [
      {title: 'Italia', value: 'italy'}, {title: 'Regione ecclesiastica', value: 'ecclesiasticalRegion'}, {title: 'Diocesi', value: 'diocese'}, {title: 'Altro ambito particolare', value: 'particular'},
    ]}, validation: (Rule) => Rule.required()}),
    defineField({name: 'legalForce', title: 'Valore giuridico', type: 'string', options: {list: [
      {title: 'Normativo', value: 'normative'}, {title: 'Interpretativo', value: 'interpretative'}, {title: 'Applicativo', value: 'applicative'}, {title: 'Pastorale', value: 'pastoral'}, {title: 'Prassi', value: 'practice'},
    ]}, validation: (Rule) => Rule.required()}),
    defineField({name: 'effectiveFrom', title: 'Efficace dal', type: 'date'}),
    defineField({name: 'effectiveUntil', title: 'Efficace fino al', type: 'date'}),
    defineField({name: 'status', title: 'Stato', type: 'string', initialValue: 'inForce', options: {list: [
      {title: 'Vigente', value: 'inForce'}, {title: 'Modificata', value: 'amended'}, {title: 'Abrogata', value: 'repealed'}, {title: 'Storica', value: 'historical'}, {title: 'Non determinato', value: 'undetermined'},
    ]}, validation: (Rule) => Rule.required()}),
    defineField({name: 'sourceDocument', title: 'Fonte documentale', type: 'reference', to: [{type: 'sourceDocument'}], validation: (Rule) => Rule.required(), description: 'La fonte conserva testo ufficiale, URL, pubblicazione e snapshot. Questa entità rappresenta invece la norma/disposizione ricavata dalla fonte.'}),
    defineField({name: 'parentProvision', title: 'Norma superiore / contenitore', type: 'reference', to: [{type: 'italianProvision'}]}),
    defineField({name: 'provisionLocator', title: 'Partizione / articolo / numero', type: 'string'}),
    defineField({name: 'normativeText', title: 'Testo della disposizione', type: 'array', of: [{type: 'block'}]}),
    defineField({name: 'summary', title: 'Sintesi editoriale', type: 'text', rows: 4}),
    defineField({name: 'legalVerification', title: 'Stato verifica giuridica', type: 'string', initialValue: 'pending', options: {list: [
      {title: 'Da verificare', value: 'pending'}, {title: 'Verificata', value: 'verified'}, {title: 'Da riesaminare', value: 'review'},
    ]}, validation: (Rule) => Rule.required()}),
    defineField({name: 'notes', title: 'Note editoriali', type: 'array', of: [{type: 'block'}]}),
  ],
  preview: {select: {title: 'title', issuer: 'issuer', legalForce: 'legalForce', status: 'status'}, prepare({title, issuer, legalForce, status}) {return {title, subtitle: `${issuer ?? ''} · ${legalForce ?? ''} · ${status ?? ''}`}}},
})
