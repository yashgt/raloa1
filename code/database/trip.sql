SELECT 
T.route_id as route_id
,C.calendar_name as service_id 
,trip_id as trip_id
,case T.direction 
	when 0 
		then CONCAT( '"' 
, case F.fleet_id when 6 then "PRIVATE:" else "" end		
/*,coalesce(replace(S1.name, C1.old, C1.new), S1.name) , ' to '*/
,coalesce(replace(S2.name, C2.old, C2.new), S2.name)
	, coalesce(concat(cast(" via " as char character set utf8) 
		, (select group_concat(CAP_FIRST(SG.stage_name)) 
		from stage SG 
		where SG.route_id=R.route_id and SG.is_via=1
		group by SG.route_id)
	),"" )
		,'"'
)
	else
		CONCAT('"'
/*,coalesce(replace(S2.name, C2.old, C2.new), S2.name) , ' to '*/
,coalesce(replace(S1.name, C1.old, C1.new), S1.name)
,coalesce(concat(cast(" via " as char character set utf8) 
		, (select group_concat(CAP_FIRST(SG.stage_name)) 
		from stage SG 
		where SG.route_id=R.route_id and SG.is_via=1
		group by SG.route_id)
	),"" )
		,'"'
)


end as trip_headsign
,'' as trip_short_name
,direction as direction_id
FROM trip T
inner join calendar C on (T.calendar_id=C.calendar_id)
inner join route R on (R.route_id=T.route_id)
/*left outer join stage SG on (SG.route_id=R.route_id and SG.is_via=1)*/
inner join stop S1 on S1.stop_id=R.start_stop_id
left outer join corrections C1 on (S1.name like binary concat('%',C1.old,'%'))
inner join stop S2 on S2.stop_id=R.end_stop_id
left outer join corrections C2 on (S2.name like binary concat('%',C2.old,'%'))
inner join fleet F on (T.fleet_id=F.fleet_id)
where T.fleet_id=@fleet_id or F.parent_fleet_id=@fleet_id
;
