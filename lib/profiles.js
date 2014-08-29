/**
 * Created by alex.storkey on 27/08/2014.
 */

var util = require('util'),
    request = require('request'),
    _ = require('underscore'),
    Hero = require('./hero');

var classMap = {
    dh: 'demon-hunter',
    wd: 'witch-doctor'
};

function Profile(profileData) {
    //copy profile data into this object ^_^
    _.extend(this, profileData);
    this.name = profileData.battleTag.substring(0, profileData.battleTag.indexOf('#'));
    this.code = profileData.battleTag.substring(profileData.battleTag.indexOf('#') + 1);
}

Profile.prototype.getBestHeroes = function (clazz) {
    clazz = classMap[clazz] || clazz;
    var result = [];
    this.heroes.forEach(function (hero) {
        var validHero = (hero.level === 70
            && !hero.dead
            && hero.class === clazz);
        if (validHero)
            result.push(hero);
    });

    return result.sort(function (a, b) {
        return b['last-updated'] - a['last-updated'];
    });
};

Profile.prototype.getHero = function (id) {
    var profile = this;
    return request.getAsync(this.baseUrl + '/profile/' + this.name + '-' + this.code + '/hero/' + id)
        .spread(function (response, body) {
            var hero = new Hero(profile, JSON.parse(body));
            if (!hero.hasAllSkills() || !hero.hasItems()) {
                console.log('hero %s failed item/skills check', hero);
                return null;
            }
            return hero;
        });
};

Profile.prototype.toString = function () {
    return util.format("%s#%s (tier: %d)", this.name, this.code, this.ranking.tier);
};

module.exports = function (host, ranking) {
    var baseUrl = 'http://' + host + '/api/d3';
    return request.getAsync(baseUrl + '/profile/' + ranking.name + '-' + ranking.tag + '/')
        .spread(function (response, body) {
            var profile = new Profile(JSON.parse(body));
            profile.baseUrl = baseUrl;
            profile.ranking = ranking;
            return profile;
        });
};