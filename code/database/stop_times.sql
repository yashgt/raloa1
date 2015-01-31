SELECT 
rst.trip_id as trip_id
,rst.time as arrival_time
,rst.time as departure_time
,rs.stop_id as stop_id 
,rs.sequence as stop_sequence
from routestop rs inner join routestoptrip rst inner join trip t
on rs.route_stop_id=rst.route_stop_id AND rst.trip_id=t.trip_id
where t.fleet_id=@fleet_id
;