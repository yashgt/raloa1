delete RS
from routestop RS
inner join route R on (RS.route_id=R.route_id and R.fleet_id=2)
where R.route_id >=230
;

delete SG
from stage SG
inner join route R on (R.route_id=SG.route_id and R.fleet_id=2)
where R.route_id >=230
;

delete RM
from internal_route_map RM
inner join route R on (R.route_id=RM.route_id and R.fleet_id=2)
where R.route_id >=230
;

delete from route
where fleet_id=2
and route_id >=230
;
