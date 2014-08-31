/**
 * How could I not think of a better name for this file?
 *
 * Created by stork on 29/08/2014.
 */

var _ = require('underscore'),
    Promise = require('bluebird'),
    profiles = require('./profiles'),
    scraper = require('./rankings-scraper');

module.exports = function saveProfile(heroClass, connection, options) {
    if (!classes[heroClass])
        return Promise.reject(Error("Invalid class, please use one of the following: " + _(classes).keys().join(",")));

    var host = options.host || 'us.battle.net',
        count = options.count || 100,
        debug = options.debug === true,
        concurrency = options.concurrency || 15,
        clss = classes[heroClass],
        hardcore = !!options.hardcore,
        items = !!options.items,
        url = 'http://' + host + '/d3/en/rankings/era/1/rift-' + (hardcore ? 'hardcore-' : '') + heroClass;

    var p = scraper(url).then(function (rankings) {
        return rankings.splice(0, options.count).reverse();
    }).map(function (ranking) {
        return profiles(host, ranking).tap(function (profile) {
            if (debug)
                console.log('-> saved profile %s', profile);
        });
    }, {
        concurrency: concurrency
    }).map(function (profile) {
        var heroList = profile.getBestHeroes(clss, hardcore);
        if (heroList.length === 0) {
            //no suitable heroes!
            if (debug)
                console.log('profile %s has no suitable heroes', profile);
            return Promise.resolve(null);
        } else {
            return profile.getHero(heroList[0].id)
                .tap(function (hero) {
                    if (debug)
                        console.log('-> saved hero %s', hero);
                });
        }
    }, {
        concurrency: concurrency
    }).map(function (hero) {
        if (hero === null)
            return null;
        if (!items)
            return hero;
        return hero.fetchItems()
            .tap(function () {
                if (debug) console.log(' -> saved items for hero %s', hero);
            })
            .return(hero);
    }, {
        concurrency: concurrency
    }).each(function (hero) {
        return hero === null ? Promise.resolve(null) : connection.saveHero(hero);
    }).then(function () {
        return connection.saveSkills(clss, hardcore).tap(function () {
            if (debug)
                console.log("Saved skills for class %s.", clss);
        });
    });

    return p;
};

var classes = module.exports.classes = {
    dh: 'demon-hunter',
    wd: 'witch-doctor',
    barbarian: 'barbarian',
    crusader: 'crusader',
    monk: 'monk',
    wizard: 'wizard'
};
