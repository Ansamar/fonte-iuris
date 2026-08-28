import {defineType} from 'sanity'

export default defineType({
  name: 'norma',
  title: 'Norma / Canone',
  type: 'document',
  fields: [
    {name: 'numero', type: 'string', validation: r => r.required()},
    {
      name: 'slug',
      type: 'slug',
      options: {source: (doc: any) => `can-${doc?.numero ?? ''}`},
    },
    {name: 'fonte', type: 'reference', to: [{type: 'fonte'}], validation: r => r.required()},
    {name: 'titolo', type: 'string'},
    {name: 'testo', type: 'array', of: [{type: 'block'}]},
    {
      name: 'paragrafi',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {name: 'etichetta', type: 'string'},
          {name: 'testo', type: 'text'},
        ],
      }],
    },
    {name: 'parent', type: 'reference', to: [{type: 'structure'}]},
    {name: 'ordine', type: 'number'},
    {name: 'state', type: 'string', options: {list: ['bozza', 'revisione', 'pubblicato']}, initialValue: 'bozza'},
  ],
  preview: {
    select: {title: 'titolo', numero: 'numero'},
    prepare(sel: any) {
      return {title: sel.title || `Can. ${sel.numero}`, subtitle: sel.numero}
    },
  },
})
