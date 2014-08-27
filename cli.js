#! /usr/bin/env node

'use strict';

var program = require('commander'),
    Promise = require('bluebird'),
    readFile = Promise.promisify(require('fs').readFile),
    writeFile = Promise.promisify(require('fs').writeFile),
    profiles = require('./lib/profiles'),
    heroes = require('./lib/heroes'),
    scraper = require('./lib/rankings-scraper');

Promise.promisifyAll(require("request"));

program.version(require('./package.json').version)
    .option('-r, --rankings <file>', 'File to read ranking info from')
    .option('-c, --class <c>', 'Class to search')
    .option('-d, --dump-rankings <file>', 'File to dump ranking info to')
    .option('-t, --top <n>', 'How many of the top profiles to inspect [100]', 100)
    .parse(process.argv);

var host = 'us.battle.net',
    rankings;

if (program.rankings) {
    rankings = readFile(program.rankings).then(function (result) {
        return JSON.parse(result);
    });
} else if (program.class) {
    var url = 'http://' + host + '/d3/en/rankings/era/1/rift-' + program.class;
    rankings = scraper(url);

    if (program.dumpRankings) {
        rankings = rankings.then(function (result) {
            return writeFile(program.dumpRankings, JSON.stringify(result))
                .return(result);
        });
    }
} else {
    return console.error("Um not much we can do here w/out rankings file or class specified");
}

rankings.then(function (rankings) {
    console.dir(rankings);
    return rankings.splice(0, program.top)
        .map(function (ranking) {
            return profiles(host, ranking.name, ranking.tag);
        });
}).each(function (profile) {
    var heroes = heroes(profile.heroes, program.class);
    console.log("heroes for " + profile.name + ": " + heroes.length);
}).catch(function (err) {
    console.log(err);
});