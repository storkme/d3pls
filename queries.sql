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
        WHERE hero.class='barbarian' and hero.hardcore = 't'
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
    GROUP BY class, hardcore, host;

select hero.*, skills.name from hero_skills
        inner join hero on hero.id = hero_skills.hero_id
        inner join skills on (skills.id = hero_skills.skill_id and skills.type = 'passive')
        where hero.class='barbarian';



select
    hero.*,
    hero_skills.*,
    skills.name,
    skills.id,
    skills.type
from hero
join hero_skills
    on hero_skills.hero_id = hero.id
join skills
    on skills.id = hero_skills.skill_id
        and skills.class = hero.class
        and hero_skills.rune_id is null
where hero.class = 'barbarian'
and skills.type = 'passive'
order by
    hero.id asc,
    skills.name asc;

-- hero gem summary
select hero.class,
        count(*) as count
    from items
        join hero on items.hero_id = hero.id
    where
        data is not null
        and json_array_length(data->'gems') = 1
        and data->'gems'->0->>'isJewel' = 'true'
        and not hero.hardcore
    group by
        hero.class
    order by hero.class, count(*) desc;

-- jewels
select hero.class,
        data->'gems'->0->'item'->>'name' as gem,
        avg((data->'gems'->0->>'jewelRank')::int) as avg_rank,
        count(*) as count
    from items
        join hero on items.hero_id = hero.id
    where
        data is not null
        and json_array_length(data->'gems') = 1
        and data->'gems'->0->>'isJewel' = 'true'
        and hero.hardcore --hardcore???
    group by
        hero.class, gem
    order by hero.class, count(*) desc;

-- has rorg?
select hero.class,
        hero.hardcore,
        count(*)
    from items
        join hero on items.hero_id = hero.id
    where
        items.item_id = 'Unique_Ring_107_x1'
        and hero.seasoncreated is null
    group by
        hero.class,
        hero.hardcore
    order by hero.hardcore, hero.class;

-- set items???
select hero.class,
        data->'set'->>'name' as set_name,
        count(*) as count
    from items
        join hero on items.hero_id = hero.id
    where
        data is not null
        and not hero.hardcore
        and hero.seasoncreated is null
    group by
        hero.class, set_name
    order by hero.class, count(*) desc;

-- barb items :D
