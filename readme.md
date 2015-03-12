  [![gitter][gitter-image]][gitter-url]
  [![NPM version][npm-image]][npm-url]
  [![build status][shippable-image]][shippable-url]
  ![Test coverage](/build/coverage.png?raw=true)

readline with promised superpowers :+1:
  
## Installation

```
$ npm install superline --save
```

  superline is supported in all versions of [iojs](https://iojs.org) without any flags.

  To use superline with node, you must be running __node > 0.11.16__ or __node > 0.12.0__ for generator and promise support, and must run node with the --harmony-generators or --harmony flag.

## Getting started

See all example in example folder to get started. 
Open an issue if you have any question or suggestion.

## Example

```js
var superline = require('superline');
var mws = new superline();

mws.use(function *(next){
    this.result += ' hello';
    yield next();
});

mws.use(function *(next){
    this.result += ' world';
    yield next();
});

var ctx = {result:'yet another'};

mws.run(ctx).then(function(){
  //ctx.result === 'yet another hello world'
});

```

## Running tests

```
$ npm install && npm test
```

## Contribute

Please, PR are welcomed!

## Authors

  - [Andrea Parodi](https://github.com/parro-it)

# License

  MIT

[npm-image]: https://img.shields.io/npm/v/superline.svg?style=flat-square
[npm-url]: https://npmjs.org/package/superline
[shippable-image]: https://api.shippable.com/projects/55005c5b5ab6cc1352981ec6/badge?branchName=master
[shippable-url]: https://app.shippable.com/projects/55005c5b5ab6cc1352981ec6/builds/latest
[gitter-image]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/shes/superline
