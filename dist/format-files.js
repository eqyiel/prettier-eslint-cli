'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var formatStdin = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(prettierESLintOptions) {
    var stdinValue, formatted;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _getStdin2.default)();

          case 2:
            stdinValue = _context.sent.trim();
            _context.prev = 3;
            formatted = (0, _prettierEslint2.default)((0, _extends3.default)({ text: stdinValue }, prettierESLintOptions));

            process.stdout.write(formatted);
            return _context.abrupt('return', Promise.resolve(formatted));

          case 9:
            _context.prev = 9;
            _context.t0 = _context['catch'](3);

            logger.error('There was a problem trying to format the stdin text', `\n${(0, _indentString2.default)(_context.t0.stack, 4)}`);
            process.exitCode = 1;
            return _context.abrupt('return', Promise.resolve(stdinValue));

          case 14:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[3, 9]]);
  }));

  return function formatStdin(_x) {
    return _ref2.apply(this, arguments);
  };
}();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _Rx = require('rxjs/Rx');

var _Rx2 = _interopRequireDefault(_Rx);

var _prettierEslint = require('prettier-eslint');

var _prettierEslint2 = _interopRequireDefault(_prettierEslint);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _getStdin = require('get-stdin');

var _getStdin2 = _interopRequireDefault(_getStdin);

var _ignore = require('ignore');

var _ignore2 = _interopRequireDefault(_ignore);

var _findUp = require('find-up');

var _findUp2 = _interopRequireDefault(_findUp);

var _lodash = require('lodash.memoize');

var _lodash2 = _interopRequireDefault(_lodash);

var _indentString = require('indent-string');

var _indentString2 = _interopRequireDefault(_indentString);

var _loglevelColoredLevelPrefix = require('loglevel-colored-level-prefix');

var _loglevelColoredLevelPrefix2 = _interopRequireDefault(_loglevelColoredLevelPrefix);

var _messages = require('./messages');

var messages = _interopRequireWildcard(_messages);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LINE_SEPERATOR_REGEX = /(\r|\n|\r\n)/; /* eslint no-console:0 */

var rxGlob = _Rx2.default.Observable.bindNodeCallback(_glob2.default);
var rxReadFile = _Rx2.default.Observable.bindNodeCallback(_fs2.default.readFile);
var rxWriteFile = _Rx2.default.Observable.bindNodeCallback(_fs2.default.writeFile);
var findUpSyncMemoized = (0, _lodash2.default)(findUpSync, function resolver() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return args.join('::');
});
var getIsIgnoredMemoized = (0, _lodash2.default)(getIsIgnored);

var logger = (0, _loglevelColoredLevelPrefix2.default)({ prefix: 'prettier-eslint-cli' });

exports.default = formatFilesFromArgv;


function formatFilesFromArgv(_ref) {
  var fileGlobs = _ref._,
      _ref$logLevel = _ref.logLevel,
      logLevel = _ref$logLevel === undefined ? logger.getLevel() : _ref$logLevel,
      listDifferent = _ref.listDifferent,
      stdin = _ref.stdin,
      write = _ref.write,
      eslintPath = _ref.eslintPath,
      eslintConfigPath = _ref.eslintConfigPath,
      prettierPath = _ref.prettierPath,
      _ref$ignore = _ref.ignore,
      ignoreGlobs = _ref$ignore === undefined ? [] : _ref$ignore,
      _ref$eslintIgnore = _ref.eslintIgnore,
      applyEslintIgnore = _ref$eslintIgnore === undefined ? true : _ref$eslintIgnore,
      prettierLast = _ref.prettierLast,
      prettierOptions = (0, _objectWithoutProperties3.default)(_ref, ['_', 'logLevel', 'listDifferent', 'stdin', 'write', 'eslintPath', 'eslintConfigPath', 'prettierPath', 'ignore', 'eslintIgnore', 'prettierLast']);

  logger.setLevel(logLevel);
  var prettierESLintOptions = {
    logLevel,
    eslintPath,
    eslintConfigPath,
    prettierPath,
    prettierLast,
    prettierOptions
  };
  var cliOptions = { write, listDifferent };
  if (stdin) {
    return formatStdin(prettierESLintOptions);
  } else {
    return formatFilesFromGlobs(fileGlobs, [].concat((0, _toConsumableArray3.default)(ignoreGlobs)), // make a copy to avoid manipulation
    cliOptions, prettierESLintOptions, applyEslintIgnore);
  }
}

