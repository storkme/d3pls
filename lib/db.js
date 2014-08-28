/**
 * Created by stork on 27/08/2014.
 */
var _ = require('underscore'),
    Promise = require('bluebird'),
    knex = require('knex');

module.exports = function (connectionString) {
    var pg = knex({
        client: 'pg',
        connection: connectionString,
        pool: {
            min: 0,
            max: 5
        }
    });
    return function (hero) {
        var itemsToInsert = _.map(hero.items, function (item, slot) {
            return {
                item_id: item.id,
                name: item.name,
                icon: item.icon,
                color: item.color,
                tooltip_params: item.tooltipParams,
                slot: slot
            };
        });

        return pg('hero').insert({
            hero_id: hero.id,
            name: hero.name,
            class: hero.class,
            level: hero.level,
            battle_tag: hero.battleTag,
            ranking_tier: hero.ranking.tier,
            ranking_time: hero.ranking.time,
            last_updated: hero['last-updated']
        }, 'id').then(function (heroId) {
            var insertItems = pg('items')
                .insert(itemsToInsert, 'id')
                .map(function (insertedItemId) {
                    return pg('hero_item').insert({
                        hero_id: heroId,
                        item_id: insertedItemId
                    });
                });

            var insertStats = pg('hero_stats')
                .insert(_.map(hero.stats, function (value, key) {
                    return {
                        hero_id: heroId,
                        name: key,
                        value: value
                    };
                }));

            var insertActiveSkills = pg('hero_skills')
                .insert(_.map(hero.skills.active, function (skill) {
                    return {
                        hero_id: heroId,
                        skill_id: skill.skill.skillCalcId,
                        rune_id: skill.rune.skillCalcId
                    };
                }));
            var insertPassiveSkills = pg('hero_skills')
                .insert(_.map(hero.skills.passive, function (skill) {
                    return {
                        hero_id: heroId,
                        skill_id: skill.skill.skillCalcId
                    };
                }));

            return Promise.join(insertItems, insertStats, insertActiveSkills, insertPassiveSkills);
        });
    };
};