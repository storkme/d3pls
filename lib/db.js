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
                color: item.displayColor,
                tooltip_params: item.tooltipParams,
                slot: slot
            };
        });

        return pg('d3i.hero').insert({
            hero_id: hero.id,
            name: hero.name,
            class: hero.class,
            level: hero.level,
            battle_tag: hero.profile.battleTag,
            ranking_tier: hero.profile.ranking.tier,
            ranking_time: hero.profile.ranking.time,
            last_updated: hero['last-updated']
        }, 'id').then(function (heroId) {
            heroId = heroId[0];
            var insertItems = pg('d3i.items')
                .insert(itemsToInsert, 'id')
                .map(function (insertedItemId) {
                    return pg('hero_item').insert({
                        hero_id: heroId,
                        item_id: insertedItemId
                    });
                });

            var insertStats = pg('d3i.hero_stats')
                .insert(_.map(hero.stats, function (value, key) {
                    return {
                        hero_id: heroId,
                        name: key,
                        value: value
                    };
                }));

            function notEmpty(skill) {
                return !!skill.skill;
            }

            var insertActiveSkills = pg('d3i.hero_skills')
                .insert(hero.skills.active.filter(notEmpty).map(function (skill) {
                    if (skill)
                        return {
                            hero_id: heroId,
                            skill_id: skill.skill.skillCalcId,
                            rune_id: skill.rune.skillCalcId
                        };
                }));
            var insertPassiveSkills = pg('d3i.hero_skills')
                .insert(hero.skills.passive.filter(notEmpty).map(function (skill) {
                    if (skill)
                        return {
                            hero_id: heroId,
                            skill_id: skill.skill.skillCalcId
                        };
                }));

            return Promise.join(insertItems, insertStats, insertActiveSkills, insertPassiveSkills);
        });
    };
};