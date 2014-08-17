delimiter //

drop procedure if exists add_stop//
create procedure add_stop(
	IN stop_name varchar(200)
	, IN lat float
	, IN lon float
	, OUT id int
)
begin
	insert into stop(latitude, longitude, name) values ( lat, lon, stop_name) ;
	set id = LAST_INSERT_ID() ;
end//

drop procedure if exists list_stops//
create procedure list_stops()
begin
	select * from stop;
end//

drop procedure if exists list_astops//
create procedure list_astops(IN term varchar(20))
begin
	select * from stop where name LIKE concat(term, '%') ;
end//

drop procedure if exists list_routes//
create procedure list_routes()
begin
select
R.route_id as routeId
,S1.name as start_stop_name
,S2.name as end_stop_name

from route R
inner join routestop RS1 on (R.route_id=RS1.route_id)
inner join stop S1 on (RS1.stop_id = S1.stop_id)

inner join routestop RS2 on (R.route_id=RS2.route_id)
inner join stop S2 on (RS2.stop_id = S2.stop_id)
where RS1.sequence=1
and RS2.sequence = ( select max(sequence) from routestop RS where RS.route_id = R.route_id ) ;
end//

drop procedure if exists route_detail//
create procedure route_detail(
IN routeId int
)

begin

select S.stop_id as stop_id, S.name as stop_name, S.latitude as latitude, S.longitude as longitude, time
from stop S inner join routestop RS1 on (S.stop_id=RS1.stop_id) left outer join routestop RS2 on (RS1.sequence+1=RS2.sequence AND RS2.route_id=routeId) left outer join segment on (stop1_id=RS1.stop_id AND stop2_id=RS2.stop_id)
where RS1.route_id = routeId
order by RS1.sequence asc;

select trip_id, direction
from trip
where route_id = routeId;

select T.trip_id as trip_id , RST.time as time , S.stop_id as stop_id
from trip T , routestoptrip RST , routestop RS , STOP S 
where T.trip_id = RST.trip_id and RST.route_stop_id = RS.route_stop_id and RS.stop_id = S.stop_id and T.route_id = routeId;

end//

drop procedure if exists save_route//
create procedure save_route(
	  IN in_route_id int
	, OUT route_id int
)
begin
if in_route_id = 0 then
INSERT INTO route(is_deleted) VALUES (0);
set route_id = LAST_INSERT_ID() ;
else
set route_id= in_route_id;
end if;
end//

drop procedure if exists add_stop_to_route//
create procedure add_stop_to_route(
	IN stop_id int
	, IN route_id int
	, IN sequence int
	, IN rev_sequence int
	, OUT rs_id int
)
begin
	insert into routestop(stop_id, route_id, sequence, rev_sequence) values (stop_id, route_id, sequence, rev_sequence) ;
	set rs_id = LAST_INSERT_ID() ;	
end//

drop procedure if exists add_trip//
create procedure add_trip(
	  IN in_route_id int
	, IN direction BOOLEAN
	, IN in_trip_id int
	, OUT trip_id int)
begin
if in_trip_id < 0 then
INSERT INTO trip(direction,route_id)
VALUES (direction,in_route_id);
set trip_id = LAST_INSERT_ID() ;
else
set trip_id = in_trip_id;
end if;
end //

drop procedure if exists set_route_stop_trip_time//
create procedure set_route_stop_trip_time(
	  IN in_route_id int
	, IN in_stop_id int
	, IN in_trip_id int
	, IN save_time time)
begin
INSERT INTO routestoptrip
(`route_stop_id`,`trip_id`,`time`)
VALUES
((SELECT route_stop_id FROM routestop WHERE stop_id=in_stop_id AND route_id=in_route_id) 
,in_trip_id
,save_time);
end//

drop procedure if exists list_trips//
create procedure list_trips(
	IN location_stop varchar(200)
	,IN target_stop varchar(200)
	,IN after_time varchar(20)
	,IN before_time varchar(20)
)
begin
	select 
    SS.name as start_name
    ,ES.name as end_name
	,S1.name as location
	, RST1.time as location_time
	, S2.name as target
	, RST2.time as target_time
