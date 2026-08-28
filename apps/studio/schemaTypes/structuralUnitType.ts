import {defineField, defineType} from 'sanity'

export const structuralUnitType = defineType({
  name: 'structuralUnit',
  title: 'Unità strutturale',
  type: 'document',

  fields: [
    defineField({
      name: 'corpus',
      title: 'Corpus',
      type: 'reference',
      to: [{type: 'corpus'}],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'unitType',
      title: 'Tipo di unità',
      type: 'string',
      options: {
        list: [
          {title: 'Libro', value: 'book'},
          {title: 'Parte', value: 'part'},
          {title: 'Sezione', value: 'section'},
          {title: 'Titolo', value: 'title'},
          {title: 'Capitolo', value: 'chapter'},
          {title: 'Articolo', value: 'article'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'number',
      title: 'Numero',
      type: 'string',
      description: 'Esempi: I, II, III, 1, 2, 3',
    }),

    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'canonicalId',
      title: 'Identificatore strutturale',
      type: 'string',
      description:
        'Identificatore tecnico stabile. Esempio: cic-1983-book-2-part-2-section-2-title-1-chapter-1',

      validation: (Rule) =>
        Rule.required()
          .regex(
            /^cic-1983-(book|part|section|title|chapter|article)-[a-z0-9-]+$/,
            {
              name: 'Identificatore strutturale CIC',
            },
          )
          .custom(async (value, context) => {
            if (!value) return true

            const documentId = context.document?._id
            if (!documentId) return true

            const publishedId = documentId.replace(/^drafts\./, '')
            const draftId = `drafts.${publishedId}`

            const client = context.getClient({
              apiVersion: '2026-03-25',
            })

            const duplicate = await client.fetch(
              `defined(*[
                _type == "structuralUnit" &&
                canonicalId == $value &&
                !(_id in [$publishedId, $draftId])
              ][0]._id)`,
              {
                value,
                publishedId,
                draftId,
              },
            )

            return duplicate
              ? `L'identificatore "${value}" è già utilizzato da un'altra unità strutturale.`
              : true
          }),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'canonicalId',
        maxLength: 160,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'parent',
      title: 'Unità superiore',
      type: 'reference',
      to: [{type: 'structuralUnit'}],
      description:
        'Esempio: un Capitolo può avere come unità superiore un Titolo.',

      options: {
        filter: ({document}) => {
          const corpusRef = document?.corpus?._ref
          const rawId = document?._id

          const currentId =
            typeof rawId === 'string'
              ? rawId.replace(/^drafts\./, '')
              : ''

          if (!corpusRef) {
            return {
              filter: '_id == ""',
            }
          }

          if (!currentId) {
            return {
              filter: 'corpus._ref == $corpusRef',
              params: {corpusRef},
            }
          }

          return {
            filter: `
              corpus._ref == $corpusRef &&
              _id != $currentId &&
              _id != $draftId
            `,
            params: {
              corpusRef,
              currentId,
              draftId: `drafts.${currentId}`,
            },
          }
        },
      },
    }),

    defineField({
      name: 'order',
      title: 'Ordine',
      type: 'number',
      description:
        'Ordine dell’unità all’interno della propria unità superiore.',
      validation: (Rule) => Rule.required().integer().min(0),
    }),

    defineField({
      name: 'canonicalLabel',
      title: 'Etichetta canonica completa',
      type: 'string',
      description: 'Esempio: LIBRO II — IL POPOLO DI DIO',
    }),

    defineField({
      name: 'description',
      title: 'Introduzione editoriale',
      type: 'text',
      rows: 4,
      description:
        'Testo editoriale di presentazione. Non appartiene al testo normativo.',
    }),
  ],

  orderings: [
    {
      title: 'Ordine canonico',
      name: 'canonicalOrder',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],

  preview: {
    select: {
      title: 'title',
      unitType: 'unitType',
      number: 'number',
      canonicalId: 'canonicalId',
    },

    prepare({title, unitType, number, canonicalId}) {
      const labels: Record<string, string> = {
        book: 'Libro',
        part: 'Parte',
        section: 'Sezione',
        title: 'Titolo',
        chapter: 'Capitolo',
        article: 'Articolo',
      }

      const prefix = labels[unitType] ?? unitType

      return {
        title: number ? `${prefix} ${number} — ${title}` : title,
        subtitle: canonicalId || prefix,
      }
    },
  },
})