/**
 * Created by stork on 31/08/2014.
 */

var express = require('express'),
    knex = require('knex'),
    morgan = require('morgan'),
    Promise = require('bluebird'),
    whitelist = ['http://d3.not.gd', 'http://localhost:9001'];

module.exports = function (connectionString, options) {
    var app = express();

    app.use(morgan('combined'));
    app.use(require('cors')({
        origin: function (origin, callback) {
            callback(null, whitelist.indexOf(origin) !== -1);
        }
    }));
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.status(500).json({error: err});
    });

    var pg = knex({
        client: 'pg',
        connection: connectionString,
        pool: {
            min: 0,
            max: 5
        }
    });

    app.get('/hero/:id', function (req, res, next) {
        var hero = pg('hero').where('hero.id', req.params.id).select('*').first(),
            stats = pg('hero_stats').where('hero_id', req.params.id).select('*'),
            items = pg('items').where('hero_id', req.params.id).select('*'),
            skills = pg('hero_skills').where('hero_id', req.params.id).select('*');
        Promise.join(hero, stats, items, skills)
            .spread(function (hero, stats, items, skills) {
                hero.stats = stats;
                hero.items = items;
                hero.skills = skills;
                return hero;
            })
            .then(function (hero) {
                res.status(200).json(hero);
            })
            .catch(next);
    });

    app.get('/heroes', function (req, res) {

    });

    app.get('/stats', function (req, res, next) {
        pg.raw("SELECT class, hardcore, seasoncreated, host, count(*), min(ranking_tier) min_tier, max(ranking_tier) as max_tier, avg(ranking_tier) as avg_tier, \
            min(paragon_level) as min_paragon, max(paragon_level) as max_paragon, avg(paragon_level) as avg_paragon, \
            avg(last_updated) as age \
            FROM hero\
            GROUP BY class, hardcore, host, seasoncreated")
            .then(function (results) {
                res.status(200).json(results.rows);
            })
            .catch(next);
    });

    app.get('/stats/:class/:type', function (req, res, next) {
        var type = req.params.type;
        if (type !== 'actives' && type !== 'passives') {
            return next(new Error("Invalid stat type", 400));
        }
        var hardcore = req.query.hardcore === 'true',
            host = req.query.host || 'us.battle.net',
            clss = req.params.class,
            season = req.query.season,
            limit = req.query.limit;
        if (limit && (limit != 10 && limit != 50 && limit != 100)) {
            return next(new Error("Invalid limit", 400));
        }
        var whereClause = (hardcore ? '' : 'NOT ') + "hero.hardcore \
            AND hero.host = ? \
            AND hero.class = ? \
            AND hero.seasoncreated " + (season ? '= ?' : 'IS NULL'),
            heroTable = "(SELECT * FROM hero \
                    WHERE hero.class = ? \
                    ORDER BY hero.ranking_tier DESC \
                    LIMIT " + limit + " \
                )";

        var query;
        if (type === 'actives') {
            query = "select hero.class, sk.name as skill, ru.name as rune, count(*) as count \
            from hero_skills hs \
            join " + (limit ? heroTable : 'hero') + " hero on hero.id = hs.hero_id \
            join skills sk on sk.id = hs.skill_id and sk.type = 'skill' and sk.class = hero.class \
            join skills ru on ru.id = hs.rune_id and ru.parent_id = hs.skill_id and ru.type = 'rune' and ru.class = hero.class \
            WHERE " + whereClause + " \
            group by skill, rune, hero.class \
            order by hero.class, count desc";
        } else if (type === 'passives') {
            query = "select hero.class, sk.name as skill, count(*) as count \
            from hero_skills hs \
            join " + (limit ? heroTable : 'hero') + " hero on hero.id = hs.hero_id \
            join skills sk on sk.id = hs.skill_id and sk.type = 'passive' and sk.class = hero.class and hs.rune_id is null\
            WHERE " + whereClause + " \
            group by skill, hero.class \
            order by hero.class, count desc";
        }

        //                avg(hero.ranking_tier) as avgRank, \
        //                avg(hero.paragon_level) as avgParagon \
        var params = [host, clss];
        if (limit)
            params.unshift(clss);
        if (season)
            params.push(season);
        pg.raw(query, params)
            .then(function (result) {
                var rows = result.rows.map(function (row) {
                    row.count = parseInt(row.count);
                    return row;
                });
                res.status(200).json(rows);
            }).catch(next);
    });

    app.listen(options.port || 8080);
};