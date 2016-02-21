
	select 
	distinct

	S.stop_id as my_onward_stop_id
	, S.name as my_onward_stop_name
	, ES.stop_id as earlier_onward_stop_id
	, ES.name as earlier_onward_stop_name


	, coalesce(BS.distance, 0) as distance_to_me

	, PS.stop_id as return_stop_id
	, PS.name as return_stop_name
	, EPS.stop_id as earlier_return_stop_id
	, EPS.name as earlier_return_stop_name

	, coalesce(BS2.distance, 0) as distance_from_me

/*count(*)*/

	from route R
	inner join routestop RS on (RS.route_id=R.route_id )	
	inner join routestop PRS on (PRS.route_id=R.route_id and RS.sequence = PRS.sequence+1)

	inner join stop S on (RS.stop_id=S.stop_id)	
	inner join stop PS on (PS.stop_id=coalesce(RS.peer_stop_id,RS.stop_id))
	inner join stop ES on (ES.stop_id=PRS.stop_id)
	inner join stop EPS on (EPS.stop_id=coalesce(PRS.peer_stop_id,PRS.stop_id))	
	
	left outer join segment BS on (BS.from_stop_id=PRS.stop_id and BS.to_stop_id=S.stop_id)
	left outer join segment BS2 on (BS2.from_stop_id=coalesce(RS.peer_stop_id,RS.stop_id) and BS2.to_stop_id=coalesce(PRS.peer_stop_id,PRS.stop_id))
	
	where abs(coalesce(BS.distance, 0)-coalesce(BS2.distance, 0)) >100

	order by R.route_id, RS.sequence;
	

