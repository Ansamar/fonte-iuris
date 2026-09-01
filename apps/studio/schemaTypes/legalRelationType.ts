import {defineField, defineType} from 'sanity'

const endpoint = (name: string, title: string) => defineField({
  name, title, type: 'reference',
  to: [{type: 'canon'}, {type: 'canonVersion'}, {type: 'canonSegment'}, {type: 'sourceDocument'}, {type: 'italianProvision'}],
  validation: (Rule) => Rule.required(),
})

export const legalRelationType = defineType({
  name: 'legalRelation', title: 'Relazione giuridica', type: 'document',
  fields: [
    defineField({name: 'relationId', title: 'Identificatore relazione', type: 'string', validation: (Rule) => Rule.required()}),
    endpoint('source', 'Soggetto / fonte di partenza'),
    endpoint('target', 'Oggetto / destinazione'),
    defineField({name: 'relationType', title: 'Tipo di relazione', type: 'string', options: {list: [
      {title: 'Attua', value: 'implements'}, {title: 'Determina', value: 'determines'}, {title: 'Specifica', value: 'specifies'},
      {title: 'Integra', value: 'integrates'}, {title: 'Deroga', value: 'derogates'}, {title: 'Sostituisce', value: 'replaces'},
      {title: 'Abroga', value: 'repeals'}, {title: 'Rinvia a', value: 'refersTo'}, {title: 'Presuppone', value: 'presupposes'},
      {title: 'Applica in Italia', value: 'appliesInItaly'}, {title: 'Interpreta', value: 'interprets'}, {title: 'Regola procedura', value: 'regulatesProcedure'},
      {title: 'Modifica il testo', value: 'amendsText'}, {title: 'Concordanza', value: 'concordance'}, {title: 'Eccezione', value: 'exception'},
    ]}, validation: (Rule) => Rule.required()}),
    defineField({name: 'authorityLevel', title: 'Origine della relazione', type: 'string', options: {list: [
      {title: 'Ufficiale / normativa', value: 'official'}, {title: 'Editoriale verificata', value: 'editorial'}, {title: 'Suggerimento algoritmico', value: 'algorithmic'},
    ]}, validation: (Rule) => Rule.required()}),
    defineField({name: 'validFrom', title: 'Relazione valida dal', type: 'date'}),
    defineField({name: 'validUntil', title: 'Relazione valida fino al', type: 'date'}),
    defineField({name: 'sourceDocument', title: 'Documento che prova/fonda la relazione', type: 'reference', to: [{type: 'sourceDocument'}]}),
    defineField({name: 'officialCitation', title: 'Citazione / locus della relazione', type: 'string'}),
    defineField({name: 'note', title: 'Nota giuridico-editoriale', type: 'text', rows: 4}),
    defineField({name: 'verified', title: 'Verifica giuridica completata', type: 'boolean', initialValue: false}),
  ],
  preview: {select: {relationId: 'relationId', relationType: 'relationType', authorityLevel: 'authorityLevel'}, prepare({relationId, relationType, authorityLevel}) {return {title: relationId ?? 'Relazione giuridica', subtitle: `${relationType ?? ''} · ${authorityLevel ?? ''}`}}},
})
