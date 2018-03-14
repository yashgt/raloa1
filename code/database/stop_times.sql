SELECT 
rst.trip_id as trip_id
,case rstf.time> rst.time 
or exists(
	select 1 
	from routestop rsp 
	inner join routestoptrip rstp on ( rstp.route_stop_id=rsp.route_stop_id)  
	where
	rs.route_id=rsp.route_id 
	and rstp.trip_id=rst.trip_id 
	and
	case T.direction
		when 0 then rsp.sequence<rs.sequence
		else rsp.sequence>rs.sequence
	end
	and rstf.time>rstp.time
)
when true 
	then addtime(rst.time, '24:00:00') 
	else rst.time 
end as arrival_time
/*,case rstf.time<= rst.time when true then rst.time else addtime(rst.time, '24:00:00') end as departure_time*/
,case rstf.time> rst.time 
or exists(
	select 1 
	from routestop rsp 
	inner join routestoptrip rstp on ( rstp.route_stop_id=rsp.route_stop_id)  
	where
	rs.route_id=rsp.route_id 
	and rstp.trip_id=rst.trip_id 
	and
	case T.direction
		when 0 then rsp.sequence<rs.sequence
		else rsp.sequence>rs.sequence
	end
	and rstf.time>rstp.time
)
when true 
	then addtime(rst.time, '24:00:00') 
	else rst.time 
end as departure_time
,case T.direction when 0 then rs.stop_id else coalesce(rs.peer_stop_id, rs.stop_id) end as stop_id 
,case T.direction when 0 then rs.sequence else (select max(sequence) from routestop where route_id=rs.route_id)-rs.sequence+1 end as stop_sequence
from routestop rs 
inner join routestoptrip rst on rs.route_stop_id=rst.route_stop_id
inner join trip T on rst.trip_id=T.trip_id
/*first stop on the trip*/
inner join routestop rsf on (rs.route_id=rsf.route_id and rsf.sequence = 
case T.direction when 0 
then (select min(sequence) from routestop where route_id=rs.route_id) 
else 
(select max(sequence) 
from routestop rs1 
inner join routestoptrip rst1 on (rs1.route_stop_id=rst1.route_stop_id) 
where route_id=rs.route_id
and rst1.trip_id=rst.trip_id
) 
end)
inner join routestoptrip rstf on (rstf.trip_id=T.trip_id and rstf.route_stop_id=rsf.route_stop_id)
/*
left outer join routestop rsp on (rs.route_id=rsp.route_id and rsp.sequence = case T.direction when 0 then rs.sequence-1 else rs.sequence+1 end)
left outer join routestoptrip rstp on (rstp.trip_id=T.trip_id and rstp.route_stop_id=rsp.route_stop_id)
*/
where T.fleet_id=@fleet_id
order by rs.route_id, trip_id, stop_sequence
;
