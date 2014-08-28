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

select sk.name as skill, ru.name as rune
    from d3i.hero_skills hs
        join d3i.skills sk on sk.skill_calc_id = hs.skill_id and sk.type = 'skill'
        join d3i.skills ru on ru.skill_calc_id = hs.rune_id and ru.type = 'rune';

select skill_id, rune_id from d3i.hero_skills where rune_id is not null;