# Glimmer Language Syntax Highlighting
This repository contains the base grammars and build that the Glimmer syntax files
are generated with. The individual grammars are available for use in any editor
package.

**NOTE:** The `.tmLanguage` files are generated using the build script. Do not modify
them directly or your changes will be overwritten. Modify the `.tmLanguage.json`
files and run the build script: `npm run build`.

## Grammars
The TypeScript and JavaScript grammars are built using base TS and JS files with the
Glimmer syntax patterns injected into their repositories. The base grammars are:
- TypeScript: https://github.com/Microsoft/TypeScript-TmLanguage
- JavaScript: https://github.com/gandm/language-babel

A very big THANK YOU to these package maintainers for the base syntax patterns.

## Notes on Scope Names
The scopes all follow a naming expression where HTML is composed of _TAGS_ and
_ATTRIBUTES_, and Glimmer is composed of _EXPRESSIONS_ and _ PARAMETERS_.

Available Scope Targets:
- Have punctuation.definition.tag/expression _(`<>` or `{{}}`)_
- Have entity.name.tag/expression _(`div` or `some-component`)_
- entity.other.attribute/parameter-name _(the name of attr/param)_

## TODO
Interested in contributing? All of the following are outstanding:
- [] Patterns for Glimmer template syntax: https://glimmerjs.com/guides/templates-and-helpers
- [] Block vs Inline scope differentiation for HTML tags and Glimmer expressions
- [] Separate configuration files for TS/JS grammars
- [] Update TS base to include React patterns
- [] Open a PR for MS github repo including a package.json so we can import as a dep
  instead of copy-pasting
- [] Note in README about build process and lack of support for grammar injection in
  Sublime+VSCode
- [] Note in README about how to extend Glimmer patterns
- [] Use beta repo for pulling in TypeScript defs? https://marketplace.visualstudio.com/items?itemName=ms-vscode.typescript-javascript-grammar