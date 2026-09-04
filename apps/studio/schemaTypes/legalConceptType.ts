import {defineField, defineType} from 'sanity'

const blocks = [{type: 'block'}]

export const legalConceptType = defineType({
  name: 'legalConcept',
  title: 'Materia / concetto giuridico',
  type: 'document',
  fields: [
    defineField({name:'label',title:'Denominazione',type:'string',validation:(Rule)=>Rule.required()}),
    defineField({name:'slug',title:'Slug',type:'slug',options:{source:'label',maxLength:96},validation:(Rule)=>Rule.required()}),
    defineField({name:'academicLevel',title:'Livello editoriale',type:'string',initialValue:'academic',options:{list:[{title:'Accademico',value:'academic'},{title:'Sintetico',value:'summary'}]},validation:(Rule)=>Rule.required()}),
    defineField({name:'definition',title:'Definizione / sintesi accademica',type:'text',rows:6,validation:(Rule)=>Rule.required()}),
    defineField({name:'systematicFramework',title:'Inquadramento giuridico e sistematico',type:'array',of:blocks}),
    defineField({name:'ecclesiologicalFoundation',title:'Fondamento ecclesiologico e conciliare',type:'array',of:blocks}),
    defineField({name:'codicialDiscipline',title:'Disciplina codiciale',type:'array',of:blocks}),
    defineField({name:'normativeEvolution',title:'Evoluzione normativa',type:'array',of:blocks}),
    defineField({name:'extraCodicialLegislation',title:'Legislazione extracodiciale',type:'array',of:blocks}),
    defineField({name:'interpretation',title:'Interpretazione e dottrina',type:'array',of:blocks}),
    defineField({name:'jurisprudencePractice',title:'Giurisprudenza e prassi',type:'array',of:blocks}),
    defineField({name:'controversialIssues',title:'Questioni problematiche e controverse',type:'array',of:blocks}),
    defineField({name:'bibliography',title:'Bibliografia scientifica',type:'array',of:[{type:'object',name:'bibliographicEntry',fields:[{name:'citation',title:'Citazione',type:'string',validation:(Rule)=>Rule.required()},{name:'kind',title:'Tipologia',type:'string',options:{list:['commentario','monografia','articolo','documento','giurisprudenza','altro']}},{name:'url',title:'URL',type:'url'},{name:'note',title:'Nota',type:'text',rows:2}]}]}),
    defineField({name:'synonyms',title:'Sinonimi / termini collegati',type:'array',of:[{type:'string'}],options:{layout:'tags'}}),
    defineField({name:'broaderConcept',title:'Materia superiore',type:'reference',to:[{type:'legalConcept'}],description:'Gerarchia tematica: es. Impedimenti matrimoniali → Matrimonio canonico.'}),
    defineField({name:'relatedCanons',title:'Canoni collegati',type:'array',of:[{type:'reference',to:[{type:'canon'}]}]}),
    defineField({name:'relatedSegments',title:'Segmenti collegati',type:'array',of:[{type:'reference',to:[{type:'canonSegment'}]}]}),
    defineField({name:'relatedSources',title:'Fonti normative e documentarie collegate',type:'array',of:[{type:'reference',to:[{type:'sourceDocument'}]}]}),
    defineField({name:'relatedProvisions',title:'Disposizioni italiane collegate',type:'array',of:[{type:'reference',to:[{type:'italianProvision'}]}]}),
    defineField({name:'relatedConcepts',title:'Materie correlate',type:'array',of:[{type:'reference',to:[{type:'legalConcept'}]}]}),
    defineField({name:'sourceResearch',title:'Controllo delle fonti',type:'object',fields:[
      {name:'status',title:'Stato verifica',type:'string',options:{list:[{title:'Da verificare',value:'pending'},{title:'Fonti ufficiali verificate',value:'official-verified'},{title:'Verifica scientifica completata',value:'academic-verified'}]},initialValue:'pending'},
      {name:'officialSourcesCheckedAt',title:'Ultima verifica fonti ufficiali',type:'datetime'},
      {name:'editorialNote',title:'Nota di verifica',type:'text',rows:3},
    ]}),
    defineField({name:'notes',title:'Note redazionali',type:'array',of:blocks}),
  ],
  preview:{select:{title:'label',subtitle:'definition'}},
})