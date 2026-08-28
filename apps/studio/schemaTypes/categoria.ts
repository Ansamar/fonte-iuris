import {defineType} from 'sanity'

export default defineType({
  name: 'categoria',
  title: 'Categoria giuridica',
  type: 'document',
  fields: [
    {name: 'titolo', type: 'string', validation: r => r.required()},
    {name: 'ordine', type: 'number'},
    {name: 'slug', type: 'slug', options: {source: 'titolo'}, validation: r => r.required()},
    {name: 'sintesi', type: 'array', of: [{type: 'block'}]},
    {name: 'sezioni', type: 'array', of: [{type: 'reference', to: [{type: 'sezione'}]}]},
    {name: 'state', type: 'string', options: {list: ['bozza', 'pubblicato']}, initialValue: 'bozza'},
  ],
  preview: {select: {title: 'titolo', subtitle: 'ordine'}},
})
