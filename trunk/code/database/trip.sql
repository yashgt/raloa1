SELECT 
route_id
,'FULLW' as service_id comment 'value is referenced from the calendar.txt or calendar_dates.txt file'
,trip_id as trip_id
,trip_name as trip_short_name
,direction as direction_id
FROM trip
where fleet_id=@fleet_id
;