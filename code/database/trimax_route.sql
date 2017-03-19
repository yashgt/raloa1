SELECT 
distinct 
Ro.route_no as route_id
,F.gtfs_agency_id as agency_id
,Ro.route_no as route_short_name
, concat('"',Ro.route_name,'"')  as route_long_name
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
exists ( select 1 from msrtc1.listoftrips Tr where (Tr.route_no=Ro.route_no) )
;
