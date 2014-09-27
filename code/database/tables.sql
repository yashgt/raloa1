DROP DATABASE goatrans;

CREATE DATABASE goatrans;

USE goatrans;

CREATE TABLE fleetgroup
(
fleetgroup_name varchar(255),
fleetgroup_id int,
username varchar(255),
password varchar(255),
PRIMARY KEY (fleetgroup_id)
);

CREATE TABLE fleet
(
fleet_name varchar(255) comment 'Agency name to be used in GTFS',
fleet_id int auto_increment,
parent_fleet_id int,
fleetgroup_id int,
gtfs_agency_id varchar(255) comment 'Agency ID to be used in generated GTFS',
fleet_type int comment '3=Bus',
avg_speed int comment 'Average speed of a bus in the fleet',
PRIMARY KEY (fleet_id),
FOREIGN KEY (fleetgroup_id) REFERENCES fleetgroup(fleetgroup_id),
FOREIGN KEY (parent_fleet_id) REFERENCES fleet(fleet_id)
)
comment 'Every Agency is listed here'
;

CREATE TABLE user
(
username varchar(255),
password varchar(255),
user_id int AUTO_INCREMENT,
fleet_id int,
role_type int comment '1=Admin, 2=Super Admin',
PRIMARY KEY (user_id),
FOREIGN KEY (fleet_id) REFERENCES fleet(fleet_id)
);

CREATE TABLE session
(
date DATE,
time TIME,
session_id int AUTO_INCREMENT,
user_id int,
PRIMARY KEY (session_id),
FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE route
(
route_id INT AUTO_INCREMENT,
gtfs_route_id int,
fleetgroup_id int,
is_deleted boolean,
route_name varchar(255),
PRIMARY KEY (route_id),
FOREIGN KEY (fleetgroup_id) REFERENCES fleetgroup(fleetgroup_id)
);


CREATE TABLE stop
(
stop_id int AUTO_INCREMENT,
fleet_id int comment 'Fleet to which the stop belongs. This is always the Root Fleet',
latitude float(10),
longitude float(10),
name varchar(255),
alias_name1 varchar(255),
alias_name2 varchar(255),
stop_loc_id int,
PRIMARY KEY (stop_id),
FOREIGN KEY (fleet_id) REFERENCES fleet(fleet_id)
);

CREATE TABLE stop_loc
(
stop_id int,
location point not null,
loc_text varchar(255),
FOREIGN KEY (stop_id) REFERENCES stop(stop_id)
,SPATIAL INDEX(location)
) ENGINE = MyISAM;

delimiter //
CREATE TRIGGER ins_stop AFTER INSERT ON stop
for each row 
begin
	declare p varchar(255);
	set p=concat('POINT(', CAST(NEW.latitude as CHAR),' ',CAST(NEW.longitude as CHAR),')') ; 
	
	insert into stop_loc(
	stop_id
	, location
	, loc_text
	) 
	values(
	NEW.stop_id
	, PointFromText(p)
	, p
	);
end;//
delimiter ;

create or replace view stop_detail
as
select S.stop_id, latitude, longitude, name, location
from stop S
inner join stop_loc L on (S.stop_id=L.stop_id);

CREATE TABLE segment
(
stop1_id int,
stop2_id int,
distance float,
time int,
FOREIGN KEY (stop1_id) REFERENCES stop(stop_id),
FOREIGN KEY (stop2_id) REFERENCES stop(stop_id)
);

CREATE TABLE routestop
(
stop_id int,
route_id int,
sequence int,
route_stop_id int AUTO_INCREMENT,
PRIMARY KEY (route_stop_id),
FOREIGN KEY (route_id) REFERENCES route(route_id),
FOREIGN KEY (stop_id) REFERENCES stop(stop_id)
);

CREATE TABLE calendar 
(
	calendar_id int AUTO_INCREMENT,
	fleet_id int,
	calendar_name varchar(255),
	start_date date,
	end_date date,
	mon boolean, tue boolean, wed boolean, thu boolean, fri boolean, sat boolean, sun boolean,
	PRIMARY KEY (calendar_id)
) comment 'Calendar followed by trips';

CREATE TABLE calendar_exceptions 
(
	fleet_id int,
	calendar_id int,
	exception_date date,
	include_exclude boolean
);

CREATE TABLE trip 
(
trip_id int AUTO_INCREMENT,
trip_name varchar(255) comment 'trip_id in GTFS',
fleet_id int,
calendar_id int comment 'Calendar followed by this trip',
direction boolean,
route_id int,
frequency_trip boolean default false comment 'True if this entry represents multiple trips spread at a given frequency',
frequency_start_time time comment 'Time at which the trips operate on a frequency',
frequency_end_time time,
frequency_gap time comment 'Time difference between 2 trips of this frequency trip',
last_upd_by int,
last_upd_on datetime, 
PRIMARY KEY (trip_id),
FOREIGN KEY (route_id) REFERENCES route(route_id),
FOREIGN KEY (fleet_id) REFERENCES fleet(fleet_id),
FOREIGN KEY (last_upd_by) REFERENCES user(user_id)
) comment 'Used for trips.txt and frequencies.txt';

CREATE TABLE trip_history
(
trip_id int ,
trip_name varchar(255),
fleet_id int,
direction boolean,
frequency_trip boolean,
frequency_start_time time,
frequency_end_time time,
last_upd_by int,
last_upd_on datetime,
FOREIGN KEY (fleet_id) REFERENCES fleet(fleet_id)
);


CREATE TABLE routestoptrip
(
route_stop_id int,
trip_id int,
time time,
FOREIGN KEY (route_stop_id) REFERENCES routestop(route_stop_id),
FOREIGN KEY (trip_id) REFERENCES trip(trip_id)
);

create table numbers
(
	num int,
	primary key (num)
);

delimiter //
CREATE PROCEDURE populate_numbers(maxval INT)
BEGIN
DECLARE v1 INT DEFAULT 1;
WHILE v1 <= maxval DO
	insert into numbers(num) values (v1);
    SET v1 = v1 + 1;
END WHILE;
END//
delimiter ;

CALL populate_numbers(1000);

create or replace view vw_stop_trips
as
select
	T.trip_id as trip_id
	, RS.stop_id as stop_id
	, case T.frequency_trip 
		when 1 then addtime(RST.time, sec_to_time(N.num*time_to_sec(T.frequency_gap)))
		else RST.time 
	end as time
from 
	route as R
	inner join trip as T on (R.route_id = T.route_id)
	inner join routestop as RS on (R.route_id=RS.route_id)
	inner join routestoptrip as RST on (RS.route_stop_id=RST.route_stop_id)	
	left outer join numbers as N on 
		(T.frequency_trip=1 and time_to_sec(timediff(T.frequency_end_time, T.frequency_start_time) )  / time_to_sec(T.frequency_gap) + 1 )
	;

