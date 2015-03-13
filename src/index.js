'use strict';

import readline from 'readline';
import printable from 'printable-string';
import MuteStream from 'mute-stream';
import { EventEmitter } from 'events';
const EMPTY_COMMAND = /^\s*$/;

/**
 * SuperLine class
 * @classdesc SuperLine
 */
export class SuperLiner extends EventEmitter {
    constructor(options) {
        Object.assign(this, options);
   
        this.mutableStdin = new MuteStream();
        this.mutableStdout = new MuteStream();

        
        this.rl = readline.createInterface({
            input: this.mutableStdin,
            output: this.mutableStdout,
            terminal: !!this.stdin.setRawMode,

            completer (line, callback) {

                options.getSuggestions(line).then((ctx) =>
                    callback(null, [ctx.suggestions, ctx.line])
                );

            }
        });

    }

    replaceLine(line) {
        if (line !== null) {
            this.rl.write(null, {
                ctrl: true,
                name: 'u'
            });
            this.rl.write(line);
            readline.moveCursor(this.mutableStdout, line.length, 0);
            this.rl.prompt(true);

        }
    }

    suspend() {
        this.mutableStdin.mute();
        this.mutableStdout.mute();
        this.stdin.unpipe(this.mutableStdin);
    }


    setPrompt() {


        this.getPrompt().then((prompt) => {
            this.rl.setPrompt(prompt);
            this.rl.prompt();

            if (this.stdin.setRawMode) {
                this.mutableStdin.write(' \x7f');
            }
        });

    }

    start() {
        if (this.started) {
            throw new Error('Instance already started');
        }
        this.started = true;
        this.rl.on('line', this.onLine.bind(this));
        this.mutableStdin.on('data', this.onData.bind(this)); 

        if (this.stdin.setRawMode) {
            this.stdin.setRawMode(true);
        }
        this.stdin.resume();
        this.stdin.pipe(this.mutableStdin);
        this.mutableStdout.pipe(this.stdout);
        this.setPrompt();

    }

    resume() {
        this.mutableStdin.unmute();
        this.mutableStdout.unmute();

        this.stdin.pipe(this.mutableStdin);
        this.stdout.write('\r\n');

    }

    onData(key) {
        var i = 0;
        var l = key.length;
        var s = '';


        for (i = 0; i < l; i++) {
            s += printable(String.fromCharCode(key[i]));
        }


        if (s in this.shortcuts) {
            this.emit('shortcut', this.shortcuts[s]);

        }

    }

    onLine(line) {
        if (EMPTY_COMMAND.test(line)) {
            this.setPrompt();
            return;
        }

        this.emit('line', line);
        
    }
}

/**
 * return a new instance of SuperLine
 * @param  {Object} options options for new instance. See [options](options.doc)
 * @return {SuperLine}         new instance
 */
export default function superliner(options) {
    options.stdin = options.stdin || process.stdin;
    options.stdout = options.stdout || process.stdout;
    options.shortcuts = options.shortcuts || [];
    options.cwd = options.cwd || process.cwd();
    options.env = options.env || process.env;
    options.getPrompt = options.getPrompt || () => Promise.resolve('');
    options.getSuggestions = options.getSuggestions || (line) => Promise.resolve({line, suggestions:[]});

    return new SuperLiner(options);
    
}
