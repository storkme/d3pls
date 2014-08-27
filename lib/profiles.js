/**
 * Created by alex.storkey on 27/08/2014.
 */

var request = require('request'),
    _ = require('underscore'),
    Hero = require('./hero');

function Profile(profileData) {
    //copy profile data into this object ^_^
    _.extend(this, profileData);
    this.name = profileData.battleTag.substring(0, profileData.battleTag.indexOf('#'));
    this.code = profileData.battleTag.substring(profileData.battleTag.indexOf('#') + 1);
}

Profile.prototype.getBestHeroes = function (clazz) {
    var result = [];
    this.heroes.forEach(function (hero) {
        if (hero.level === 70
            && !hero.dead
            && hero.class === clazz)
            result.push(hero);
    });

    return result.sort(function (a, b) {
        return b['last-updated'] - a['last-updated'];
    });
};

Profile.prototype.getHero = function (id) {
    return request.getAsync('http://' + host + '/api/d3/profile/' + this.name + '-' + this.code + '/hero/' + id)
        .spread(function (response, body) {
            return new Hero(JSON.parse(body));
        });
};

module.exports = function (host, name, code) {
    return request.getAsync('http://' + host + '/api/d3/profile/' + name + '-' + code + '/')
        .spread(function (response, body) {
            return new Profile(JSON.parse(body));
        });
};