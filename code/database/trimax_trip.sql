SELECT 
distinct
M.internal_route_cd as route_id
,'FULLW' as service_id 
,Tr.trip_no as trip_id
,'' as trip_short_name
,0 as direction_id
FROM route R
inner join internal_route_map M on (R.route_id=M.route_id)
inner join msrtc1.listoftrips Tr on (M.internal_route_cd=Tr.route_no)
where R.fleet_id=@fleet_id
and Tr.trip_no not in 
(select trip_no from msrtc1.tripsummary group by trip_no having count(*)>1)
;
