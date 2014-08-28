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
        }),
        allSkills = {
            runes: {},
            skills: {}
        };

    function saveSkill(skill) {
        var isRune = !!skill.type;
        var obj = allSkills[isRune ? 'runes' : 'skills'];
        if (obj[skill.skillCalcId])
            return;
        obj[skill.skillCalcId] = {
            slug: skill.slug,
            name: skill.name,
            icon: skill.icon,
            level: skill.level,
            category_slug: skill.categorySlug,
            tooltip_url: skill.tooltipUrl,
            description: skill.description,
            simple_description: skill.simpleDescription,
            flavor: skill.flavor,
            skill_calc_id: skill.skillCalcId,
            is_passive: isRune ? void 0 : (skill.flavor),
            order: skill.order
        };
    }

    return {
        saveHero: function (hero) {
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
                        saveSkill(skill.skill);
                        return {
                            hero_id: heroId,
                            skill_id: skill.skill.skillCalcId,
                            rune_id: skill.rune.skillCalcId
                        };
                    }));
                var insertPassiveSkills = pg('d3i.hero_skills')
                    .insert(hero.skills.passive.filter(notEmpty).map(function (skill) {
                        saveSkill(skill.skill);
                        return {
                            hero_id: heroId,
                            skill_id: skill.skill.skillCalcId
                        };
                    }));

                return Promise.join(insertItems, insertStats, insertActiveSkills, insertPassiveSkills);
            });
        },
        saveSkills: function () {
            var skills = _(allSkills.skills).values(),
                runes = _(allSkills.runes).values();
            return Promise.join(pg('d3i.skills').insert(skills), pg('d3i.runes').insert(runes));
        }
    };
};