SELECT 
distinct 
St.bus_stop_cd as stop_id
,CONCAT('"',St.bus_stop_nm,'"') as stop_name
,S.latitude as stop_lat
,S.longitude as stop_lon
,0 as location_type
FROM stop S
inner join msrtc1.listofstops St on (S.code=St.bus_stop_cd and S.fleet_id=@fleet_id)
where 
exists 
	(select 1 
		from msrtc1.listofstopsonroutes sor 
		inner join msrtc1.listoftrips Tr on (Tr.route_no=sor.route_no and sor.bus_stop_cd=Tr.bus_stop_cd)
		where St.bus_stop_cd=sor.bus_stop_cd
	)	
	
order  by (St.bus_stop_nm) asc;
