	select 
	R.route_id as route_id
	, convert(R.route_id, char(10)) as route_name
    , concat('"',(select group_concat(internal_route_cd separator ',') from internal_route_map group by route_id having route_id=R.route_id),'"') as internal_route_cd
	, concat('"',coalesce(S1.name
                , (select SG.stage_name 
                from stage SG 
                where SG.route_id=R.route_id 
                and SG.stage_id=(select min(SG1.stage_id) from stage SG1 where SG1.route_id=R.route_id group by SG1.route_id))),'"')
    as start_stop_name
	, concat('"',coalesce(S2.name
				, (select stage_name 
				from stage SG 
				where SG.route_id=R.route_id 
				and SG.stage_id=(select max(SG1.stage_id) from stage SG1 where SG1.route_id=R.route_id group by SG1.route_id))),'"') as end_stop_name
	, case T.direction when 0 then 'onward' else 'return' end as direction
	, case T.direction when 0 then RST1.time else RST2.time end as departure_time
	, case T.direction when 0 then RST2.time else RST1.time end as arrival_time
	from route R
	/*inner join internal_route_map RM on (R.route_id=RM.route_id)*/
	left outer join trip T on (T.route_id=R.route_id)
    left outer join stop S1 on (R.start_stop_id=S1.stop_id)
	left outer join stop S2 on (R.end_stop_id=S2.stop_id)
	left outer join	routestop RS1 on (S1.stop_id=RS1.stop_id and RS1.route_id=R.route_id)
	left outer join	routestop RS2 on (S2.stop_id=RS2.stop_id and RS2.route_id=R.route_id)
	left outer join routestoptrip RST1 on (RS1.route_stop_id=RST1.route_stop_id and RST1.trip_id=T.trip_id)
	left outer join routestoptrip RST2 on (RS2.route_stop_id=RST2.route_stop_id and RST2.trip_id=T.trip_id)
	where R.fleet_id = 2
	and R.is_deleted=0
	order by R.route_id, direction, departure_time
limit 100000 ;
	

