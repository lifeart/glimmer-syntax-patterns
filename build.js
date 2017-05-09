'use strict';
const plist = require('plist');
const { readFileSync, writeFile } = require('fs');

const glimmerPatterns = require('./glimmer.tmLanguage.json');
let typeScriptBase = readFileSync('./TypeScript.tmLanguage', 'utf-8');
let javaScriptBase = require('./node_modules/language-babel/grammars/Babel Language.json');

// hbs`` pattern used to enter glimmer syntax inside of JS/TS files
const glimmerTaggedTemplatePattern = {
  name: 'meta.source.glimmer.ts',
  begin: '\\s?(hbs)((`))', // Optional whitespace required for Babel to match pattern
  end: '((`))',
  beginCaptures: {
    '1': { name: 'entity.name.tag.ts' },
    '2': { name: 'markup.template.definition.begin.glimmer.ts' },
    '3': { name: 'string.template.tagged.ts' }
  },
  endCaptures: {
    '1': { name: 'markup.template.definition.end.glimmer.ts' },
    '2': { name: 'string.template.tagged.ts' }
  },
  patterns: [
    { include: '#glimmer-unescaped-expression' },
    { include: '#glimmer-comment' },
    { include: '#glimmer-expression' },
    { include: '#html-tag' },
    { include: '#html-comment' },
    { include: '#entities' }
  ]
};

// Update TypeScript base with Glimmer patterns
typeScriptBase = plist.parse(typeScriptBase);
typeScriptBase.name = 'TypeScript (Glimmer)';
typeScriptBase.repository['glimmer-tagged-template'] = glimmerTaggedTemplatePattern;
typeScriptBase.repository.expression.patterns.unshift({ include: '#glimmer-tagged-template' });

// Update JavaScript base with Glimmer patterns
javaScriptBase.name = 'JavaScript (Babel+Glimmer)';
javaScriptBase.scopeName = 'source.js';
javaScriptBase.repository['glimmer-tagged-template'] = glimmerTaggedTemplatePattern;
javaScriptBase.repository.expression.patterns.unshift({ include: '#glimmer-tagged-template' });

// Inject all Glimmer patterns into pattern repositories
for (let pattern in glimmerPatterns.repository) {
  typeScriptBase.repository[pattern] = glimmerPatterns.repository[pattern];
  javaScriptBase.repository[pattern] = glimmerPatterns.repository[pattern];
}

// Write Files
writeFile('dist/TypeScriptGlimmer.tmLanguage.json', JSON.stringify(typeScriptBase, null, 2), err => {
  if (err) { return console.warn(err); }
  console.log('TS build complete');
});
writeFile('dist/JavaScriptGlimmer.tmLanguage.json', JSON.stringify(javaScriptBase, null, 2), err => {
  if (err) { return console.warn(err); }
  console.log('JS build complete');
});