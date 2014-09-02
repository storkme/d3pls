/**
 * How could I not think of a better name for this file?
 *
 * Created by stork on 29/08/2014.
 */

var _ = require('underscore'),
    Bacon = require('baconjs').Bacon,
    profiles = require('./profiles'),
    scraper = require('./rankings-scraper');

module.exports = function saveProfile(heroClass, connection, options) {
    if (!classes[heroClass])
        return Promise.reject(Error("Invalid class, please use one of the following: " + _(classes).keys().join(",")));

    var host = options.host || 'us.battle.net',
        count = options.count || 100,
        debug = options.debug === true,
        concurrency = options.concurrency || 5,
        clss = classes[heroClass],
        hardcore = !!options.hardcore,
        items = !!options.items,
        url = 'http://' + host + '/d3/en/rankings/era/1/rift-' + (hardcore ? 'hardcore-' : '') + heroClass;

    var leaderboardData = scraper(url).take(count);

    var observableChain = leaderboardData.flatMapWithConcurrencyLimit(concurrency, function (ranking) {
        var profile = Bacon.fromNodeCallback(profiles, host, ranking);
        if (debug) {
            profile.doAction(function (p) {
                console.log("[profile] %s", p);
            });
        }
        return profile;
    }).flatMapWithConcurrencyLimit(concurrency, function (profile) {
        var heroes = profile.getBestHeroes(clss, hardcore);
        if (heroes.length === 0) {
            if (debug) {
                console.log("[profile] %s has no suitable heroes", profile);
            }
            return Bacon.never();
        }
        var hero = Bacon.fromNodeCallback(profile, 'getHero', heroes[0].id);

        if (debug) {
            hero.doAction(function (h) {
                console.log("[hero] %s (for profile %s)", h, profile);
            });
        }

        return hero;
    });

    //        if (items)
    //            observableChain = observableChain.map(function (hero) {
    //                return (hero.fetchItems().return(hero));
    //            });

    observableChain = observableChain.flatMap(function (hero) {
        return Bacon.fromPromise(connection.saveHero(hero));
    });

    observableChain = observableChain.onEnd(function () {
        connection.saveSkills(clss).then(function () {
            console.log("[skills] %s", clss);
        });
    });

    return observableChain;
};

var classes = module.exports.classes = {
    dh: 'demon-hunter',
    wd: 'witch-doctor',
    barbarian: 'barbarian',
    crusader: 'crusader',
    monk: 'monk',
    wizard: 'wizard'
};

//getFoos().then(function (arrayOfFoo) {
//    //only take the first 100 elements!
//    return arrayOfFoo.splice(0, 100);
//}).map(function (foo) {
//    //get a bar for this foo - this is an async operation (promise)
//    return getBar(foo);
//}).map(function (bar) {
//    //then make a bunch of async calls on bar and return it
//    return Promise.all(bar.stuffs.map(function (stuff) {
//        return doAsyncThing(bar, stuff);
//    }));
//}).each(function (bar) {
//    //then save our new bar to a database or something
//    return bar.save();
//}).then(function () {
//    //cleanup database or whatever
//});
