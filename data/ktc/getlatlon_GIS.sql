SELECT distinct 
S.stop_id as id
, S.stop_id 
,S.name as stop_name
,S.latitude as stop_lat
,S.longitude as stop_lon
,0 as location_t
FROM stop S
where (S.fleet_id=2)
order  by (S.stop_id) asc;