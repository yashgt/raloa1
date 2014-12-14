delimiter //


drop procedure if exists get_location//
create procedure get_location(
	IN stop_name varchar(200)
	)
begin
	select latitude,longitude 
	from stop 
	where stop.name like stop_name ;
end//


drop function if exists hierarchy_connect_by_parent_eq_prior_id //
CREATE FUNCTION hierarchy_connect_by_parent_eq_prior_id(value INT) RETURNS INT
NOT DETERMINISTIC
READS SQL DATA
BEGIN
        DECLARE _id INT;
        DECLARE _parent INT;
        DECLARE _next INT;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET @id = NULL;

        SET _parent = @id;
        SET _id = -1;

        IF @id IS NULL THEN
                RETURN NULL;
        END IF;

        LOOP
                SELECT  MIN(fleet_id)
                INTO    @id
                FROM    fleet
                WHERE   parent_fleet_id = _parent
                        AND fleet_id > _id;
                IF @id IS NOT NULL OR _parent = @start_with THEN
                        SET @level = @level + 1;
                        RETURN @id;
                END IF;
                SET @level := @level - 1;
                SELECT  fleet_id, parent_fleet_id
                INTO    _id, _parent
                FROM    fleet
                WHERE   fleet_id = _parent;
        END LOOP;       
END//

drop procedure if exists list_user_fleets//
create procedure list_user_fleets(in in_user_id int)
begin
declare user_fleet_id int;
select fleet_id into user_fleet_id from user where user_id=in_user_id;

SELECT  fleet_id as fleet_id, fleet_name, parent_fleet_id as parent_fleet_id, 0 as level
from fleet where fleet_id=user_fleet_id
union all
SELECT  hi.fleet_id as fleet_id, hi.fleet_name as fleet_name, hi.parent_fleet_id as parent_fleet_id, level
FROM    (
        SELECT  hierarchy_connect_by_parent_eq_prior_id(fleet_id) AS fleet_id, @level AS level
        FROM    (
                SELECT  @start_with := user_fleet_id, 
                        @id := @start_with ,
                        @level := 0
                ) vars	, fleet
        WHERE   @id IS NOT NULL
        ) ho
JOIN    fleet hi
ON      hi.fleet_id = ho.fleet_id;
end//

call list_user_fleets(1);

drop function if exists get_root_fleet //
create function get_root_fleet(in_fleet_id INT) RETURNS INT
begin
	DECLARE par_fleet_id INT;
	DECLARE cur_fleet_id INT;
	SET cur_fleet_id := in_fleet_id;
	SET par_fleet_id := in_fleet_id;
	
	LOOP
		select parent_fleet_id, fleet_id into par_fleet_id, cur_fleet_id
		from fleet
		where fleet_id=cur_fleet_id
		and parent_fleet_id<>1;
		
		if par_fleet_id = cur_fleet_id then
			return par_fleet_id;
		end if;
		set cur_fleet_id := par_fleet_id ;
	END LOOP;
	
end//
select get_root_fleet(3);
select get_root_fleet(4);
select get_root_fleet(2);
select get_root_fleet(1);

drop procedure if exists save_stop//
create procedure save_stop(
	INOUT id int
	, IN stop_name varchar(200)
	, IN lat float
	, IN lon float
	, IN fleet_id int
	, IN in_peer_stop_id int
)
begin
	if id > 0 then /*Existing stop is being modified*/
		update stop
		set latitude=lat, longitude=lon, name=stop_name
		where stop_id=id;
		
		update stop
		set latitude=lat, longitude=lon, name=stop_name
		where peer_stop_id=id;		

	else /*New or peer stop is being created*/
		insert into stop(fleet_id, latitude, longitude, name, peer_stop_id) 
		values ( fleet_id, lat, lon, stop_name, in_peer_stop_id) ;
		set id = LAST_INSERT_ID() ;
		
		if in_peer_stop_id > 0 then
			update stop
			set peer_stop_id=id
			where stop_id=in_peer_stop_id;		
		
		end if;
	end if;
end//

drop procedure if exists csvtodb//
create procedure csvtodb(
	  IN stop_id int
	, IN lat float
	, IN lon float
	, IN stop_name varchar(200)
)
begin
		insert into stop(stop_id, latitude, longitude, name) 
		values ( stop_id, lat, lon, stop_name) ;
