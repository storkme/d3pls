-- popular active skills + runes
select sk.name as skill, ru.name as rune, count(*) as count
    from d3i.hero_skills hs
        join d3i.skills sk on sk.id = hs.skill_id and sk.type = 'skill' and sk.class = 'barbarian'
        join d3i.skills ru on ru.id = hs.rune_id and ru.parent_id = hs.skill_id and ru.type = 'rune' and ru.class = 'barbarian'
        join d3i.hero hero on hero.id = hs.hero_id
    where hero.class = 'barbarian'
    group by skill, rune
    order by count desc;

-- popular passives
select sk.name as skill, count(*) as count
    from d3i.hero_skills hs
        join d3i.skills sk on sk.id = hs.skill_id and sk.type = 'passive' and hs.rune_id is null
        join d3i.hero hero on hero.id = hs.hero_id
    group by skill
    order by count desc;