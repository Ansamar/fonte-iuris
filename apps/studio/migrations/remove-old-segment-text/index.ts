import {at, defineMigration, unset} from 'sanity/migrate'

export default defineMigration({
  title: 'Remove old text field from canonSegment',

  documentTypes: ['canonSegment'],

  filter: 'defined(text)',

  migrate: {
    document() {
      return at('text', unset())
    },
  },
})