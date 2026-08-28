import {defineField, defineType} from 'sanity'

export const annotationType = defineType({
  name: 'annotation',
  title: 'Annotazione',
  type: 'document',

  fields: [
    defineField({
      name: 'annotationType',
      title: 'Tipo',
      type: 'string',
      options: {
        list: [
          {title: 'Sintesi', value: 'summary'},
          {title: 'Approfondimento', value: 'deepDive'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'canon',
      title: 'Canone',
      type: 'reference',
      to: [{type: 'canon'}],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'segment',
      title: 'Segmento del canone',
      type: 'reference',
      to: [{type: 'canonSegment'}],
      description: 'Lascia vuoto se la nota riguarda l’intero canone.',
    }),

    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'content',
      title: 'Contenuto',
      type: 'array',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'status',
      title: 'Stato editoriale',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: [
          {title: 'Bozza', value: 'draft'},
          {title: 'Revisionata', value: 'reviewed'},
          {title: 'Pubblicabile', value: 'ready'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      type: 'annotationType',
      canonNumber: 'canon.number',
    },

    prepare({title, type, canonNumber}) {
      return {
        title,
        subtitle: `Can. ${canonNumber} · ${
          type === 'summary' ? 'Sintesi' : 'Approfondimento'
        }`,
      }
    },
  },
})