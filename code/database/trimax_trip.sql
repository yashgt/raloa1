SELECT 
distinct
Ts.route_no as route_id
,'FULLW' as service_id 
,replace(Ts.trip_no,'`','') as trip_id
/*,concat('"', LR.route_name,'"') as trip_headsign */
,'' as trip_headsign 
,'' as trip_short_name
,0 as direction_id
FROM route R
inner join internal_route_map M on (R.route_id=M.route_id)
inner join msrtc1.listofroutes LR on (M.internal_route_cd=LR.route_no)
/*inner join msrtc1.listoftrips Tr on (M.internal_route_cd=Tr.route_no)*/
/*inner join msrtc1.tripsummary Ts on (Tr.trip_no=Ts.trip_no and M.internal_route_cd=Ts.route_no)*/
inner join msrtc1.tripsummary Ts on (M.internal_route_cd=Ts.route_no)
where R.fleet_id=@fleet_id
and Ts.trip_no not in (select trip_no from msrtc1.tripsummary group by trip_no having count(*)>1)
and (time(Ts.first_stop_departure_tm)<>'00:00:00' and time(Ts.last_stop_arrival_tm)<>'00:00:00')
and case @skip_errors when true then not exists ( select 1 from error_trips where trip_no=Ts.trip_no ) else true end
;
