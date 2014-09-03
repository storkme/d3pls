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
            connection: connectionString
        }),
        allSkills = {};

    function saveSkill(skill, type, clss) {
        if (!allSkills[skill.slug]) {
            var obj = {
                slug: skill.slug,
                name: skill.name,
                level: skill.level,
                tooltip: skill.tooltipUrl || skill.tooltipParams,
                description: skill.description,
                id: skill.skillCalcId,
                type: type,
                'class': clss
            };
            if (type === 'rune')
                obj.parent_id = skill.parentSkillId;
            if (skill.icon)
                obj.icon = skill.icon;
            allSkills[skill.slug] = obj;
        }
    }

    return {
        saveHero: function (hero) {
            var heroObj = {
                hero_id: hero.id,
                name: hero.name,
                class: hero.class,
                level: hero.level,
                battle_tag: hero.profile.battleTag,
                ranking_tier: hero.profile.ranking.tier,
                ranking_time: hero.profile.ranking.time,
                last_updated: hero['last-updated'],
                paragon_level: hero.profile.paragonLevel,
                host: hero.profile.host,
                seasonCreated: hero.seasonal ? hero.seasonCreated : null,
                hardcore: hero.hardcore
            };

            return pg('hero').select('*').where('hero_id', hero.id)
                .then(function (rows) {
                    if (rows.length > 0) {
                        var id = rows[0].id;
                        return pg('hero').where('hero_id', hero.id)
                            .update(heroObj)
                            .then(function () {
                                console.log("Updating hero " + hero.toString());
                                return Promise.join(
                                    pg('hero_stats').where('hero_id', id).del(),
                                    pg('items').where('hero_id', id).del(),
                                    pg('hero_skills').where('hero_id', id).del()
                                );
                            }).return(rows[0].id);
                    } else {
                        return pg('hero').insert(heroObj, 'id')
                            .then(function (heroIds) {
                                return heroIds[0];
                            });
                    }
                }).then(function (heroId) {
                    var insertItems = pg('items')
                        .insert(_.map(hero.items, function (item, slot) {
                            return {
                                hero_id: heroId,
                                item_id: item.id,
                                name: item.name,
                                icon: item.icon,
                                color: item.displayColor,
                                tooltip_params: item.tooltipParams,
                                slot: slot,
                                data: JSON.stringify(item.data)
                            };
                        }));

                    var insertStats = pg('hero_stats')
                        .insert(_.map(hero.stats, function (value, key) {
                            return {
                                hero_id: heroId,
                                name: key,
                                value: value
                            };
                        }));

                    var insertActiveSkills = pg('hero_skills')
                        .insert(hero.skills.active.filter(notEmpty).map(function (skill) {
                            skill.rune.parentSkillId = skill.skill.skillCalcId;
                            saveSkill(skill.skill, 'skill', hero.class);
                            saveSkill(skill.rune, 'rune', hero.class);
                            return {
                                hero_id: heroId,
                                skill_id: skill.skill.skillCalcId,
                                rune_id: skill.rune.skillCalcId
                            };
                        }));
                    var insertPassiveSkills = pg('hero_skills')
                        .insert(hero.skills.passive.filter(notEmpty).map(function (skill) {
                            saveSkill(skill.skill, 'passive', hero.class);
                            return {
                                hero_id: heroId,
                                skill_id: skill.skill.skillCalcId
                            };
                        }));

                    return Promise.join(insertItems, insertStats, insertActiveSkills, insertPassiveSkills)
                        .return(hero);
                });
        },
        saveSkills: function (clss) {
            console.log("Saving skills...");
            var skills = _(allSkills).values();
            if (skills.length > 0) {
                return Promise.all(skills.map(function (skill) {
                    return pg
                        .raw("insert into skills (id,parent_id,slug,name,level,tooltip,description,class,icon,type) \
                            SELECT ?,?,?,?,?,?,?,?,?,? WHERE NOT EXISTS (\
                                SELECT * FROM skills WHERE slug = ?\
                            )",
                        [skill.id, skill.parent_id, skill.slug, skill.name, skill.level, skill.tooltip,
                            skill.description, skill.class, skill.icon, skill.type, skill.slug]);
                })).then(function () {
                    allSkills = {};
                });
            }
            else return Promise.resolve();
        },
        destroy: function () {
            return pg.destroy();
        }
    };
};