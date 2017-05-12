'use strict';
const plist = require('plist');
const { readFileSync, writeFile } = require('fs');

const glimmerPatterns = require('./grammars/glimmer.tmLanguage.json');
let typeScriptBase = readFileSync('./grammars/TypeScriptReact.tmLanguage', 'utf-8');

function fixGrammarScopeNames(rule, target) {
  if (typeof rule.name === 'string') {
    rule.name = target === 'ts' ?
      rule.name.replace(/\.tsx/g, '.ts')
      : rule.name.replace(/\.ts/g, '.js');
  }

  if (typeof rule.contentName === 'string') {
    rule.contentName = target === 'ts' ?
      rule.contentName.replace(/\.tsx/g, '.ts')
      : rule.contentName.replace(/\.ts/g, '.js');
  }
  // recurse
  for (let property in rule) {
    let value = rule[property];
    if (typeof value === 'object') {
      fixGrammarScopeNames(value, target);
    }
  }
}

// hbs`` pattern used to enter glimmer syntax inside of JS/TS files
const glimmerTaggedTemplatePattern = {
  name: 'meta.source.handlebars.ts',
  begin: '\\s?(hbs)((`))', // Optional whitespace required for Babel to match pattern
  end: '((`))',
  beginCaptures: {
    '1': { name: 'entity.name.tag.ts' },
    '2': { name: 'markup.template.definition.begin.handlebars.ts' },
    '3': { name: 'string.template.tagged.ts' }
  },
  endCaptures: {
    '1': { name: 'markup.template.definition.end.handlebars.ts' },
    '2': { name: 'string.template.tagged.ts' }
  },
  patterns: [
    { include: 'source.handlebars' }
  ]
};

// Write Files
writeFile('dist/Glimmer.tmLanguage.json', JSON.stringify(glimmerPatterns, null, 2), err => {
  if (err) { return console.warn(err); }
  console.log('Glimmer build complete');
});

// Update TypeScript base with Glimmer patterns
typeScriptBase = plist.parse(typeScriptBase);
delete typeScriptBase.uuid; // TODO: make new uuids
typeScriptBase.name = 'TypeScript (Extended)';
typeScriptBase.scopeName = 'source.ts';
typeScriptBase.fileTypes = ['ts'];
typeScriptBase.repository['glimmer-tagged-template'] = glimmerTaggedTemplatePattern;
typeScriptBase.repository.expression.patterns.unshift({ include: '#glimmer-tagged-template' });

// Fix tsx => ts
for (let key in typeScriptBase.repository) {
  fixGrammarScopeNames(typeScriptBase.repository[key], 'ts');
}

typeScriptBase.patterns.forEach(pattern => fixGrammarScopeNames(pattern, 'ts'));

// Write Files
writeFile('dist/TypeScriptExtended.tmLanguage.json', JSON.stringify(typeScriptBase, null, 2), err => {
  if (err) { return console.warn(err); }
  console.log('TS build complete');
});

// Update JavaScript base with Glimmer patterns
typeScriptBase.name = 'JavaScript (Extended)';
typeScriptBase.scopeName = 'source.js';
typeScriptBase.fileTypes = ['js', 'jsx'];

// Fix ts => js
for (let key in typeScriptBase.repository) {
  fixGrammarScopeNames(typeScriptBase.repository[key], 'js');
}

typeScriptBase.patterns.forEach(pattern => fixGrammarScopeNames(pattern, 'js'));

writeFile('dist/JavaScriptExtended.tmLanguage.json', JSON.stringify(typeScriptBase, null, 2), err => {
  if (err) { return console.warn(err); }
  console.log('JS build complete');
});
