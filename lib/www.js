/**
 * Created by stork on 31/08/2014.
 */

var express = require('express'),
    knex = require('knex'),
    morgan = require('morgan'),
    Promise = require('bluebird');

module.exports = function (connectionString, options) {
    var app = express();

    app.use(morgan('combined'));
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', options.origin || 'http://d3.not.gd');
        res.header('Access-Control-Allow-Methods', 'GET');
        next();
    });
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

    app.get('/stats/', function (req, res, next) {
        /* select hero.class, sk.name as skill, ru.name as rune, count(*) as count
         from d3i.hero_skills hs
         join d3i.hero hero on hero.id = hs.hero_id
         join d3i.skills sk on sk.id = hs.skill_id and sk.type = 'skill' and sk.class = hero.class
         join d3i.skills ru on ru.id = hs.rune_id and ru.parent_id = hs.skill_id and ru.type = 'rune' and ru.class = hero.class
         group by skill, rune, hero.class
         order by hero.class, count desc;*/
        var hardcore = req.query.hardcore === 'true',
            host = req.query.host || 'us.battle.net';
        var whereClause = (hardcore ? '' : 'NOT ') + "hero.hardcore \
            AND hero.host = '" + host + "'";

        pg.raw("select hero.class, sk.name as skill, ru.name as rune, count(*) as count, avg(hero.ranking_tier) as avgRank, \
                avg(hero.paragon_level) as avgParagon \
            from hero_skills hs \
            join hero hero on hero.id = hs.hero_id \
            join skills sk on sk.id = hs.skill_id and sk.type = 'skill' and sk.class = hero.class \
            join skills ru on ru.id = hs.rune_id and ru.parent_id = hs.skill_id and ru.type = 'rune' and ru.class = hero.class \
            WHERE " + whereClause + " \
            group by skill, rune, hero.class \
            order by hero.class, count desc", [])
            .then(function (result) {
                var rows = result.rows.map(function(row) {
                     row.count = parseInt(row.count);
                });
                res.status(200).json(result.rows);
            }).catch(next);
    });

    app.listen(options.port || 8080);
};