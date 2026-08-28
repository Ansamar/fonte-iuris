import {defineField, defineType} from 'sanity'

export const canonSegmentType = defineType({
  name: 'canonSegment',
  title: 'Segmento del canone',
  type: 'document',

  fields: [
    defineField({
      name: 'canon',
      title: 'Canone',
      type: 'reference',
      to: [{type: 'canon'}],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'version',
      title: 'Versione del canone',
      type: 'reference',
      to: [{type: 'canonVersion'}],

      options: {
        filter: ({document}) => {
          const canonRef = document?.canon?._ref

          if (!canonRef) {
            return {filter: '_id == ""'}
          }

          return {
            filter: 'canon._ref == $canonRef',
            params: {canonRef},
          }
        },
      },

      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'segmentType',
      title: 'Tipo di segmento',
      type: 'string',
      options: {
        list: [
          {title: 'Paragrafo (§)', value: 'paragraph'},
          {title: 'Numero', value: 'number'},
          {title: 'Lettera', value: 'letter'},
          {title: 'Proposizione', value: 'clause'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'segmentId',
      title: 'Identificatore stabile',
      type: 'string',
      description:
        'Identificatore stabile del segmento all’interno della versione. Esempi: can-1095-n2, can-522-p1, can-522-p1-clause-2.',

      validation: (Rule) =>
        Rule.required().custom(async (value, context) => {
          if (!value) return true

          const documentId = context.document?._id
          const versionRef = context.document?.version?._ref

          if (!documentId || !versionRef) {
            return true
          }

          const publishedId = documentId.replace(/^drafts\./, '')
          const draftId = `drafts.${publishedId}`

          const client = context
            .getClient({apiVersion: '2026-03-25'})
            .withConfig({perspective: 'drafts'})

          const duplicate = await client.fetch(
            `defined(*[
              _type == "canonSegment" &&
              segmentId == $value &&
              version._ref == $versionRef &&
              !(_id in [$publishedId, $draftId])
            ][0]._id)`,
            {
              value,
              versionRef,
              publishedId,
              draftId,
            },
          )

          return duplicate
            ? `L'identificatore "${value}" è già utilizzato in questa versione del canone.`
            : true
        }),
    }),

    defineField({
      name: 'label',
      title: 'Etichetta',
      type: 'string',
      description: 'Esempi: § 1, 2°, a), proposizione 2',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'parentSegment',
      title: 'Segmento superiore',
      type: 'reference',
      to: [{type: 'canonSegment'}],
      description:
        'Facoltativo. Esempio: un numero può appartenere a un §.',

      options: {
        filter: ({document}) => {
          const canonRef = document?.canon?._ref
          const versionRef = document?.version?._ref
          const rawId = document?._id

          const currentId =
            typeof rawId === 'string'
              ? rawId.replace(/^drafts\./, '')
              : ''

          if (!canonRef || !versionRef) {
            return {filter: '_id == ""'}
          }

          if (!currentId) {
            return {
              filter:
                'canon._ref == $canonRef && version._ref == $versionRef',
              params: {
                canonRef,
                versionRef,
              },
            }
          }

          return {
            filter: `
              canon._ref == $canonRef &&
              version._ref == $versionRef &&
              _id != $currentId &&
              _id != $draftId
            `,
            params: {
              canonRef,
              versionRef,
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
        'Ordine del segmento all’interno del canone o del segmento superiore.',
      validation: (Rule) => Rule.required().integer().min(0),
    }),

    defineField({
      name: 'startOffset',
      title: 'Offset iniziale',
      type: 'number',
      description:
        'Posizione iniziale del segmento nel testo normalizzato della versione del canone.',
      validation: (Rule) => Rule.integer().min(0),
    }),

    defineField({
      name: 'endOffset',
      title: 'Offset finale',
      type: 'number',
      description:
        'Posizione finale del segmento nel testo normalizzato della versione del canone.',

      validation: (Rule) =>
        Rule.integer()
          .min(0)
          .custom((endOffset, context) => {
            const startOffset = context.document?.startOffset

            if (
              typeof endOffset === 'number' &&
              typeof startOffset === 'number' &&
              endOffset < startOffset
            ) {
              return "L'offset finale non può essere inferiore all'offset iniziale."
            }

            return true
          }),
    }),

    defineField({
      name: 'isFormalDivision',
      title: 'Suddivisione formale della norma',
      type: 'boolean',
      initialValue: true,
      description:
        'Attivo per §, numeri e lettere presenti nel testo normativo. Disattivo per proposizioni create editorialmente.',
    }),
  ],

  orderings: [
    {
      title: 'Ordine nel canone',
      name: 'segmentOrder',
      by: [
        {field: 'canon.number', direction: 'asc'},
        {field: 'order', direction: 'asc'},
      ],
    },
  ],

  preview: {
    select: {
      canonNumber: 'canon.number',
      label: 'label',
      segmentType: 'segmentType',
    },

    prepare({canonNumber, label, segmentType}) {
      const labels: Record<string, string> = {
        paragraph: 'Paragrafo',
        number: 'Numero',
        letter: 'Lettera',
        clause: 'Proposizione editoriale',
      }

      return {
        title: `Can. ${canonNumber} — ${label}`,
        subtitle: labels[segmentType] ?? segmentType,
      }
    },
  },
})