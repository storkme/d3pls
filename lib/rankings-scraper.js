/*
 * 
 * https://github.com/storkme/d3i
 *
 * Copyright (c) 2014 storkme
 * Licensed under the MIT license.
 */

var cheerio = require('cheerio'),
    request = require('request'),
    Bacon = require('baconjs').Bacon;

module.exports = function (url) {
    return Bacon.fromNodeCallback(request, url)
        .flatMap(function (response) {
            var $ = cheerio.load(response.body, {
                    ignoreWhitespace: true
                }),
                table = $('#ladders-table'),
                rows = table.find('tbody > tr');
            var results = [];
            rows.each(function () {
                var row = $(this),
                    link = row.find('td.cell-BattleTag a').first()[0],
                    tier = row.find('td.cell-RiftLevel').text(),
                    time = row.find('td.cell-RiftTime').text();
                if (link) {
                    link = link.attribs.href;
                    var match = link.match(/\/d3\/en\/profile\/(.+)-([0-9]+)\//);
                    var name = match[1],
                        tag = match[2];
                    if (name && tag)
                        results.push({
                            name: name,
                            tag: tag,
                            tier: tier.trim(),
                            time: time.trim()
                        });
                }
            });
            return Bacon.fromArray(results);
        });
};