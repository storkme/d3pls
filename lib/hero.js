/**
 * Created by alex.storkey on 27/08/2014.
 */

var _ = require('underscore'),
    request = require('request'),
    Promise = require('bluebird');

var items = ['head', 'torso', 'feet', 'hands', 'shoulders', 'legs', 'bracers',
    'mainHand', 'waist', 'rightFinger', 'leftFinger', 'neck'];

function Hero(profile, heroData) {
    _.extend(this, heroData);
    this.profile = profile;
}

Hero.prototype.hasAllSkills = function () {
    return this.skills.active.length === 6
        && _(this.skills.active).every(function (skill) {
            return skill.skill && skill.rune
        })
        && this.skills.passive.length === 4;
};

Hero.prototype.hasItems = function () {
    var hero = this;
    return _(items).every(function (slot) {
        return !!hero.items[slot];
    });
};

Hero.prototype.fetchItems = function () {
    var hero = this;
    return Promise.all(_(this.items).map(function (item, slot) {
        return request.getAsync(hero.profile.baseUrl + '/data/' + item.tooltipParams)
            .spread(function (response, body) {
                item.data = JSON.parse(body);
            });
    }));
};

Hero.prototype.toString = function () {
    return this.name + '(' + this.class + ')(' + this.profile.battleTag + ')';
};

module.exports = Hero;