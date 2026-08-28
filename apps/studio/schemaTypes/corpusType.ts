import {defineField, defineType} from 'sanity'

export const corpusType = defineType({
  name: 'corpus',
  title: 'Corpus normativo',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'shortTitle',
      title: 'Titolo breve',
      type: 'string',
      description: 'Esempio: CIC 1983',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'shortTitle',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'code',
      title: 'Codice identificativo',
      type: 'string',
      description: 'Identificatore stabile interno, es. cic-1983',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'language',
      title: 'Lingua principale',
      type: 'string',
      initialValue: 'it',
      options: {
        list: [
          {title: 'Italiano', value: 'it'},
          {title: 'Latino', value: 'la'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'originalLanguage',
      title: 'Lingua del testo autentico',
      type: 'string',
      initialValue: 'la',
      options: {
        list: [
          {title: 'Latino', value: 'la'},
          {title: 'Italiano', value: 'it'},
        ],
      },
    }),

    defineField({
      name: 'promulgatedAt',
      title: 'Data di promulgazione',
      type: 'date',
    }),

    defineField({
      name: 'effectiveFrom',
      title: 'Entrata in vigore',
      type: 'date',
    }),

    defineField({
      name: 'promulgationReference',
      title: 'Riferimento di promulgazione',
      type: 'string',
    }),

    defineField({
      name: 'description',
      title: 'Descrizione',
      type: 'text',
      rows: 4,
    }),

    defineField({
      name: 'status',
      title: 'Stato',
      type: 'string',
      initialValue: 'active',
      options: {
        layout: 'radio',
        list: [
          {title: 'Attivo', value: 'active'},
          {title: 'Storico', value: 'historical'},
          {title: 'Archivio', value: 'archived'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      title: 'shortTitle',
      subtitle: 'title',
    },
  },
})