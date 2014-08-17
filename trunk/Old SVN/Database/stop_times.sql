delimiter //

SELECT 
rst.trip_id as trip_id
,rst.time as arrival_time
,rst.time as departure_time
,rs.stop_id as stop_id
,rs.sequence as stop_sequence
from routestop rs inner join routestoptrip rst
on rs.route_stop_id=rst.route_stop_id

//