"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

exports["default"] = superliner;
Object.defineProperty(exports, "__esModule", {
    value: true
});
"use strict";

var readline = _interopRequire(require("readline"));

var printable = _interopRequire(require("printable-string"));

var MuteStream = _interopRequire(require("mute-stream"));

var EventEmitter = require("events").EventEmitter;

var EMPTY_COMMAND = /^\s*$/;

var SuperLiner = exports.SuperLiner = (function (_EventEmitter) {
    function SuperLiner(options) {
        _classCallCheck(this, SuperLiner);

        Object.assign(this, options);

        this.mutableStdin = new MuteStream();
        this.mutableStdout = new MuteStream();

        this.rl = readline.createInterface({
            input: this.mutableStdin,
            output: this.mutableStdout,
            terminal: !!this.stdin.setRawMode,

            completer: function completer(line, callback) {

                this.getSuggestions(line).then(function (ctx) {
                    return callback(null, [ctx.suggestions, ctx.line]);
                });
            }
        });
    }

    _inherits(SuperLiner, _EventEmitter);

    _createClass(SuperLiner, {
        replaceLine: {
            value: function replaceLine(line) {
                if (line !== null) {
                    this.rl.write(null, {
                        ctrl: true,
                        name: "u"
                    });
                    this.rl.write(line);
                    readline.moveCursor(this.mutableStdout, line.length, 0);
                    this.rl.prompt(true);
                }
            }
        },
        suspend: {
            value: function suspend() {
                this.mutableStdin.mute();
                this.mutableStdout.mute();
                this.stdin.unpipe(this.mutableStdin);
            }
        },
        setPrompt: {
            value: function setPrompt() {
                var _this = this;

                this.getPrompt().then(function (prompt) {
                    _this.rl.setPrompt(prompt);
                    _this.rl.prompt();

                    if (_this.stdin.setRawMode) {
                        _this.mutableStdin.write(" ");
                    }
                });
            }
        },
        start: {
            value: function start() {
                if (this.started) {
                    throw new Error("Instance already started");
                }
                this.started = true;
                this.rl.on("line", this.onLine.bind(this));
                this.mutableStdin.on("data", this.onData.bind(this));

                if (this.stdin.setRawMode) {
                    this.stdin.setRawMode(true);
                }
                this.stdin.resume();
                this.stdin.pipe(this.mutableStdin);
                this.mutableStdout.pipe(this.stdout);
                this.setPrompt();
            }
        },
        resume: {
            value: function resume() {
                this.mutableStdin.unmute();
                this.mutableStdout.unmute();

                this.stdin.pipe(this.mutableStdin);
                this.stdout.write("\r\n");
            }
        },
        onData: {
            value: function onData(key) {
                var i = 0;
                var l = key.length;
                var s = "";

                for (i = 0; i < l; i++) {
                    s += printable(String.fromCharCode(key[i]));
                }

                if (s in this.shortcuts) {
                    this.emit("shortcut", this.shortcuts[s]);
                }
            }
        },
        onLine: {
            value: function onLine(line) {
                if (EMPTY_COMMAND.test(line)) {
                    this.setPrompt();
                    return;
                }

                this.emit("line", line);
            }
        }
    });

    return SuperLiner;
})(EventEmitter);

function superliner(options) {
    options.stdin = options.stdin || process.stdin;
    options.stdout = options.stdout || process.stdout;
    options.shortcuts = options.shortcuts || [];
    options.cwd = options.cwd || process.cwd();
    options.env = options.env || process.env;
    options.getPrompt = options.getPrompt || function () {
        return Promise.resolve("");
    };
    options.getSuggestions = options.getSuggestions || function (line) {
        return Promise.resolve({ line: line, suggestions: [] });
    };

    return new SuperLiner(options);
}
