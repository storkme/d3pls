#! /usr/bin/env node

'use strict';

var program = require('commander'),
    Promise = require('bluebird'),
    readFile = Promise.promisify(require('fs').readFile),
    writeFile = Promise.promisify(require('fs').writeFile),
    scraper = require('./lib/rankings-scraper');

program.version(require('./package.json').version)
    .option('-r, --rankings <file>', 'File to read ranking info from')
    .option('-c, --class <c>', 'Class to search')
    .option('-d, --dump-rankings <file>', 'File to dump ranking info to')
    .parse(process.argv);

var rankings;

if (program.rankings) {
    rankings = readFile(program.rankings).then(function(result) {
        return JSON.parse(result);
    });
} else if (program.class) {
    rankings = scraper('http://us.battle.net/d3/en/rankings/era/1/rift-' + program.class);

    if (program.dumpRankings) {
        rankings = rankings.then(function (result) {
            return writeFile(program.dumpRankings, JSON.stringify(result))
                .return(result);
        });
    }
} else {
    return console.error("Um not much we can do here w/out rankings file or class specified");
}

rankings.then(function (thing) {
    console.dir(thing);
}).catch(function (err) {
    console.dir(err);
});
//rankings.each(function(e) {
//    console.log(e);
//});