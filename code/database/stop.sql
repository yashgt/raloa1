SELECT distinct S.stop_id
,CONCAT('"',S.name,'"') as stop_name
,S.latitude as stop_lat
,S.longitude as stop_lon
,0 as location_type
FROM stop S
inner join routestop RS on (RS.stop_id=S.stop_id or RS.peer_stop_id=S.stop_id)
inner join route R on (RS.route_id=R.route_id)
inner join trip T on (R.route_id=T.route_id)
where T.fleet_id=@fleet_id
order  by (S.stop_id) asc;
