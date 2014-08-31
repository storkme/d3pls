CREATE USER d3i_user WITH PASSWORD 'pls';
GRANT ALL PRIVILEGES ON DATABASE d3i TO d3i_user;

CREATE DATABASE d3i;
USE d3i;

CREATE TYPE item_slot AS ENUM (
    'head', 'torso', 'feet', 'hands', 'shoulders', 'legs', 'bracers',
    'mainHand', 'offHand', 'waist', 'rightFinger', 'leftFinger', 'neck'
);

CREATE TYPE skill_type AS ENUM (
    'passive','skill', 'rune'
);

create table hero (
    id SERIAL PRIMARY KEY,
    hero_id integer not null UNIQUE,
    name text not null,
    class text not null,
    level integer not null,
    battle_tag text not null,
    ranking_tier integer not null,
    ranking_time text not null,
    last_updated integer not null,
    paragon_level integer not null,
    host text not null,
    hardcore boolean not null
);

create table hero_stats (
    hero_id integer not null REFERENCES hero (id),
    name text not null,
    value real not null
);

create table items (
    id SERIAL PRIMARY KEY,
    hero_id integer not null REFERENCES hero (id),
    item_id text not null,
    name text not null,
    icon text not null,
    color text not null,
    tooltip_params text not null,
    slot item_slot not null,
    data json
);

create table hero_skills (
    hero_id integer not null REFERENCES hero (id),
    skill_id text not null,
    rune_id text
);

create table skills (
    id text not null,
    parent_id text,
    slug text not null,
    name text not null,
    level integer not null,
    tooltip text not null,
    description text not null,
    class text not null,
    icon text,
    type  skill_type not null,
    unique(id, parent_id, class, type)
);