import {defineType} from 'sanity'

export default defineType({
  name: 'fonte',
  title: 'Fonte normativa',
  type: 'document',
  fields: [
    {name: 'titolo', type: 'string', validation: r => r.required()},
    {
      name: 'tipo',
      type: 'string',
      options: {list: ['codice', 'intesa-stato', 'legge-stato', 'decreto-cei', 'motu-proprio', 'altro']},
      validation: r => r.required(),
    },
    {name: 'anno', type: 'number'},
    {name: 'autoreOrgano', type: 'string'},
    {name: 'dirittiTestoLibero', type: 'boolean', initialValue: true},
  ],
  preview: {select: {title: 'titolo', subtitle: 'tipo'}},
})
