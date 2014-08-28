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

    function saveSkill(skill, type, clss) {
        if (!allSkills[type])
            allSkills[type] = {};
        if (!allSkills[type][skill.skillCalcId]) {
            var obj = {
                slug: skill.slug,
                name: skill.name,
                level: skill.level,
                tooltip: skill.tooltipUrl || skill.tooltipParams,
                description: skill.description,
                skill_calc_id: skill.skillCalcId,
                type: type,
                'class': clss
            };
            if (skill.icon)
                obj.icon = skill.icon;
            allSkills[type][skill.skillCalcId] = obj;
        }
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
                            saveSkill(skill.skill, 'skill', hero.class);
                            saveSkill(skill.rune, 'rune', hero.class);
                            return {
                                hero_id: heroId,
                                skill_id: skill.skill.skillCalcId,
                                rune_id: skill.rune.skillCalcId
                            };
                        }));
                    var insertPassiveSkills = pg('d3i.hero_skills')
                        .insert(hero.skills.passive.filter(notEmpty).map(function (skill) {
                            saveSkill(skill.skill, 'passive', hero.class);
                            return {
                                hero_id: heroId,
                                skill_id: skill.skill.skillCalcId
                            };
                        }));

                    return Promise.join(insertItems, insertStats, insertActiveSkills, insertPassiveSkills);
                });
        },
        saveSkills: function () {
            var skills = _(allSkills).chain().values().map(_.values).flatten().value();
            return pg('d3i.skills').del().then(function () {
                return pg('d3i.skills').insert(skills);
            });
        },
        destroy: function () {
            return pg.destroy();
        }
    };
};