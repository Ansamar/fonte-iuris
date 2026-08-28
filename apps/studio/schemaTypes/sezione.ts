import {defineType} from 'sanity'

export default defineType({
  name: 'sezione',
  title: 'Sezione',
  type: 'document',
  fields: [
    {name: 'titolo', type: 'string', validation: r => r.required()},
    {name: 'slug', type: 'slug', options: {source: 'titolo'}, validation: r => r.required()},
    {name: 'sintesi', type: 'array', of: [{type: 'block'}]},
    {
      name: 'dettagli',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {name: 'etichetta', type: 'string', validation: r => r.required()},
          {name: 'testo', type: 'array', of: [{type: 'block'}]},
        ],
      }],
    },
    {
      name: 'boxCodice1983',
      type: 'object',
      fields: [
        {name: 'fraseGuida', type: 'array', of: [{type: 'block'}]},
        {name: 'canoniCollegati', type: 'array', of: [{type: 'reference', to: [{type: 'norma'}]}]},
      ],
    },
    {name: 'notaDidattica', type: 'array', of: [{type: 'block'}]},
    {name: 'note', type: 'array', of: [{type: 'reference', to: [{type: 'nota'}]}]},
    {name: 'concordanze', type: 'array', of: [{type: 'reference', to: [{type: 'concordanza'}]}]},
    {name: 'ordine', type: 'number'},
    {name: 'state', type: 'string', options: {list: ['bozza', 'pubblicato']}, initialValue: 'bozza'},
  ],
  preview: {select: {title: 'titolo'}},
})
