delete 
	from internal_route_map 
	where route_id in (select route_id from route where fleet_id=7);
delete from routestop
	where route_id in (select route_id from route where fleet_id=7);
delete from route where fleet_id=7;
delete from segment 
	where from_stop_id in (select stop_id from stop where fleet_id=7)
		or
		to_stop_id in (select stop_id from stop where fleet_id=7);
SET foreign_key_checks = 0;
delete from stop where fleet_id=7;
SET foreign_key_checks = 1;

