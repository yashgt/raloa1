SELECT stop_id
,name as stop_name
,latitude as stop_lat
,longitude as stop_lon
,0 as location_type
FROM stop
order  by (stop_id) asc
where fleet_id=@fleet_id
;