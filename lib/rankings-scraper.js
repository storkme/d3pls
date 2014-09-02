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
        .map(function (response, body) {
            console.log(body);
            var $ = cheerio.load(body, {
                    ignoreWhitespace: true
                }),
                table = $('#ladders-table'),
                rows = table.find('tbody > tr');
            var results = [];
            rows.each(function () {
                var row = $(this),
                    name = row.find('.battletag').first().text(),
                    tagId = row.find('.tag_id').first().text(),
                    tier = row.find('td.cell-RiftLevel').text(),
                    time = row.find('td.cell-RiftTime').text();
                if (name.length > 0 && tagId.length > 0) {
                    if (tagId.substr(0, 1) === '#') {
                        tagId = tagId.substr(1);
                    }
                    results.push({
                        name: name,
                        tag: tagId,
                        tier: tier.trim(),
                        time: time.trim()
                    });
                }
            });
            return Bacon.fromArray(results);
        });
};