import {defineField, defineType} from 'sanity'

export const italianProvisionType = defineType({
  name: 'italianProvision',
  title: 'Disposizione italiana',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'provisionType',
      title: 'Tipo di disposizione',
      type: 'string',
      options: {
        list: [
          {title: 'Delibera CEI', value: 'ceiResolution'},
          {title: 'Decreto CEI', value: 'ceiDecree'},
          {title: 'Istruzione CEI', value: 'ceiInstruction'},
          {title: 'Norma particolare', value: 'particularLaw'},
          {title: 'Accordo / Intesa', value: 'agreement'},
          {title: 'Altro', value: 'other'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'issuer',
      title: 'Autorità emanante',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'date',
      title: 'Data',
      type: 'date',
    }),

    defineField({
      name: 'effectiveFrom',
      title: 'Entrata in vigore',
      type: 'date',
    }),

    defineField({
      name: 'status',
      title: 'Stato',
      type: 'string',
      initialValue: 'inForce',
      options: {
        list: [
          {title: 'Vigente', value: 'inForce'},
          {title: 'Modificata', value: 'amended'},
          {title: 'Abrogata', value: 'repealed'},
          {title: 'Storica', value: 'historical'},
        ],
      },
      validation: (Rule) => Rule.required(),
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
      name: 'sourceDocument',
      title: 'Fonte normativa',
      type: 'reference',
      to: [{type: 'sourceDocument'}],
    }),

    defineField({
      name: 'officialCitation',
      title: 'Citazione ufficiale',
      type: 'string',
    }),

    defineField({
      name: 'officialUrl',
      title: 'URL ufficiale',
      type: 'url',
    }),

    defineField({
      name: 'summary',
      title: 'Sintesi',
      type: 'text',
      rows: 4,
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
      title: 'title',
      issuer: 'issuer',
      status: 'status',
    },

    prepare({title, issuer, status}) {
      const statusLabels: Record<string, string> = {
        inForce: 'Vigente',
        amended: 'Modificata',
        repealed: 'Abrogata',
        historical: 'Storica',
      }

      return {
        title,
        subtitle: `${issuer ?? ''} · ${statusLabels[status] ?? status}`,
      }
    },
  },
})