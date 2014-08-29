#! /usr/bin/env node

'use strict';

var program = require('commander'),
    Promise = require('bluebird'),
    path = require('path'),
    util = require('util'),
    readFile = Promise.promisify(require('fs').readFile),
    writeFile = Promise.promisify(require('fs').writeFile),
    profiles = require('./lib/profiles'),
    heroes = require('./lib/hero'),
    db = require('./lib/db'),
    scraper = require('./lib/rankings-scraper');

Promise.promisifyAll(require("request"));
Promise.promisifyAll(require("pg"));

program.version(require('./package.json').version)
    .option('-r, --rankings <file>', 'File to read ranking info from')
    .option('-c, --class <c>', 'Class to search')
    .option('-d, --dump-rankings <file>', 'File to dump ranking info to')
    .option('-t, --top <n>', 'How many of the top profiles to inspect [100]', 100)
    .option('-o, --output-folder <folder>', 'Folder to place output in')
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

var p = rankings.then(function (rankings) {
    return rankings.splice(0, program.top).reverse();
}).map(function (ranking) {
    return profiles(host, ranking)
        .then(function (f) {
            console.log('-> profile for %s#%s [tier: %d]', ranking.name, ranking.tag, ranking.tier);
            return f;
        });
}, {
    concurrency: 10
}).map(function (profile) {
    var heroList = profile.getBestHeroes(program.class);
    if (heroList.length === 0) {
        //no suitable heroes!
        return null;
    } else {
        return profile.getHero(heroList[0].id)
            .then(function (f) {
                console.log('-> hero for %s#%s [tier: %d]', profile.ranking.name, profile.ranking.tag, profile.ranking.tier);
                return f;
            });
    }
}, {
    concurrency: 10
});

var connection = db('postgres://d3i:eeee@localhost/d3i');
p = p.each(function (hero) {
    return connection.saveHero(hero).tap(function () {
        console.log("-> saved hero for %s#%s", hero.profile.ranking.name, hero.profile.ranking.tag);
    }).catch(function (err) {
        console.error("failed inserting data for hero " + hero.toString());
        console.error(err);
        console.dir(hero);
    });
}).all().then(function () {
    return connection.saveSkills(program.class).tap(function () {
        console.log("Saved skills.");
    });
}).then(function () {
    //i know this is crappy but that's how i roll suck it nerds
    connection.destroy();
});

// does this even work any more?
if (program.outputFolder)
    p = p.map(function (hero) {
        var fname = util.format('%s-%s-%s.json', hero.profile.ranking.name, hero.profile.ranking.tag, hero.name);
        return writeFile(path.join(program.outputFolder, fname), JSON.stringify(hero))
            .return(fname);
    }).each(function (file) {
        console.log("Wrote file %s", file);
    });

p = p.catch(function (err) {
    console.log(err);
    console.log(err.stack);
});