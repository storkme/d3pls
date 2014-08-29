CREATE TYPE d3i.item_slot AS ENUM (
    'head', 'torso', 'feet', 'hands', 'shoulders', 'legs', 'bracers',
    'mainHand', 'offHand', 'waist', 'rightFinger', 'leftFinger', 'neck'
);

CREATE TYPE d3i.skill_type AS ENUM (
    'passive','skill', 'rune'
);

create table d3i.hero (
    id SERIAL PRIMARY KEY,
    hero_id integer not null UNIQUE,
    name text not null,
    class text not null,
    level integer not null,
    battle_tag text not null,
    ranking_tier integer not null,
    ranking_time text not null,
    last_updated integer not null
);

create table d3i.hero_stats (
    hero_id integer not null,
    name text not null,
    value real not null
);

create table d3i.items (
    id SERIAL PRIMARY KEY,
    item_id text not null,
    name text not null,
    icon text not null,
    color text not null,
    tooltip_params text not null,
    slot d3i.item_slot not null
);

create table d3i.hero_item (
    hero_id integer not null,
    item_id integer not null
);

create table d3i.hero_skills (
    hero_id integer not null,
    skill_id text not null,
    rune_id text
);

create table d3i.skills (
    id text not null,
    parent_id text,
    slug text not null,
    name text not null,
    level integer not null,
    tooltip text not null,
    description text not null,
    class text not null,
    icon text,
    type d3i. skill_type not null,
    unique(id, parent_id, class, type)
);

grant usage on schema d3i to d3i;
grant all privileges on all sequences in schema d3i to d3i;
grant all privileges on all tables in schema d3i to d3i;