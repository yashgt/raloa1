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
	select get_root_fleet(in_fleet_id) into root_fleet_id;
	
	select fleet_id,fleet_name,avg_speed,cen_lat,cen_lon,zoom,ne_lat,ne_lon,sw_lat,sw_lon from fleet where fleet_id=in_fleet_id;
	select stop_id,name,alias_name1,alias_name2,latitude,longitude,peer_stop_id from stop where fleet_id=root_fleet_id;
	
end//