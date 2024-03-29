SELECT 
distinct 
Ro.route_no as route_id
,F.gtfs_agency_id as agency_id
/*,Ro.route_no as route_short_name*/
,'' as route_short_name 
, concat('"',replace(replace(Ro.route_name,'STN.','STN'),'RLY.','RLY'),'"')  as route_long_name
,F.fleet_type as route_type
from route R
inner join internal_route_map M on (R.route_id=M.route_id)
inner join msrtc1.listofroutes Ro on (M.internal_route_cd=Ro.route_no)
inner join stop S1 on S1.stop_id=R.start_stop_id
inner join stop S2 on S2.stop_id=R.end_stop_id
inner join fleet F on (@fleet_id=F.fleet_id)
where 
R.fleet_id=@fleet_id
and
exists ( 
	select 1 from msrtc1.tripsummary Tr where (Tr.route_no=Ro.route_no)
	and Tr.first_stop_departure_tm is not null and Tr.last_stop_arrival_tm is not null
	and Tr.trip_no not in ( select trip_no from msrtc1.tripsummary group by trip_no having count(*)>1 ) /*hack*/
	and case @skip_errors when true then not exists ( select 1 from error_trips where trip_no=Tr.trip_no ) else true end
)
/*and Ro.route_no='5'*/
;
