import {defineField, defineType} from 'sanity'

export const canonType = defineType({
  name: 'canon',
  title: 'Canone',
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
      name: 'number',
      title: 'Numero del canone',
      type: 'number',
      validation: (Rule) =>
        Rule.required()
          .integer()
          .min(1)
          .max(1752)
          .custom(async (value, context) => {
            if (typeof value !== 'number') return true

            const documentId = context.document?._id
            const corpusRef = context.document?.corpus?._ref

            if (!documentId || !corpusRef) return true

            const publishedId = documentId.replace(/^drafts\./, '')
            const draftId = `drafts.${publishedId}`

            const client = context.getClient({
              apiVersion: '2026-03-25',
            })

            const duplicate = await client.fetch(
              `defined(*[
                _type == "canon" &&
                number == $value &&
                corpus._ref == $corpusRef &&
                !(_id in [$publishedId, $draftId])
              ][0]._id)`,
              {
                value,
                corpusRef,
                publishedId,
                draftId,
              },
            )

            return duplicate
              ? `Il Can. ${value} esiste già in questo corpus.`
              : true
          }),
    }),

    defineField({
      name: 'canonicalId',
      title: 'Identificatore canonico',
      type: 'string',
      description:
        'Identificatore tecnico stabile. Esempio: cic-1983-can-368',

      validation: (Rule) =>
        Rule.required()
          .regex(/^cic-1983-can-\d+$/, {
            name: 'ID canonico CIC',
          })
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
                _type == "canon" &&
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
              ? `L'identificatore "${value}" è già utilizzato da un altro canone.`
              : true
          }),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc) =>
          typeof doc.number === 'number' ? `can-${doc.number}` : '',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'structuralUnit',
      title: 'Collocazione sistematica',
      type: 'reference',
      to: [{type: 'structuralUnit'}],
      description:
        'Seleziona l’unità strutturale più specifica nella quale si trova il canone.',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'status',
      title: 'Stato del canone',
      type: 'string',
      initialValue: 'inForce',
      options: {
        layout: 'radio',
        list: [
          {title: 'Vigente', value: 'inForce'},
          {title: 'Modificato', value: 'amended'},
          {title: 'Abrogato', value: 'repealed'},
          {title: 'Storico', value: 'historical'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'editorialTitle',
      title: 'Titolo editoriale',
      type: 'string',
      description:
        'Titolo redazionale per facilitare studio e ricerca. Non appartiene al testo ufficiale del CIC.',
    }),

    defineField({
      name: 'keywords',
      title: 'Parole chiave',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description:
        'Termini utili alla ricerca. Sono distinti dai concetti giuridici controllati.',
    }),
  ],

  orderings: [
    {
      title: 'Numero del canone',
      name: 'canonNumber',
      by: [{field: 'number', direction: 'asc'}],
    },
  ],

  preview: {
    select: {
      number: 'number',
      editorialTitle: 'editorialTitle',
      status: 'status',
    },

    prepare({number, editorialTitle, status}) {
      const statusLabels: Record<string, string> = {
        inForce: 'Vigente',
        amended: 'Modificato',
        repealed: 'Abrogato',
        historical: 'Storico',
      }

      const statusLabel = statusLabels[status] ?? status

      return {
        title: `Can. ${number}`,
        subtitle: editorialTitle
          ? `${editorialTitle} · ${statusLabel}`
          : statusLabel,
      }
    },
  },
})