	select
	R.route_id
	, SG.stage_id as stage_id
	, SG.stage_name as stage_name
    , SG.is_via as is_via
	, S.stop_id as onward_stop_id
	, S.name as onward_stop_name
	, RS.sequence
	from route R
	left outer join routestop RS on (RS.route_id=R.route_id )	
	left outer join stop S on (RS.stop_id=S.stop_id)	
	inner join stage SG on (SG.route_id=R.route_id and ((RS.stop_id is null) or (RS.stage_id=SG.stage_id)))
	left outer join stop PS on (PS.stop_id=coalesce(RS.peer_stop_id,RS.stop_id))	
	
	left outer join routestop PRS on (PRS.route_id=R.route_id and RS.sequence = PRS.sequence+1)/* first routestop does not have a PRS*/
	left outer join segment BS on (BS.from_stop_id=PRS.stop_id and BS.to_stop_id=S.stop_id) 
	left outer join routestop NRS on (NRS.route_id=R.route_id and RS.sequence + 1 = NRS.sequence)/* last routestop does not have an NRS*/
	left outer join segment FS on (FS.from_stop_id=NRS.peer_stop_id and FS.to_stop_id=PS.stop_id) 	
	
	where R.fleet_id=2
	order by R.route_id, SG.stage_id*1000 + coalesce(RS.sequence, 0);
