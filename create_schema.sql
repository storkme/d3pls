CREATE TYPE d3i.item_slot AS ENUM (
    'head', 'torso', 'feet', 'hands', 'shoulders', 'legs', 'bracers', 'mainHand', 'waist',
    'rightFinger', 'leftFinger', 'neck'
);

create table d3i.hero (
    id SERIAL,
    hero_id integer not null,
    name varchar(50) not null,
    class varchar(50) not null,
    level integer not null,
    battle_tag varchar(50) not null,
    ranking_tier integer not null,
    ranking_time varchar(50) not null,
    last_updated integer not null
);

create table d3i.hero_stats (
    hero_id integer not null,
    name varchar(50) not null,
    value real not null
);

create table d3i.items (
    id SERIAL,
    item_id varchar(50) not null,
    name varchar(50) not null,
    icon varchar(50) not null,
    color varchar(50) not null,
    tooltip_params varchar(1000) not null,
    slot d3i.item_slot not null
);

create table d3i.hero_item (
    hero_id integer not null,
    item_id integer not null
);

create table d3i.hero_skills (
    hero_id integer not null,
    skill_id varchar(2) not null,
    rune_id varchar(2)
);