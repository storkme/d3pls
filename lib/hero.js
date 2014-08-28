/**
 * Created by alex.storkey on 27/08/2014.
 */

var _ = require('underscore');

function Hero(profile, heroData) {
    _.extend(this, heroData);
    this.profile = profile;
}

Hero.prototype.toString = function () {
    return this.name + ' [' + this.class + ']';
};

module.exports = Hero;
