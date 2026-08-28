import {defineField, defineType} from 'sanity'

export const legalConceptType = defineType({
  name: 'legalConcept',
  title: 'Concetto giuridico',
  type: 'document',

  fields: [
    defineField({
      name: 'label',
      title: 'Denominazione',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'label', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'definition',
      title: 'Definizione',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'synonyms',
      title: 'Sinonimi / termini collegati',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),

    defineField({
      name: 'relatedCanons',
      title: 'Canoni collegati',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'canon'}],
        },
      ],
    }),

    defineField({
      name: 'relatedSegments',
      title: 'Segmenti collegati',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'canonSegment'}],
        },
      ],
    }),

    defineField({
      name: 'broaderConcept',
      title: 'Concetto superiore',
      type: 'reference',
      to: [{type: 'legalConcept'}],
      description: 'Facoltativo. Esempio: Diocesi → Chiesa particolare.',
    }),

    defineField({
      name: 'notes',
      title: 'Note',
      type: 'array',
      of: [{type: 'block'}],
    }),
  ],

  preview: {
    select: {
      title: 'label',
      subtitle: 'definition',
    },
  },
})