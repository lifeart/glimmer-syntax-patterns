'use strict';
const yaml = require('js-yaml');
const { readFileSync, writeFile } = require('fs');

const typeScriptSyntax = require('./grammars/TypeScriptReact.tmLanguage.json');
const glimmerSyntax = yaml.safeLoad(readFileSync('./grammars/glimmer.tmLanguage.json', 'utf-8'));
const docblockMarkdownSyntax = yaml.safeLoad(readFileSync('./grammars/markdown.tmLanguage.json', 'utf-8'));
const generalPatterns = yaml.safeLoad(readFileSync('./grammars/general.json', 'utf-8'));

/**
 * Reursively changes the scopeName for all entries in a syntax
 * @param {Object}       pattern Syntax pattern to update, will be recursed
 * @param {regex|string} current Current scopeName to target
 * @param {string}       target  New scopeName to update to
 */
function changeGrammarScopeNames(pattern, current, target) {
  if (pattern.name) {
    pattern.name = pattern.name.replace(current, target);
  }
  if (pattern.contentName) {
    pattern.contentName = pattern.contentName.replace(current, target);
  }

  // recurse
  for (let property in pattern) {
    let value = pattern[property];
    if (typeof value === 'object') {
      changeGrammarScopeNames(value, current, target);
    }
  }
}

/**
 * Writes a finished syntax data structure to /dist
 * @param {string} file
 * @param {Object} data
 */
function writeToDist(file, data) {
  writeFile(
    `dist/${file}`,
    JSON.stringify(data, null, 2),
    err => {
      if (err) { return console.warn(err); }
      console.log(`${file} build complete`);
    }
  );
}

// Handlebars Syntax
// ---------------------------------------------------------------------------

// The Handlebars syntax is complete as is, Write to /dist
writeToDist('Glimmer.tmLanguage.json', glimmerSyntax);

// TypeScript Syntax
// ---------------------------------------------------------------------------

// Change syntax meta info for our 'TS (Extended)' language
delete typeScriptSyntax.uuid; // TODO: make new uuids
typeScriptSyntax.name = 'TypeScript (Extended)';
typeScriptSyntax.scopeName = 'source.ts';
typeScriptSyntax.fileTypes = ['ts', 'tsx'];

// Change identifiers from .tsx => .ts
typeScriptSyntax.patterns.forEach(pattern => changeGrammarScopeNames(pattern, /tsx/g, 'ts'));
for (let key in typeScriptSyntax.repository) {
  changeGrammarScopeNames(typeScriptSyntax.repository[key], /tsx/g, 'ts');
}

// Merge Markdown in DocBlock and General purpose patterns into TypeScript base
// repository to make them available in the syntax
Object.assign(
  typeScriptSyntax.repository,
  docblockMarkdownSyntax.repository,
  generalPatterns.repository
);

// Inject include calls into appropriate `patterns` arrays to trigger matches on our
// merged patterns for inline templates and DocBlock markdown

// Ember inline tagged template pattern into the `expression` pattern entry
// (as the first pattern this will match first in all expressions)
typeScriptSyntax.repository.expression.patterns.unshift({ include: '#glimmer-tagged-template' });

// Markdown in Docblock patterns to #comment.patterns[]
// DocBlock patterns are first entry in #comment.patterns
typeScriptSyntax.repository.comment.patterns[0].patterns = [
  { include: '#handlebars-fenced-code-block' },
  { include: '#fenced-code-block' },
  { include: '#inline-code-block' },
  { include: 'source.handlebars' },
  { include: '#docblock' },
  { include: '#custom-tags' }
];

// Add the #attention include to each comment pattern to highlight keywords like TODO
// inside of comments
typeScriptSyntax.repository.comment.patterns.forEach(pattern => {
  if (!pattern.patterns) { pattern.patterns = []; }
  pattern.patterns.unshift({ include: '#attention' });
});

// TypeScript base is now extended with new patterns and existing patterns are
//decorated to match our extended patterns, write to /dist
writeToDist('TypeScriptExtended.tmLanguage.json', typeScriptSyntax);

// JavaScript Syntax
// ---------------------------------------------------------------------------

// Change syntax meta info for our 'JS (Extended)' language
typeScriptSyntax.name = 'JavaScript (Extended)';
typeScriptSyntax.scopeName = 'source.js';
typeScriptSyntax.fileTypes = ['js', 'jsx'];

// Change identifiers from ts => js
typeScriptSyntax.patterns.forEach(pattern => changeGrammarScopeNames(pattern, /ts/g, 'js'));
for (let key in typeScriptSyntax.repository) {
  changeGrammarScopeNames(typeScriptSyntax.repository[key], /ts/g, 'js');
}

writeToDist('JavaScriptExtended.tmLanguage.json', typeScriptSyntax);
