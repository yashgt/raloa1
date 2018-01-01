SELECT distinct R.route_id
,F.gtfs_agency_id as agency_id
,'' as route_short_name
,CONCAT('"',concat(
	replace(replace(S1.name,' KTC Bus Stand',''), ' Ferry Terminal','')
	, case F.fleet_type when 4 then ' - ' else ' to ' end
	, replace(replace(S2.name,' KTC Bus Stand',''),' Ferry Terminal','')
	, coalesce(concat(" via ", SG.stage_name),"")
	),'"')   as route_long_name
,F.fleet_type as route_type
from route R
left outer join stage SG on (SG.route_id=R.route_id and SG.is_via=1)
inner join stop S1 on S1.stop_id=R.start_stop_id
inner join stop S2 on S2.stop_id=R.end_stop_id
inner join trip T on (T.route_id=R.route_id)
inner join fleet F on (@fleet_id=F.fleet_id)
where T.fleet_id=@fleet_id
;
