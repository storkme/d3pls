CREATE TYPE d3i.item_slot AS ENUM (
    'head', 'torso', 'feet', 'hands', 'shoulders', 'legs', 'bracers', 'mainHand', 'offHand',
    'waist',
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

create table d3i.skills (
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
    skill_calc_id varchar(5) not null UNIQUE,
    is_passive boolean not null
);

create table d3i.runes (
    id SERIAL,
    slug varchar(30) not null,
    type varchar(5) not null,
    level integer not null,
    tooltip_params varchar(50) not null,
    description varchar(500) not null,
    simple_description varchar(250) not null,
    skill_calc_id varchar(5) not null UNIQUE,
    "order" integer not null
);

grant usage on schema d3i to d3i;
grant all privileges on all sequences in schema d3i to d3i;
grant all privileges on all tables in schema d3i to d3i;