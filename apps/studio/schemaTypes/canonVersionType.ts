import {defineField, defineType} from 'sanity'

export const canonVersionType = defineType({
  name: 'canonVersion',
  title: 'Versione del canone',
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
      name: 'versionId',
      title: 'Identificatore della versione',
      type: 'string',
      description:
        'Identificatore tecnico stabile. Esempio: cic-1983-can-368-it-1983.',

      validation: (Rule) =>
        Rule.required().custom(async (value, context) => {
          if (!value) return true

          const normalized = value.trim()

          if (!/^cic-1983-can-\d+-(it|la)-[a-z0-9-]+$/.test(normalized)) {
            return 'Formato non valido. Esempio: cic-1983-can-368-it-1983'
          }

          const documentId = context.document?._id

          if (!documentId) return true

          const publishedId = documentId.replace(/^drafts\./, '')
          const draftId = `drafts.${publishedId}`

          const client = context
            .getClient({apiVersion: '2026-03-25'})
            .withConfig({perspective: 'drafts'})

          const duplicate = await client.fetch(
            `defined(*[
              _type == "canonVersion" &&
              versionId == $value &&
              !(_id in [$publishedId, $draftId])
            ][0]._id)`,
            {
              value: normalized,
              publishedId,
              draftId,
            },
          )

          return duplicate
            ? `L'identificatore "${normalized}" è già utilizzato da un'altra versione.`
            : true
        }),
    }),

    defineField({
      name: 'versionLabel',
      title: 'Etichetta della versione',
      type: 'string',
      description: 'Esempio: Testo originario 1983',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'status',
      title: 'Stato della versione',
      type: 'string',
      initialValue: 'current',
      options: {
        layout: 'radio',
        list: [
          {title: 'Vigente', value: 'current'},
          {title: 'Precedente', value: 'superseded'},
          {title: 'Storica', value: 'historical'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'validFrom',
      title: 'Valida dal',
      type: 'date',
    }),

    defineField({
      name: 'validUntil',
      title: 'Valida fino al',
      type: 'date',
    }),

    defineField({
      name: 'language',
      title: 'Lingua',
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
      name: 'fullText',
      title: 'Testo completo',
      type: 'array',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'sourceDocument',
      title: 'Fonte normativa',
      type: 'reference',
      to: [{type: 'sourceDocument'}],
      description:
        'Documento normativo dal quale deriva questa versione del canone.',
    }),

    defineField({
      name: 'sourceTitle',
      title: 'Fonte della versione',
      type: 'string',
      description:
        'Campo temporaneo. Sarà sostituito dal collegamento alla Fonte normativa.',
    }),

    defineField({
      name: 'sourceCitation',
      title: 'Citazione ufficiale',
      type: 'string',
    }),

    defineField({
      name: 'sourceUrl',
      title: 'URL della fonte ufficiale',
      type: 'url',
    }),

    defineField({
      name: 'changeSummary',
      title: 'Sintesi della modifica',
      type: 'text',
      rows: 4,
      description:
        'Compilare quando questa versione modifica o sostituisce una versione precedente.',
    }),

    defineField({
      name: 'previousVersion',
      title: 'Versione precedente',
      type: 'reference',
      to: [{type: 'canonVersion'}],
    }),
  ],

  orderings: [
    {
      title: 'Canone',
      name: 'canonNumber',
      by: [
        {field: 'canon.number', direction: 'asc'},
        {field: 'validFrom', direction: 'asc'},
      ],
    },
  ],

  preview: {
    select: {
      canonNumber: 'canon.number',
      versionLabel: 'versionLabel',
      status: 'status',
      language: 'language',
      versionId: 'versionId',
    },

    prepare({
      canonNumber,
      versionLabel,
      status,
      language,
      versionId,
    }) {
      const statusLabels: Record<string, string> = {
        current: 'Vigente',
        superseded: 'Precedente',
        historical: 'Storica',
      }

      const languageLabels: Record<string, string> = {
        it: 'Italiano',
        la: 'Latino',
      }

      const statusLabel = statusLabels[status] ?? status
      const languageLabel = languageLabels[language] ?? language

      return {
        title: canonNumber
          ? `Can. ${canonNumber} — ${versionLabel}`
          : versionLabel,
        subtitle: versionId
          ? `${statusLabel} · ${languageLabel} · ${versionId}`
          : `${statusLabel} · ${languageLabel}`,
      }
    },
  },
})