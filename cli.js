#! /usr/bin/env node

'use strict';

var program = require('commander'),
    Promise = require('bluebird'),
    Rx = require('rx'),
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
    .option('-i, --items', 'download item data too', false);

program.command('dl')
    .description('download leaderboard data and stuff')
    .action(function () {
        if (!program.db)
            return console.error("No db connection string provided");

        if (!program.classes)
            program.classes = Object.keys(downloader.classes);

        var connection = db(program.db);

        Rx.Observable.merge(program.classes.map(function (clss) {
            //this is really shoddy code
            return downloader(clss, connection, {
                count: program.top,
                host: program.host,
                concurrency: 1,
                debug: true,
                hardcore: program.hardcore,
                items: program.items
            });
        })).subscribe(function () {
            },
            function (err) {
                console.error("Error doing stuff");
                console.log(err);
                console.log(err.stack);
            }, function () {
                connection.destroy();
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