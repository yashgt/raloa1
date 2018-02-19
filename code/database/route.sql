SET NAMES 'utf8' COLLATE 'utf8_general_ci';
SELECT 
distinct
 R.route_id
,F.gtfs_agency_id as agency_id
,'' as route_short_name
,CONCAT('"'
,coalesce(replace(S1.name, C1.old, C1.new), S1.name)
	, ' - ' 
,coalesce(replace(S2.name, C2.old, C2.new), S2.name)
	, coalesce(concat(cast(" via " as char character set utf8) 
		, (select group_concat(CAP_FIRST(SG.stage_name)) 
		from stage SG 
		where SG.route_id=R.route_id and SG.is_via=1
		group by SG.route_id)
	),"" )
	,'"')   as route_long_name
,F.fleet_type as route_type
from route R
/*left outer join stage SG on (SG.route_id=R.route_id and SG.is_via=1)*/
inner join stop S1 on S1.stop_id=R.start_stop_id
left outer join corrections C1 on (S1.name like binary concat('%',C1.old,'%'))
inner join stop S2 on S2.stop_id=R.end_stop_id
left outer join corrections C2 on (S2.name like binary concat('%',C2.old,'%'))
inner join trip T on (T.route_id=R.route_id)
inner join fleet F on (@fleet_id=F.fleet_id)
where T.fleet_id=@fleet_id
;
