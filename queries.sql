-- popular passives
select hero.class, sk.name as skill, count(*) as count
    from hero_skills hs
        join skills sk on sk.id = hs.skill_id and sk.type = 'passive' and hs.rune_id is null
        join hero hero on hero.id = hs.hero_id
    where not hero.hardcore
    group by skill, hero.class
    order by hero.class, count desc;

select hero.class, sk.name as skill, count(*) as count
        from hero_skills hs
        inner join hero hero on hero.id = hs.hero_id
        inner join skills sk on sk.id = hs.skill_id and sk.type = 'passive' and sk.class = hero.class
        WHERE hero.class='barbarian' and not hero.hardcore
        group by sk.name, hero.class
        order by hero.class, count desc;

select hero.class
    from d3i.hero
    order by hero.ranking_tier desc
    limit 10;

SELECT class, hardcore, host, count(*), min(ranking_tier) min_tier, max(ranking_tier) as max_tier, avg(ranking_tier) as avg_tier,
        min(paragon_level) as min_paragon, max(paragon_level) as max_paragon, avg(paragon_level)
        as avg_paragon,
        avg(last_updated) as age
    FROM hero
    GROUP BY class, hardcore, host





select sk.name as skill, count(*) as count
        from hero_skills hs
        inner join hero hero on hero.id = hs.hero_id
        inner join skills sk on sk.id = hs.skill_id and sk.type = 'passive' and sk.class = hero.class
        group by sk.name
        order by count desc;