end//

drop procedure if exists get_fleet_detail//
create procedure get_fleet_detail(in in_fleet_id int)
begin
	declare root_fleet_id int;
	declare vfleet_name varchar(200);
	declare vavg_speed, vzoom int;
	declare	vcen_lat, vcen_lon, vne_lat, vne_lon ,vsw_lat ,vsw_lon float;
	
	select get_root_fleet(in_fleet_id) into root_fleet_id;


	select fleet_name,avg_speed,cen_lat,cen_lon,zoom,ne_lat,ne_lon,sw_lat,sw_lon 
	into vfleet_name,vavg_speed,vcen_lat,vcen_lon,vzoom,vne_lat,vne_lon,vsw_lat,vsw_lon
	from fleet 
	where fleet_id=in_fleet_id;
	
	
	select in_fleet_id as fleet_id,vfleet_name as fleet_name,vavg_speed as avg_speed,vcen_lat as cen_lat,vcen_lon as cen_lon,vzoom as zoom,vne_lat as ne_lat,vne_lon as ne_lon,vsw_lat as sw_lat,vsw_lon as sw_lon;
	
	
	select stop_id,name,alias_name1,alias_name2,latitude,longitude,peer_stop_id from stop where fleet_id=root_fleet_id;
	
end//

drop procedure if exists save_route//
create procedure save_route(
	  INOUT id int
	, IN in_fleet_id int
	, IN in_route_name varchar(255)
	, IN in_start_stop int
	, IN in_end_stop int
	, IN in_gtfs_id int
)
begin
if id = 0 then
INSERT INTO route(fleet_id, route_name, start_stop_id, end_stop_id, gtfs_route_id) VALUES (in_fleet_id, in_route_name, in_start_stop, in_end_stop, in_gtfs_id);
set id = LAST_INSERT_ID() ;
else
update route
set route_name=in_route_name
where route_id=id;
end if;
end//

drop procedure if exists save_stage//
create procedure save_stage(
	INOUT id int
	, IN in_route_id int
	, IN in_stage_name varchar(255)
)
begin
if id > 0 then
update stage
set stage_name=in_stage_name
where stage_id-id;
else
INSERT INTO stage(stage_name, route_id) VALUES (in_stage_name, in_route_id);
set id = LAST_INSERT_ID() ;
end if;
end//

drop procedure if exists save_route_stop//
create procedure save_route_stop(
	  IN in_stop_id int
	, IN in_route_id int
	, IN in_stage_id int
	, IN in_sequence int
)
begin
if exists (SELECT * FROM routestop WHERE stop_id = in_stop_id AND route_id=in_route_id) then
update routestop
set stage_id=in_stage_id, sequence=in_sequence
where stop_id = in_stop_id AND route_id=in_route_id;
else
INSERT INTO routestop(stop_id, route_id, stage_id, sequence) VALUES (in_stop_id, in_route_id, in_stage_id, in_sequence);
end if;
end//

drop procedure if exists get_route_detail//
create procedure get_route_detail(
	IN in_route_id int
)
begin
	select SG.stage_id, SG.stage_name, S.stop_id, S.name, PS.stop_id, PS.stop_name
	from route R
	inner join routestop RS on (RS.route_id=R.route_id)
	inner join stop S on (RS.stop_id=S.stop_id)
	inner join stage SG on (SG.route_id=R.route_id)
	left outer join stop PS on (PS.peer_stop_id=S.stop_id)
	where R.route_id=in_route_id
	order by RS.sequence;
	
	select T.trip_id, T.direction, T.frequency_trip
	from 
	route as R
	inner join trip as T on (R.route_id = T.route_id)
	order by T.trip_id;
	
	select T.trip_id, RS.stop_id, RST.time
	from 
	route as R
	inner join trip as T on (R.route_id = T.route_id)
	inner join routestop as RS on (R.route_id=RS.route_id)
	inner join routestoptrip as RST on (RS.route_stop_id=RST.route_stop_id)	
	where R.route_id=in_route_id
	order by RS.sequence;
	
end//
