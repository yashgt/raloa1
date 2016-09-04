SELECT 
route_id
,C.calendar_name as service_id 
,trip_id as trip_id
,'' as trip_short_name
,direction as direction_id
FROM trip T
inner join calendar C on (T.calendar_id=C.calendar_id)
where T.fleet_id=@fleet_id
;