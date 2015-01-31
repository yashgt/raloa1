SELECT 
route_id
,'FULLW' as service_id 
,trip_id as trip_id
,trip_name as trip_short_name
,direction as direction_id
FROM trip
where fleet_id=@fleet_id
;