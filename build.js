'use strict';
const plist = require('plist');
const { readFileSync, writeFile } = require('fs');

const glimmerPatterns = require('./grammars/glimmer.tmLanguage.json');
const markdownPatterns = require('./grammars/markdown.tmLanguage.json');
const generalPatterns = require('./grammars/general.json');
let typeScriptBase = readFileSync('./grammars/TypeScriptReact.tmLanguage', 'utf-8');

// Function to traverse grammars and change scopes to the passed target.
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

// The tagged template pattern definition used to match 'hbs``' inside of JS/TS files
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

// Handlebars Syntax
// ---------------------------------------------------------------------------

// The Handlebars syntax is complete as is, Write to /dist
writeFile('dist/Glimmer.tmLanguage.json', JSON.stringify(glimmerPatterns, null, 2), err => {
  if (err) { return console.warn(err); }
  console.log('Glimmer build complete');
});

// TypeScript Syntax
// ---------------------------------------------------------------------------

// Rename TSX specific values to package TS (Extended)
typeScriptBase = plist.parse(typeScriptBase); // Convert to JSON
delete typeScriptBase.uuid; // TODO: make new uuids
typeScriptBase.name = 'TypeScript (Extended)';
typeScriptBase.scopeName = 'source.ts';
typeScriptBase.fileTypes = ['ts'];

// Inject Handlebars tagged template pattern
typeScriptBase.repository['glimmer-tagged-template'] = glimmerTaggedTemplatePattern;
typeScriptBase.repository.expression.patterns.unshift({ include: '#glimmer-tagged-template' });

// Inject Markdown in Docblock patterns to #comment.patterns[]
Object.assign(typeScriptBase.repository, markdownPatterns.repository);
// Docblock patterns are first entry in #comment.patterns
typeScriptBase.repository.comment.patterns[0].patterns = [
  { include: '#handlebars-fenced-code-block' },
  { include: '#fenced-code-block' },
  { include: '#inline-code-block' },
  { include: 'source.handlebars' },
  { include: '#docblock' },
  { include: '#custom-tags' }
];

// Inject General Patterns
// Attention pattern highlights things like @TODO, Add it to each comment pattern
Object.assign(typeScriptBase.repository, generalPatterns.repository);

typeScriptBase.repository.comment.patterns.forEach(pattern => {
  // Handle the double slash pattern nested in another pattern without a name 😔
  if (pattern.name) {
    if (!pattern.patterns) { pattern.patterns = []; }
    pattern.patterns.unshift({ include: '#attention' });
  } else {
    pattern = pattern.patterns[0];
    if (!pattern.patterns) { pattern.patterns = []; }
    pattern.patterns.unshift({ include: '#attention' });
  }
});

// Fix tsx => ts
typeScriptBase.patterns.forEach(pattern => fixGrammarScopeNames(pattern, 'ts'));

for (let key in typeScriptBase.repository) {
  fixGrammarScopeNames(typeScriptBase.repository[key], 'ts');
}

writeFile('dist/TypeScriptExtended.tmLanguage.json', JSON.stringify(typeScriptBase, null, 2), err => {
  if (err) { return console.warn(err); }
  console.log('TS build complete');
});

// JavaScript Syntax
// ---------------------------------------------------------------------------

// Rename TS specific values to JS
typeScriptBase.name = 'JavaScript (Extended)';
typeScriptBase.scopeName = 'source.js';
typeScriptBase.fileTypes = ['js', 'jsx'];

// Change ts => js
typeScriptBase.patterns.forEach(pattern => fixGrammarScopeNames(pattern, 'js'));
for (let key in typeScriptBase.repository) {
  fixGrammarScopeNames(typeScriptBase.repository[key], 'js');
}

writeFile('dist/JavaScriptExtended.tmLanguage.json', JSON.stringify(typeScriptBase, null, 2), err => {
  if (err) { return console.warn(err); }
  console.log('JS build complete');
});
