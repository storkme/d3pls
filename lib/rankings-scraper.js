/*
 * 
 * https://github.com/storkme/d3i
 *
 * Copyright (c) 2014 storkme
 * Licensed under the MIT license.
 */

var cheerio = require('cheerio'),
    rp = require('request-promise');

module.exports = function (url) {
    return rp(url)
        .then(function (result) {
            var $ = cheerio.load(result, {
                    ignoreWhitespace: true
                }),
                table = $('#ladders-table'),
                rows = table.find('tbody > tr');

            var results = [];
            rows.each(function (i, e) {
                var row = $(this);
                var name = row.find('.context-user .battletag').text(),
                    tagId = row.find('.context-user .tag_id').text(),
                    tier = row.find('td.cell-RiftLevel').text(),
                    time = row.find('td.cell-RiftTime').text();
                if (name.length > 0 && tagId.length > 0) {
                    if (tagId.substr(0, 1) === '#')
                        tagId = tagId.substr(1);
                    results.push({
                        name: name,
                        tag: tagId,
                        tier: tier.trim(),
                        time: time.trim()
                    });
                }
            });

            return results;
        });
};