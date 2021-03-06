#! /usr/bin/env node

'use strict';

var program = require('commander'),
    Promise = require('bluebird'),
    Bacon = require('baconjs').Bacon,
    downloader = require('./lib/downloader'),
    db = require('./lib/db');

Promise.promisifyAll(require("request"));
Promise.promisifyAll(require("pg"));

program.version(require('./package.json').version)
    .option('-c, --classes <c>', 'Class(es) to search', list)
    .option('-t, --top <n>', 'how many results to scan [100]', 100)
    .option('-h, --host <host>', 'host to use [us.battle.net]', 'us.battle.net')
    .option('-d, --db <string>', 'database connection string')
    .option('--hardcore', 'hardcore mode', false)
    .option('-s, --season <s>', 'season? [false]', false)
    .option('-i, --items', 'download item data too', false);

program.command('dl')
    .description('download leaderboard data and stuff')
    .action(function () {
        if (!program.db)
            return console.error("No db connection string provided");

        if (!program.classes)
            program.classes = Object.keys(downloader.classes);

        var connection = db(program.db);

        var stream = Bacon.mergeAll(program.classes.map(function (clss) {
            //this is really shoddy code
            return downloader(clss, connection, {
                count: program.top,
                host: program.host,
                concurrency: 2,
                debug: true,
                hardcore: program.hardcore,
                season: program.season,
                items: !!program.items
            });
        }));
        stream.onError(function (err) {
            console.error("Error", err);
        });
        stream.onEnd(function () {
            connection.destroy(function () {
                console.log("done or whatever.");
            });
        });
    });

program.command('www')
    .description('run REST API')
    .action(function () {
        if (!program.db)
            return console.error("No db connection string provided");

        require('./lib/www')(program.db, {
            debug: true
        });
    });

program.parse(process.argv);

function list(val) {
    return val.split(',');
}