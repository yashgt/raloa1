use avishkar;

insert into fleet(fleet_name, parent_fleet_id, fleet_type, avg_speed,cen_lat,cen_lon,ne_lat,ne_lon,sw_lat,sw_lon, zoom) 
values( 'No Fleet', null, 3, 30, 52.2681573737682,16.875, 78.56048828398782,-177.890625, -8.754794702435605,-148.359375,2);
insert into user(username, password, fleet_id, role_type) values ('yash', 'yash123', 1, 2);

insert into stage(stage_id,stage_name) values(-1,'Stages');

insert into fleet(fleet_name, parent_fleet_id, fleet_type, avg_speed,cen_lat,cen_lon,ne_lat,ne_lon,sw_lat,sw_lon, zoom,agency_lang,agency_timezone,agency_phone,agency_url) 
values ('Goa Transport', 1, 3, 30, 15.359136354931396,73.922923046875, 15.623816008758071,74.57660957031248, 15.094120426436618,73.26923652343748, 10, 'en', 'Asia/Kolkata', '(0091)0832-2438034', 'http://ktclgoa.com/');


set @goatransid = last_insert_id();
/*insert into fleet(fleet_name, gtfs_agency_id, parent_fleet_id, fleet_type, avg_speed) 
values ('Kadamba Transport Corporation', 'ktc', @goatransid, 3, 30);
*/
insert into fleet(fleet_name, gtfs_agency_id, parent_fleet_id, fleet_type, avg_speed,cen_lat,cen_lon,ne_lat,ne_lon,sw_lat,sw_lon, zoom,agency_lang,agency_timezone,agency_phone,agency_url) 
values ('Kadamba', 'ktcl-goa-in', @goatransid, 3, 30, 15.359136354931396,73.922923046875, 15.623816008758071,74.57660957031248, 15.094120426436618,73.26923652343748, 10, 'en', 'Asia/Kolkata', '+918322438034', 'http://ktclgoa.com/');
set @ktcltransid = last_insert_id();
insert into fleet(fleet_name, parent_fleet_id, fleet_type, avg_speed) values ('KTCL Shuttles', @ktcltransid, 3, 30);
insert into fleet(fleet_name, parent_fleet_id, fleet_type, avg_speed) values ('KTCL interstate', @ktcltransid, 3, 30);
insert into fleet(fleet_name, parent_fleet_id, fleet_type, avg_speed) values ('Private Buses', @goatransid, 3, 30);

insert into user(username, password, fleet_id, role_type) values ('sghate', 'sghate123', @ktcltransid, 2);

insert into fleet(fleet_name,  parent_fleet_id, fleet_type, avg_speed,cen_lat,cen_lon,ne_lat,ne_lon,sw_lat,sw_lon, zoom, agency_lang,agency_timezone,agency_phone,agency_url) 
values ('MH Transport', 1, 3, 30, 19.131336917005157,77.13573737792969, 21.193809145754596,82.29931159667967, 17.04278759928605,71.97216315917967,7, 'en', 'Asia/Kolkata', '+912223071528', 'http://www.msrtc.gov.in/' );
set @mhtransid = last_insert_id();
insert into user(username, password, fleet_id, role_type) values ('mhuser', 'mhuser123', @mhtransid, 2);

insert into calendar(fleet_id,calendar_name,start_date,end_date,mon,tue,wed,thu,fri,sat,sun) VALUES (2,'FULLW','2015-10-02','2017-09-02',1,1,1,1,1,1,1);
insert into calendar(fleet_id,calendar_name,start_date,end_date,mon,tue,wed,thu,fri,sat,sun) VALUES (2,'SUN','2015-10-02','2017-09-02',0,0,0,0,0,0,1);
insert into calendar(fleet_id,calendar_name,start_date,end_date,mon,tue,wed,thu,fri,sat,sun) VALUES (2,'SAT','2015-10-02','2017-09-02',0,0,0,0,0,1,0);

select * from fleet;
call list_user_fleets(1);
/*call generate_stops(2);*/

