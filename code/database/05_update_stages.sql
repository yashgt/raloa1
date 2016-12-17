delimiter //
drop procedure if exists update_stages//
create procedure update_stages()
begin
	declare done integer;
	declare c_route_id integer;

	declare c_missing_routes cursor for select route_id from route R where R.fleet_id=2	;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        open c_missing_routes;
	set done = false;

        get_missing_route : loop
            fetch c_missing_routes into c_route_id;
            IF done THEN 
                LEAVE get_missing_route;
            END IF;
	select c_route_id;

update stage SG
inner join (

select Ex.route_id as route_id, Ex.stage_id as stage_id, Ex.seq as seq, (@row_number:=@row_number + 1) AS rank
from
(
	select R.route_id as route_id, SG.stage_id as stage_id, min(RS.sequence) as seq
	from stage SG
	inner join routestop RS on (SG.stage_id=RS.stage_id)
	inner join route R on (SG.route_id=R.route_id)
	where R.fleet_id=2 
	and R.route_id=c_route_id
	group by R.route_id, SG.stage_id
	order by min(RS.sequence)
) Ex
,(SELECT @row_number:=0) AS t
) Ex1 on (SG.route_id=Ex1.route_id and SG.stage_id=Ex1.stage_id)
set SG.sequence=Ex1.rank

;

        end loop get_missing_route;
end//

call update_stages()//
