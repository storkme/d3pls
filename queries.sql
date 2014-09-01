-- popular passives
select hero.class, sk.name as skill, count(*) as count
    from hero_skills hs
        join skills sk on sk.id = hs.skill_id and sk.type = 'passive' and hs.rune_id is null
        join hero hero on hero.id = hs.hero_id
    where not hero.hardcore
    group by skill, hero.class
    order by hero.class, count desc;

select hero.class, sk.name as skill, count(*) as count, avg(hero.ranking_tier) as avgRank,
            avg(hero.paragon_level) as avgParagon
        from hero_skills hs
        join hero hero on hero.id = hs.hero_id
        join skills sk on sk.id = hs.skill_id and sk.type = 'passive' and sk.class = hero.class
        WHERE hero.class='barbarian' and not hero.hardcore
        group by skill, hero.class
        order by hero.class, count desc;

select hero.class
    from d3i.hero
    order by hero.ranking_tier desc
    limit 10;