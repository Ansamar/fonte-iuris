import {defineField, defineType} from 'sanity'

export const legalRelationType = defineType({
  name: 'legalRelation',
  title: 'Relazione giuridica',
  type: 'document',

  fields: [
    defineField({
      name: 'sourceCanon',
      title: 'Canone di partenza',
      type: 'reference',
      to: [{type: 'canon'}],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'sourceSegment',
      title: 'Segmento di partenza',
      type: 'reference',
      to: [{type: 'canonSegment'}],
    }),

    defineField({
      name: 'targetCanon',
      title: 'Canone collegato',
      type: 'reference',
      to: [{type: 'canon'}],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'targetSegment',
      title: 'Segmento collegato',
      type: 'reference',
      to: [{type: 'canonSegment'}],
    }),

    defineField({
      name: 'relationType',
      title: 'Tipo di relazione',
      type: 'string',
      options: {
        list: [
          {title: 'Concordanza', value: 'concordance'},
          {title: 'Rinvio normativo', value: 'crossReference'},
          {title: 'Integrazione', value: 'integration'},
          {title: 'Eccezione', value: 'exception'},
          {title: 'Deroga', value: 'derogation'},
          {title: 'Interpretazione', value: 'interpretation'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'authorityLevel',
      title: 'Origine della relazione',
      type: 'string',
      options: {
        list: [
          {title: 'Ufficiale / normativa', value: 'official'},
          {title: 'Editoriale verificata', value: 'editorial'},
          {title: 'Suggerimento algoritmico', value: 'algorithmic'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'note',
      title: 'Nota',
      type: 'text',
      rows: 4,
    }),
  ],

  preview: {
    select: {
      source: 'sourceCanon.number',
      target: 'targetCanon.number',
      relationType: 'relationType',
    },

    prepare({source, target, relationType}) {
      return {
        title: `Can. ${source} → Can. ${target}`,
        subtitle: relationType,
      }
    },
  },
})