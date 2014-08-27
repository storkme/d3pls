/**
 * Created by alex.storkey on 27/08/2014.
 */

var _ = require('underscore');

function Hero(heroData) {
    _.extend(this, heroData);
}

module.exports = Hero;