SELECT distinct R.route_id
,F.gtfs_agency_id as agency_id
,'' as route_short_name
,CONCAT('"',concat(replace(S1.name, ' Ferry Terminal',''), case F.fleet_type when 4 then ' - ' else ' to ' end, replace(S2.name,' Ferry Terminal','')),'"')  as route_long_name
,F.fleet_type as route_type
from route R
inner join stop S1 on S1.stop_id=R.start_stop_id
inner join stop S2 on S2.stop_id=R.end_stop_id
inner join trip T on (T.route_id=R.route_id)
inner join fleet F on (@fleet_id=F.fleet_id)
where T.fleet_id=@fleet_id
;
