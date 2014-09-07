-- actives
select hero.class, sk.name as skill, ru.name as rune, count(*) as count
    from hero_skills hs
        join hero hero on hero.id = hs.hero_id
        join skills sk on
            sk.id = hs.skill_id
            and sk.type = 'skill'
            and sk.class = hero.class
        join skills ru on
            ru.id = hs.rune_id
            and ru.parent_id = hs.skill_id
            and ru.type = 'rune'
            and ru.class = hero.class
    WHERE not hero.hardcore
          AND hero.host = 'us.battle.net'
          AND hero.seasoncreated is null
    group by skill, rune, hero.class \
    order by hero.class, count desc;

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
        and not hero.hardcore --not hardcore???
        and hero.ranking_tier > 35
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

-- barb cdr?
select foo.class, count(*), foo.total_cdr as total_cdr_excluding_paragon
    from (select hero.class,
                sum(round((data->'attributesRaw'->'Power_Cooldown_Reduction_Percent_All'->>'min')::numeric, 1)) as total_cdr
            from items
                join hero on items.hero_id = hero.id
            where
                data is not null
                and (data->'attributesRaw'->>'Power_Cooldown_Reduction_Percent_All') is not null
                and not hero.hardcore --hardcore???
            group by hero.id
        ) as foo
    group by foo.class, foo.total_cdr
    order by foo.class, foo.total_cdr desc;

select hero.class,
        sum(round((data->'attributesRaw'->'Power_Cooldown_Reduction_Percent_All'->>'min')::numeric, 1)) as total_cdr
    from items
        join hero on items.hero_id = hero.id
    where
        data is not null
        and (data->'attributesRaw'->>'Power_Cooldown_Reduction_Percent_All') is not null
        and not hero.hardcore --hardcore???
    group by hero.id;


-- actives w/ limit ?
select hero.class, sk.name as skill, ru.name as rune, count(*) as count
    from hero_skills hs
        join (
                SELECT * FROM hero
                WHERE hero.class = 'barbarian'
                ORDER BY hero.ranking_tier DESC
                LIMIT 100
            ) hero on hero.id = hs.hero_id
        join skills sk on
            sk.id = hs.skill_id
            and sk.type = 'skill'
            and sk.class = hero.class
        join skills ru on
            ru.id = hs.rune_id
            and ru.parent_id = hs.skill_id
            and ru.type = 'rune'
            and ru.class = hero.class
    WHERE not hero.hardcore
          AND hero.host = 'us.battle.net'
          AND hero.seasoncreated is null
    group by skill, rune, hero.class
    order by hero.class, count desc;


-- jewels w/ limit
select hero.class,
        data->'gems'->0->'item'->>'name' as gem,
        round(avg((data->'gems'->0->>'jewelRank')::int), 1) as avg_rank,
        count(*) as count
    from items
        join (
            select * from (
                    select row_number() over (partition by hero.class order by hero.ranking_tier desc) as r,
                    hero.* from hero
                    where not hero.hardcore
                ) t
                where t.r <= 10000
         ) hero on items.hero_id = hero.id
    where
        data is not null
        and json_array_length(data->'gems') = 1
        and data->'gems'->0->>'isJewel' = 'true'
    group by
        hero.class, gem
    having count(*) > 10
    order by hero.class, count(*) desc;

-- top few heroes from whatever ranking
select hero.class, hero.hardcore, count(*) from (
        select row_number() over (partition by hero.c2lass order by hero.ranking_tier desc) as r,
        hero.* from hero
            where hardcore
    ) hero
    where hero.r <= 100
    group by hero.class, hero.hardcore;

