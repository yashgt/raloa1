insert into fleet(parent_fleet_id, fleet_name) values(null, 'No Fleet');
insert into user(username, password, fleet_id, role_type) values ('yash', 'yash123', 1, 2);


insert into fleet(fleet_name, parent_fleet_id, fleet_type, avg_speed) values ('Goa Transport', 1, 3, 30);
set @goatransid = last_insert_id();
insert into fleet(fleet_name, parent_fleet_id, fleet_type, avg_speed) values ('KTCL', @goatransid, 3, 30);
set @ktcltransid = last_insert_id();
insert into fleet(fleet_name, parent_fleet_id, fleet_type, avg_speed) values ('KTCL Shuttles', @ktcltransid, 3, 30);
insert into fleet(fleet_name, parent_fleet_id, fleet_type, avg_speed) values ('KTCL interstate', @ktcltransid, 3, 30);
insert into fleet(fleet_name, parent_fleet_id, fleet_type, avg_speed) values ('Private Buses', @goatransid, 3, 30);

insert into fleet(fleet_name, parent_fleet_id, fleet_type, avg_speed) values ('MH Transport', 1, 3, 30);

select * from fleet;
call list_user_fleets(1);