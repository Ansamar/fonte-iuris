import {defineField, defineType} from 'sanity'

export const sourceDocumentType = defineType({
  name: 'sourceDocument',
  title: 'Fonte normativa',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Titolo',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'documentType',
      title: 'Tipo di documento',
      type: 'string',
      options: {
        list: [
          {title: 'Codice', value: 'code'},
          {title: 'Costituzione apostolica', value: 'apostolicConstitution'},
          {title: 'Motu proprio', value: 'motuProprio'},
          {title: 'Istruzione', value: 'instruction'},
          {title: 'Decreto', value: 'decree'},
          {title: 'Rescritto', value: 'rescript'},
          {title: 'Interpretazione autentica', value: 'authenticInterpretation'},
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
      name: 'language',
      title: 'Lingua',
      type: 'string',
      options: {
        list: [
          {title: 'Latino', value: 'la'},
          {title: 'Italiano', value: 'it'},
          {title: 'Altra', value: 'other'},
        ],
      },
    }),

    defineField({
      name: 'notes',
      title: 'Note',
      type: 'text',
      rows: 4,
    }),
  ],

  preview: {
    select: {
      title: 'title',
      documentType: 'documentType',
      issuer: 'issuer',
    },
    prepare({title, documentType, issuer}) {
      return {
        title,
        subtitle: `${documentType ?? 'Fonte'} · ${issuer ?? ''}`,
      }
    },
  },
})