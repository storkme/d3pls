create table skills (
    id SERIAL,
    slug varchar(30) not null,
    name varchar(30) not null,
    icon varchar(50) not null,
    level integer not null,
    category_slug varchar(30) not null,
    tooltip_url varchar(50) not null,
    description varchar(500) not null,
    simple_description varchar(250),
    flavor varchar(500),
    skill_calc_id varchar(5) not null,
    is_passive boolean
);

create table runes (
    id SERIAL,
    slug varchar(30) not null,
    type varchar(5) not null,
    level integer not null,
    category_slug varchar(30) not null,
    tooltip_params varchar(50) not null,
    description varchar(500) not null,
    simple_description varchar(250) not null,
    skill_calc_id varchar(5) not null,
    'order' integer not null,
);

create table items (
    id SERIAL,
    item_id varchar(50) not null,
    name varchar(50) not null,
    icon varchar(50) not null,
    color varchar(50) not null,
    tooltip_params varchar(1000) not null
);

create table hero_stats (
    hero_id integer not null,
    name varchar(50) not null,
    value real not null
);

create table hero (
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

CREATE TYPE item_slot AS ENUM (
    'head', 'torso', 'feet', 'hands', 'shoulders', 'legs', 'bracers', 'mainHand', 'waist',
    'rightFinger', 'leftFinger', 'neck'
);

create table hero_item (
    hero_id integer not null,
    item_id integer not null,
    slot item_slot not null
);

create table hero_skill (
    hero_id integer not null,
    skill_id integer not null,
    rune_id integer not null
);