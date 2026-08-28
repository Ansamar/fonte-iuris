import {defineField, defineType} from 'sanity'

export const bibliographicItemType = defineType({
  name: 'bibliographicItem',
  title: 'Voce bibliografica',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'authors',
      title: 'Autore/i',
      type: 'array',
      of: [{type: 'string'}],
    }),

    defineField({
      name: 'publicationType',
      title: 'Tipo di pubblicazione',
      type: 'string',
      options: {
        list: [
          {title: 'Monografia', value: 'book'},
          {title: 'Commentario', value: 'commentary'},
          {title: 'Articolo', value: 'article'},
          {title: 'Capitolo di libro', value: 'bookChapter'},
          {title: 'Voce enciclopedica', value: 'encyclopedia'},
          {title: 'Tesi / dissertazione', value: 'thesis'},
          {title: 'Altro', value: 'other'},
        ],
      },
    }),

    defineField({
      name: 'year',
      title: 'Anno',
      type: 'number',
    }),

    defineField({
      name: 'publisher',
      title: 'Editore',
      type: 'string',
    }),

    defineField({
      name: 'citation',
      title: 'Citazione bibliografica completa',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'relatedCanons',
      title: 'Canoni collegati',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'canon'}]}],
    }),

    defineField({
      name: 'relatedConcepts',
      title: 'Concetti giuridici collegati',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'legalConcept'}]}],
    }),

    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
    }),

    defineField({
      name: 'notes',
      title: 'Note editoriali',
      type: 'text',
      rows: 4,
    }),
  ],

  preview: {
    select: {
      title: 'title',
      authors: 'authors',
      year: 'year',
    },

    prepare({title, authors, year}) {
      const author = authors?.length ? authors.join(', ') : 'Autore non indicato'

      return {
        title,
        subtitle: `${author}${year ? ` · ${year}` : ''}`,
      }
    },
  },
})