/**
 * Created by alex.storkey on 27/08/2014.
 */

var util = require('util'),
    request = require('request'),
    _ = require('underscore'),
    Hero = require('./hero');

function Profile(profileData) {
    //copy profile data into this object ^_^
    _.extend(this, profileData);
    this.name = profileData.battleTag.substring(0, profileData.battleTag.indexOf('#'));
    this.code = profileData.battleTag.substring(profileData.battleTag.indexOf('#') + 1);
}

Profile.prototype.getBestHeroes = function (clazz, hardcore, season) {
    var result = [];
    this.heroes.forEach(function (hero) {
        var validHero = (hero.level === 70
            && !hero.dead
            && hero.class === clazz
            && hero.hardcore === hardcore
            && hero.seasonal === season);
        if (validHero)
            result.push(hero);
    });

    return result.sort(function (a, b) {
        return b['last-updated'] - a['last-updated'];
    });
};

Profile.prototype.getHero = function (id, callback) {
    var profile = this;
    return request(this.baseUrl + '/profile/' + this.name + '-' + this.code + '/hero/' + id,
        function (err, response, body) {
            if (err) {
                return callback(err);
            }
            var hero = new Hero(profile, JSON.parse(body));
            var hasSkills = hero.hasAllSkills(),
                hasItems = hero.hasItems();
            if (!hasSkills || !hasItems) {
                //TODO: improve this, maybe return an error?
                console.log('hero %s failed item or skills check (skills: %s, items: %s)', hero, hasSkills, hasItems);
                return callback(null, null);
            }
            return callback(null, hero);
        });
};

Profile.prototype.toString = function () {
    return util.format("%s#%s (tier: %d)", this.name, this.code, this.ranking.tier);
};

module.exports = function (host, ranking, callback) {
    var baseUrl = 'http://' + host + '/api/d3';
    return request(baseUrl + '/profile/' + ranking.name + '-' + ranking.tag + '/', function (err, response, body) {
        if (err) {
            return callback(err);
        }
        var profile = new Profile(JSON.parse(body));
        profile.baseUrl = baseUrl;
        profile.ranking = ranking;
        profile.host = host;
        return callback(null, profile);
    });
};