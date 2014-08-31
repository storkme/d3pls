-- popular active skills + runesw2gy#jm1111uij
select hero.class, sk.name as skill, ru.name as rune, count(*) as count
    from d3i.hero_skills hs
        join d3i.hero hero on hero.id = hs.hero_id
        join d3i.skills sk on sk.id = hs.skill_id and sk.type = 'skill' and sk.class = hero.class
        join d3i.skills ru on ru.id = hs.rune_id and ru.parent_id = hs.skill_id and ru.type = 'rune' and ru.class = hero.class
    group by skill, rune, hero.class
    order by hero.class, count desc;

-- popular passives
select hero.class, sk.name as skill, count(*) as count
    from d3i.hero_skills hs
        join d3i.skills sk on sk.id = hs.skill_id and sk.type = 'passive' and hs.rune_id is null
        join d3i.hero hero on hero.id = hs.hero_id
    group by skill, hero.class
    order by hero.class, count desc;

select hero.class
    from d3i.hero
    order by hero.ranking_tier desc
    limit 10;