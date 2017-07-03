'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _loglevelColoredLevelPrefix = require('loglevel-colored-level-prefix');

var _loglevelColoredLevelPrefix2 = _interopRequireDefault(_loglevelColoredLevelPrefix);

var _findUp = require('find-up');

var _findUp2 = _interopRequireDefault(_findUp);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _commonTags = require('common-tags');

var _arrify = require('arrify');

var _arrify2 = _interopRequireDefault(_arrify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = (0, _loglevelColoredLevelPrefix2.default)({ prefix: 'prettier-eslint-cli' });

var parser = _yargs2.default.usage(_commonTags.stripIndent`
      Usage: $0 <globs>... [--option-1 option-1-value --option-2]

      Prefix an option with "no-" to set it to false, such as --no-semi to
      disable semicolons and --no-eslint-ignore to disable default ignores.
    `).help('h').alias('h', 'help').version().options({
  write: {
    default: false,
    describe: 'Edit the file in-place (beware!)',
    type: 'boolean'
  },
  stdin: {
    default: false,
    describe: 'Read input via stdin',
    type: 'boolean'
  },
  'eslint-ignore': {
    default: true,
    type: 'boolean',
    describe: _commonTags.oneLine`
        Only format matching files even if
        they are not ignored by .eslintignore.
        (can use --no-eslint-ignore to disable this)
      `
  },
  'list-different': {
    default: false,
    type: 'boolean',
    describe: _commonTags.oneLine`
        Print filenames of files that are different
        from Prettier + Eslint formatting.
      `
  },
  // allow `--eslint-path` and `--eslintPath`
  'eslint-path': {
    default: getPathInHostNodeModules('eslint'),
    describe: 'The path to the eslint module to use',
    coerce: coercePath
  },
  // allow `--prettier-path` and `--prettierPath`
  'prettier-path': {
    describe: 'The path to the prettier module to use',
    default: getPathInHostNodeModules('prettier'),
    coerce: coercePath
  },
  ignore: {
    describe: _commonTags.oneLine`
        pattern(s) you wish to ignore
        (can be used multiple times
        and includes **/node_modules/** automatically)
      `,
    coerce: _arrify2.default
  },
  'log-level': {
    describe: 'The log level to use',
    choices: ['silent', 'error', 'warn', 'info', 'debug', 'trace'],
    alias: 'l',
    default: process.env.LOG_LEVEL || 'warn'
  },
  'prettier-last': {
    describe: 'Run prettier last',
    default: false,
    type: 'boolean'
  },
  'use-tabs': {
    type: 'boolean',
    default: undefined,
    describe: 'Indent lines with tabs instead of spaces.'
  },
  'print-width': {
    type: 'number',
    describe: 'Specify the length of line that the printer will wrap on.'
  },
  'tab-width': {
    type: 'number',
    describe: 'Specify the number of spaces per indentation-level.'
  },
  'trailing-comma': {
    type: 'string',
    describe: _commonTags.stripIndent`
        Print trailing commas wherever possible.

        Valid options:
          - "none" - no trailing commas
          - "es5" - trailing commas where valid in ES5 (objects, arrays, etc)
          - "all" - trailing commas wherever possible (function arguments)
      `,
    choices: ['none', 'es5', 'all']
  },
  'bracket-spacing': {
    type: 'boolean',
    default: undefined,
    describe: _commonTags.stripIndent`
        Print spaces between brackets in object literals.
        Can use --no-bracket-spacing for "false" to disable it.

        Valid options:
        - true - Example: { foo: bar }
        - false - Example: {foo: bar}
      `
  },
  'jsx-bracket-same-line': {
    type: 'boolean',
    default: undefined,
    describe: _commonTags.oneLine`
        Put the > of a multi-line JSX element at
        the end of the last line instead of
        being alone on the next line
      `
  },
  parser: {
    type: 'string',
    describe: 'Specify which parser to use.'
  },
  semi: {
    type: 'boolean',
    default: undefined,
    describe: _commonTags.stripIndent`
        Print semicolons at the ends of statements.
        Can use --no-semi.

        Valid options:
          - true - add a semicolon at the end of every statement
          - false - ${_commonTags.oneLine`
            only add semicolons at the beginning of lines
            that may introduce ASI failures
          `}
      `
  },
  'single-quote': {
    type: 'boolean',
    default: undefined,
    describe: 'Use single quotes instead of double quotes.'
  },
  // TODO: support range-start and range-end
  // would require changes in prettier-eslint
  // TODO: if we allow people to to specify a config path,
  // we need to read that somehow. These can come invarious
  // formats and we'd have to work out `extends` somehow as well.
  // I don't know whether ESLint exposes a way to do this...
  // Contributions welcome!
  'eslint-config-path': {
    type: 'string',
    default: undefined,
    describe: 'Path to the eslint config to use for eslint --fix',
    coerce: coercePath
  }
}).strict();

exports.default = parser;


function getPathInHostNodeModules(module) {
  logger.debug(`Looking for a local installation of the module "${module}"`);
  var modulePath = _findUp2.default.sync(`node_modules/${module}`);

  if (modulePath) {
    return modulePath;
  }
  logger.debug(_commonTags.oneLine`
      Local installation of "${module}" not found,
      looking again starting in "${__dirname}"
    `);

  return _findUp2.default.sync(`node_modules/${module}`, { cwd: __dirname });
}

function coercePath(input) {
  return _path2.default.isAbsolute(input) ? input : _path2.default.join(process.cwd(), input);
}