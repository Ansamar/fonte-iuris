import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {annotationType} from './schemaTypes/annotationType'
import {corpusType} from './schemaTypes/corpusType'
import {structuralUnitType} from './schemaTypes/structuralUnitType'
import {canonType} from './schemaTypes/canonType'
import {canonVersionType} from './schemaTypes/canonVersionType'
import {canonSegmentType} from './schemaTypes/canonSegmentType'
import {legalRelationType} from './schemaTypes/legalRelationType'
import {sourceDocumentType} from './schemaTypes/sourceDocumentType'
import {italianProvisionType} from './schemaTypes/italianProvisionType'
import {pastoralDocumentType} from './schemaTypes/pastoralDocumentType'
import {jurisprudentialDecisionType} from './schemaTypes/jurisprudentialDecisionType'
import {legalConceptType} from './schemaTypes/legalConceptType'
import {bibliographicItemType} from './schemaTypes/bibliographicItemType'
import {structure} from './schemaTypes/structure'

export default defineConfig({
  name: 'default',
  title: 'Fonte Iuris',

  projectId: '2rq93txn',
  dataset: 'production',

  plugins: [
    structureTool({
      structure,
    }),
  ],

  schema: {
    types: [
      corpusType,
      structuralUnitType,
      canonType,
      canonVersionType,
      canonSegmentType,
      annotationType,
      legalRelationType,
      sourceDocumentType,
      italianProvisionType,
      pastoralDocumentType,
      jurisprudentialDecisionType,
      legalConceptType,
      bibliographicItemType,
    ],
  },
})