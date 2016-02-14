alter table stop add column is_station boolean DEFAULT 0;

update stop
set is_station=1 where name like '%stand%';