# Contributing
Contributions are welcome! This is a tool for the Ember community that we want to
make as robust and totally awesome as possible. The notes below are intended to help
new contributors get started.

## Handlebars/HTMLBars/Glimmer Patterns
All of the patterns for the template matching are found in `grammars/glimmer.yaml`.
These patterns are pulled into the JS && TS syntaxes using a `source.handlebars`
include.

## TypeScript Base Syntax
The JS && TS syntaxes are derived from the the VSCode grammar file found here: https://github.com/Microsoft/vscode/blob/master/extensions/typescript/syntaxes/TypeScriptReact.tmLanguage.json (this file itself is derived from the `babel-sublime` and Atom
`language-javascript` syntaxes). This file is pulled into
`grammars/TypeScriptReact.tmLanguage.json` and used by the build as the base syntax
to decorate with our additional patterns.

## Custom Patterns
Additional custom patterns are found in the grammars dir. This package is intended to
provide full support for developing in JS/TS, JSDoc, Handlebars and Markdown. If you
have ideas for additional utility patterns feel free to open a PR
