SELECT 
T.route_id as route_id
,C.calendar_name as service_id 
,trip_id as trip_id
,case T.direction 
	when 0 
		then CONCAT('"'
		/*,concat(replace(replace(S1.name,' KTC Bus Stand',''), ' Ferry Terminal',''), case F.fleet_type when 4 then ' - ' else ' to ' end, replace(replace(S2.name,' KTC Bus Stand',''),' Ferry Terminal',''), coalesce(concat(" via ", SG.stage_name),""))*/
		,concat( 
			replace(replace(replace(replace(replace(S1.name,' KTC Bus Stand',''), ' Ferry Terminal',''), ' Bus Stand MSRTC',''), ' Bus Stand KSRTC',''), ' bus Stand KSRTC', '')
			, ' to '
			, replace(replace(replace(replace(replace(S2.name,' KTC Bus Stand',''), ' Ferry Terminal',''), ' Bus Stand MSRTC',''), ' Bus Stand KSRTC',''), ' bus Stand KSRTC', '')
		)
		,'"')
	else
		CONCAT('"'
		/*,concat(replace(replace(S2.name,' KTC Bus Stand',''), ' Ferry Terminal',''), case F.fleet_type when 4 then ' - ' else ' to ' end, replace(replace(S1.name,' KTC Bus Stand',''),' Ferry Terminal',''), coalesce(concat(" via ", SG.stage_name),""))*/
		,concat( 
			replace(replace(replace(replace(replace(S2.name,' KTC Bus Stand',''), ' Ferry Terminal',''), ' Bus Stand MSRTC',''), ' Bus Stand KSRTC',''), ' bus Stand KSRTC', '')
			, ' to '
			, replace(replace(replace(replace(replace(S1.name,' KTC Bus Stand',''), ' Ferry Terminal',''), ' Bus Stand MSRTC',''), ' Bus Stand KSRTC',''), ' bus Stand KSRTC', '')
		)
		,'"')
end as trip_headsign
,'' as trip_short_name
,direction as direction_id
FROM trip T
inner join calendar C on (T.calendar_id=C.calendar_id)
inner join route R on (R.route_id=T.route_id)
left outer join stage SG on (SG.route_id=R.route_id and SG.is_via=1)
inner join stop S1 on S1.stop_id=R.start_stop_id
inner join stop S2 on S2.stop_id=R.end_stop_id
inner join fleet F on T.fleet_id=F.fleet_id
where T.fleet_id=@fleet_id
;