function formatFilesFromGlobs(fileGlobs, ignoreGlobs, cliOptions, prettierESLintOptions, applyEslintIgnore) {
  var concurrentGlobs = 3;
  var concurrentFormats = 10;
  return new Promise(function (resolve) {
    var successes = [];
    var failures = [];
    var unchanged = [];
    _Rx2.default.Observable.from(fileGlobs).mergeMap(getFilesFromGlob.bind(null, ignoreGlobs, applyEslintIgnore), null, concurrentGlobs).concatAll().distinct().mergeMap(filePathToFormatted, null, concurrentFormats).subscribe(onNext, onError, onComplete);

    function filePathToFormatted(filePath) {
      return formatFile(filePath, prettierESLintOptions, cliOptions);
    }

    function onNext(info) {
      if (info.error) {
        failures.push(info);
      } else if (info.unchanged) {
        unchanged.push(info);
      } else {
        successes.push(info);
      }
    }

    function onError(error) {
      logger.error('There was an unhandled error while formatting the files', `\n${(0, _indentString2.default)(error.stack, 4)}`);
      process.exitCode = 1;
      resolve({ error, successes, failures });
    }

    function onComplete() {
      var isNotSilent = logger.getLevel() !== logger.levels.SILENT;

      /* use console.error directly here because
       * - we don't want these messages prefixed
       * - we want them to go to stderr, not stdout
       */
      if (successes.length && isNotSilent) {
        console.error(messages.success({
          success: _chalk2.default.green('success'),
          count: successes.length,
          countString: _chalk2.default.bold(successes.length)
        }));
      }
      if (failures.length && isNotSilent) {
        process.exitCode = 1;
        console.error(messages.failure({
          failure: _chalk2.default.red('failure'),
          count: failures.length,
          countString: _chalk2.default.bold(failures.length)
        }));
      }
      if (unchanged.length && isNotSilent) {
        console.error(messages.unchanged({
          unchanged: _chalk2.default.gray('unchanged'),
          count: unchanged.length,
          countString: _chalk2.default.bold(unchanged.length)
        }));
      }
      resolve({ successes, failures });
    }
  });
}

function getFilesFromGlob(ignoreGlobs, applyEslintIgnore, fileGlob) {
  var globOptions = { ignore: ignoreGlobs };
  if (!fileGlob.includes('node_modules')) {
    // basically, we're going to protect you from doing something
    // not smart unless you explicitly include it in your glob
    globOptions.ignore.push('**/node_modules/**');
  }
  return rxGlob(fileGlob, globOptions).map(function (filePaths) {
    return filePaths.filter(function (filePath) {
      return applyEslintIgnore ? !isFilePathMatchedByEslintignore(filePath) : true;
    });
  });
}

function formatFile(filePath, prettierESLintOptions, cliOptions) {
  var fileInfo = { filePath };
  var format$ = rxReadFile(filePath, 'utf8').map(function (text) {
    fileInfo.text = text;
    fileInfo.formatted = (0, _prettierEslint2.default)((0, _extends3.default)({ text, filePath }, prettierESLintOptions));
    fileInfo.unchanged = fileInfo.text === fileInfo.formatted;
    return fileInfo;
  });

  if (cliOptions.write) {
    format$ = format$.mergeMap(function (info) {
      if (info.unchanged) {
        return _Rx2.default.Observable.of(info);
      } else {
        return rxWriteFile(filePath, info.formatted).map(function () {
          return info;
        });
      }
    });
  } else if (cliOptions.listDifferent) {
    format$ = format$.map(function (info) {
      if (!info.unchanged) {
        process.exitCode = 1;
        console.log(info.filePath);
      }
      return info;
    });
  } else {
    format$ = format$.map(function (info) {
      process.stdout.write(info.formatted);
      return info;
    });
  }

  return format$.catch(function (error) {
    logger.error(`There was an error formatting "${fileInfo.filePath}":`, `\n${(0, _indentString2.default)(error.stack, 4)}`);
    return _Rx2.default.Observable.of(Object.assign(fileInfo, { error }));
  });
}

function getNearestEslintignorePath(filePath) {
  var _path$parse = _path2.default.parse(filePath),
      dir = _path$parse.dir;

  return findUpSyncMemoized('.eslintignore', dir);
}

function isFilePathMatchedByEslintignore(filePath) {
  var eslintignorePath = getNearestEslintignorePath(filePath);
  if (!eslintignorePath) {
    return false;
  }

  var eslintignoreDir = _path2.default.parse(eslintignorePath).dir;
  var filePathRelativeToEslintignoreDir = _path2.default.relative(eslintignoreDir, filePath);
  var isIgnored = getIsIgnoredMemoized(eslintignorePath);
  return isIgnored(filePathRelativeToEslintignoreDir);
}

function findUpSync(filename, cwd) {
  return _findUp2.default.sync('.eslintignore', { cwd });
}

function getIsIgnored(filename) {
  var ignoreLines = _fs2.default.readFileSync(filename, 'utf8').split(LINE_SEPERATOR_REGEX).filter(function (line) {
    return Boolean(line.trim());
  });
  var instance = (0, _ignore2.default)();
  instance.add(ignoreLines);
  return instance.ignores.bind(instance);
}