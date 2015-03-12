'use strict';

import superline from '../src';
import concat from 'concat-stream';
import { PassThrough} from 'stream';



describe('superline', () => {

    it('is defined', () => {
        superline.should.be.a('function');
    });


    describe('instance', () => {
        let stdin = new PassThrough();
        let stdout = new PassThrough();
        let rl = superline(stdin, stdout);

        it('is defined', () => {
            rl.should.be.a('object');
        });

        it('has stdin', () => {
            rl.stdin.should.be.a('object');
        });

        it('has stdout', () => {
            rl.stdout.should.be.a('object');
        });

        describe('run simple command', () => {
            let result;
            let stdin = new PassThrough();
            let stdout = new PassThrough();
            let rl = superline({stdin, stdout});
            rl.on('line', (line)=>stdout.end('test.txt\n'));
            
            before((done)=>{
                rl.start();
                stdout.pipe(concat({encoding:'string'}, data => {
                    result = data;
                    done();
                }));
                stdin.end('ls test/fixture\r\n');    

            });
            
            it('output to stdout', () => {
                result.should.be.equal('test.txt\n');
            });
        });

/*

        describe('run set command', () => {
            let result;
            let stdin = new PassThrough();
            let stdout = new PassThrough();
            let rl = superline({stdin, stdout});

            before((done)=>{
                
                stdout.pipe(concat({encoding:'string'}, data => {
                    result = data;
                    done();
                }));
                stdin.end('set test avalue\r\n');    
                setTimeout(()=>stdout.end(),100);
            });
            
            it('run given command', function*() {
                process.env.test.should.be.equal('avalue');
            });

        });

        describe('and operator work', function() {
            this.timeout(10000);
            let result;
            let stdin = new PassThrough();
            let stdout = new PassThrough();
            let rl = superline({stdin, stdout});

            before((done)=>{
                delete  process.env.test;
                stdout.pipe(concat({encoding:'string'}, data => {
                    result = data;
                    done();
                }));
                stdin.end('set test another.value && set test\r\n');    
                setTimeout(()=>stdout.end(),100);

            });
            
            it('run given command', function*() {
               result.should.be.equal('another.value\r\n');
            });

        });*/


    });
});
