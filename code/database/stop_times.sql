SELECT 
rst.trip_id as trip_id
,case rstp.time<= rst.time when true then rst.time else addtime(rst.time, '24:00:00') end as arrival_time
,case rstp.time<= rst.time when true then rst.time else addtime(rst.time, '24:00:00') end as departure_time
,case T.direction when 0 then rs.stop_id else coalesce(rs.peer_stop_id, rs.stop_id) end as stop_id 
,case T.direction when 0 then rs.sequence else (select max(sequence) from routestop where route_id=rs.route_id)-rs.sequence+1 end as stop_sequence
from routestop rs 
inner join routestoptrip rst on rs.route_stop_id=rst.route_stop_id
inner join trip T on rst.trip_id=T.trip_id
inner join routestop rsp on (rs.route_id=rsp.route_id and rsp.sequence = case T.direction when 0 then 1 else (select max(sequence) from routestop where route_id=rs.route_id) end)
inner join routestoptrip rstp on (rstp.trip_id=T.trip_id and rstp.route_stop_id=rsp.route_stop_id)
where T.fleet_id=@fleet_id
order by rs.route_id, trip_id, stop_sequence
;