from 
route R
inner join trip T on (R.route_id=T.route_id)
inner join routestop SRS on ( R.route_id = SRS.route_id and 
	SRS.sequence = (
		select 
			case T.direction 
				when 0 then 1
				else max(sequence)
			end
		from routestop A where A.route_id = R.route_id
	)

)
inner join stop SS on (SRS.stop_id = SS.stop_id)

inner join routestop ERS on ( R.route_id = ERS.route_id and 
	ERS.sequence = (
		select 
			case T.direction 
				when 0 then max(sequence)
				else 1
			end
		from routestop A where A.route_id = R.route_id
	)

)
inner join stop ES on (ERS.stop_id = ES.stop_id)

inner join routestop RS1 on (R.route_id = RS1.route_id )	
inner join stop S1 on ( RS1.stop_id = S1.stop_id and S1.name like location_stop)
inner join routestoptrip RST1 on (RST1.route_stop_id = RS1.route_stop_id and RST1.trip_id=T.trip_id and RST1.time between after_time and before_time)

inner join routestop RS2 on (R.route_id = RS2.route_id)
inner join stop S2 on ( RS2.stop_id = S2.stop_id and S2.name like target_stop)
inner join routestoptrip RST2 on (RST2.route_stop_id = RS2.route_stop_id and RST2.trip_id=T.trip_id 
	and 
	case T.direction
		when 0 then RS1.sequence < RS2.sequence
		else RS2.sequence < RS1.sequence
	end
	);


end//

drop procedure if exists add_segment//
create procedure add_segment(
	IN stop1_id_var int , 
	IN stop2_id_var int , 
	IN distance float,
	IN time int 
	)

begin 
	declare v_count int;
	select count(*) into v_count from segment where stop1_id=stop1_id_var and stop2_id=stop2_id_var ;
	if v_count=0 THEN 
     insert into segment(stop1_id, stop2_id, distance, time) values (stop1_id_var, stop2_id_var, distance, time); 
	END IF; 
end//

drop procedure if exists get_segment//
create procedure get_segment(
	IN stop1_id_var int , 
	IN stop2_id_var int
)
begin
select distance
from segment
where stop1_id=stop1_id_var AND stop2_id=stop2_id_var;
end//

drop procedure if exists update_busLocation//
create procedure update_busLocation(
	IN id int
	, IN lat float
	, IN lng float
)
begin
	declare v_count int;
	select count(*) into v_count from location where bus_id = id;
	if v_count=0 THEN 
    insert into location(bus_id, latitude, longitude) values (id, lat, lng);
	ELSE UPDATE location
	SET latitude = lat , longitude = lng
	WHERE bus_id = id;
	END IF;
end//

drop procedure if exists list_etrips//
create procedure list_etrips(
	IN fromStopId varchar(200)
	,IN toStopId varchar(200)
	,IN after_time varchar(20)
	,IN before_time varchar(20)
)
begin
	select 
    B.bus_id as busid
    
from 
bus B
inner join trip T on (B.curr_trip_id = T.trip_id)
inner join routestoptrip RST on ( B.curr_trip_id = RST.trip_id) 
inner join routestop RS on ( T.route_id = RS.route_id and 
	RS.sequence = (
		select 
			case T.direction 
				when 0 then 1
				else max(sequence)
			end
		from routestop A where A.route_id = RS.route_id
	)

)
inner join stop S on (RS.stop_id = S.stop_id)

inner join routestop RS1 on ( T.route_id = RS1.route_id and 
	RS1.sequence = (
		select 
			case T.direction 
				when 0 then max(sequence)
				else 1
			end
		from routestop A where A.route_id = RS1.route_id
	)

)
inner join stop S1 on (RS1.stop_id = S1.stop_id)

inner join routestop AB on (T.route_id = AB.route_id )	
inner join stop ST1 on ( AB.stop_id = ST1.stop_id and ST1.stop_id like fromStopId)

inner join routestop AB1 on (T.route_id = AB1.route_id)
inner join stop ST2 on ( AB1.stop_id = ST2.stop_id and ST2.stop_id like toStopId)

inner join routestoptrip RRST on ((RRST.trip_id = T.trip_id ) and (RRST.time between after_time and before_time)
	and 
	case T.direction
		when 0 then AB.sequence < AB1.sequence
		else AB1.sequence < AB.sequence
	end
	);


end//

drop procedure if exists get_location//
create procedure get_location()
begin
select location.latitude, location.longitude from location;
end//


