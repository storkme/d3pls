/**
 * Created by stork on 27/08/2014.
 */
var _ = require('underscore'),
    Promise = require('bluebird'),
    knex = require('knex');

function notEmpty(skill) {
    return !!skill.skill;
}

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
            skills: {},
            passives: {}
        };

    function saveSkill(skill) {
        var isRune = !!skill.type;
        var obj = allSkills[isRune ? 'runes' : 'skills'][skill.skillCalcId];
        if (obj[skill.skillCalcId])
            return;
        var entry = obj[skill.skillCalcId] = {
            slug: skill.slug,
            name: skill.name,
            level: skill.level,
            tooltip_url: skill.tooltipUrl || skill.tooltipParams,
            description: skill.description,
            simple_description: skill.simpleDescription,
            skill_calc_id: skill.skillCalcId
        };
        if (!isRune) {
            entry.is_passive = !!(skill.flavor);
        }
        if (skill.type)
            entry.type = skill.type;
        if (skill.icon)
            entry.icon = skill.icon;
        if (skill.order)
            entry.order = skill.order;
        if (skill.categorySlug)
            entry.category_slug = skill.categorySlug;
        if (skill.flavor)
            entry.flavor = skill.flavor;
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
            }), heroObj = {
                hero_id: hero.id,
                name: hero.name,
                class: hero.class,
                level: hero.level,
                battle_tag: hero.profile.battleTag,
                ranking_tier: hero.profile.ranking.tier,
                ranking_time: hero.profile.ranking.time,
                last_updated: hero['last-updated']
            };

            return pg('d3i.hero').select('*').where('hero_id', hero.id)
                .then(function (rows) {
                    if (rows.length > 0)
                        return pg('d3i.hero').where('hero_id', hero.id)
                            .update(heroObj)
                            .then(function () {
                                console.log("Updating hero " + hero.toString());
                                return Promise.join(
                                    pg('d3i.hero_item').where('hero_id', hero.id).del(),
                                    pg('d3i.hero_stats').where('hero_id', hero.id).del(),
                                    pg('d3i.hero_skills').where('hero_id', hero.id).del()
                                );
                            }).return(rows[0].id);
                    else
                        return pg('d3i.hero').insert(heroObj, 'id')
                            .then(function (heroIds) {
                                return heroIds[0];
                            });
                }).then(function (heroId) {
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

                    var insertActiveSkills = pg('d3i.hero_skills')
                        .insert(hero.skills.active.filter(notEmpty).map(function (skill) {
                            saveSkill(skill.skill);
                            saveSkill(skill.rune);
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
            return Promise.join(pg('d3i.skills').del(), pg('d3i.runes').del()).then(function () {
                return Promise.join(pg('d3i.skills').insert(skills), pg('d3i.runes').insert(runes));
            });
        }
    };
};