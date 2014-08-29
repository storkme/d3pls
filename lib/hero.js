/**
 * Created by alex.storkey on 27/08/2014.
 */

var _ = require('underscore');

var items = ['head', 'torso', 'feet', 'hands', 'shoulders', 'legs', 'bracers',
    'mainHand', 'waist', 'rightFinger', 'leftFinger', 'neck'];

function Hero(profile, heroData) {
    _.extend(this, heroData);
    this.profile = profile;
}

Hero.prototype.hasAllSkills = function () {
    return this.skills.active.length === 4
        && _(this.skills.active).every(function (skill) {
            return skill.skill && skill.rune
        })
        && this.skills.passive.length === 4;
};

Hero.prototype.hasItems = function () {
    return _(items).every(function (slot) {
        return !!this.skills[slot];
    });
};

Hero.prototype.toString = function () {
    return this.name + ' [' + this.class + ']';
};

module.exports = Hero;