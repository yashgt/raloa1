SELECT 
rst.trip_id as trip_id
,rst.time as arrival_time
,rst.time as departure_time
,case T.direction when 0 then rs.stop_id else rs.peer_stop_id end as stop_id 
,case T.direction when 0 then rs.sequence else (select max(sequence) from routestop where route_id=rs.route_id)-rs.sequence+1 end as stop_sequence
from routestop rs 
inner join routestoptrip rst on rs.route_stop_id=rst.route_stop_id
inner join trip T on rst.trip_id=T.trip_id
where T.fleet_id=@fleet_id
order by trip_id, stop_sequence
;