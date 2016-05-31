alter table stop
add column code varchar(255);

alter table stop
add column location_status int default 2;