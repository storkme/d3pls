#! /usr/bin/env node

'use strict';

var program = require('commander'),
    Promise = require('bluebird'),
    readFile = Promise.promisify(require('fs').readFile),
    writeFile = Promise.promisify(require('fs').writeFile),
    profiles = require('./lib/profiles'),
    heroes = require('./lib/heroes'),
    scraper = require('./lib/rankings-scraper');

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
    rankings = scraper('http://' + host + '/d3/en/rankings/era/1/rift-' + program.class);

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
    rankings = rankings.splice(0, program.top);
    var d3profiles = rankings.map(function (ranking) {
        return profiles(host, ranking.name, ranking.tag);
    });

    Promise.map(d3profiles, function (profile) {
        return heroes(profile.heroes, program.class);
    }).each(function (heroes) {
        console.log("heroes for " + profile.name + ": " + heroes.length);
    });
});