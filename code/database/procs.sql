delimiter //


drop procedure if exists Source//
create procedure Source(
	IN source_stop varchar(200)
	)
begin
	select latitude,longitude 
	from stop 
	where stop.name like source_stop ;
end//



drop procedure if exists Destination //
create procedure Destination(
	IN destination_stop varchar(200)
	)
begin
	select latitude,longitude 
	from stop 
	where stop.name like destination_stop ;
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
create procedure list_user_fleets(in user_id int)
begin

SELECT  fleet_id as fleet_id, 'Goa' as fleet_name, parent_fleet_id as parent_fleet_id, 0 as level
from fleet where fleet_id=2
union all
SELECT  hi.fleet_id as fleet_id, hi.fleet_name as fleet_name, hi.parent_fleet_id as parent_fleet_id, level
FROM    (
        SELECT  hierarchy_connect_by_parent_eq_prior_id(fleet_id) AS fleet_id, @level AS level
        FROM    (
                SELECT  @start_with := 2, 
                        @id := @start_with ,
                        @level := 0
                ) vars	, fleet
        WHERE   @id IS NOT NULL
        ) ho
JOIN    fleet hi
ON      hi.fleet_id = ho.fleet_id;
end//

drop procedure if exists save_stop//
create procedure save_stop(
	INOUT id int
	, IN stop_name varchar(200)
	, IN lat float
	, IN lon float
	, IN fleet_id int
)
begin
	if id > 0 then
		update stop
		set latitude=lat, longitude=lon, name=stop_name
		where stop_id=id;
	else
		insert into stop(fleet_id, latitude, longitude, name) 
		values ( fleet_id, lat, lon, stop_name) ;
		set id = LAST_INSERT_ID() ;
	end if;
end//

drop procedure if exists list_stops//
create procedure list_stops(in fleet_id int)
begin
	select * from stop where fleet_id=fleet_id;
end//