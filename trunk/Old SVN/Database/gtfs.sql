stop_id,stop_name,stop_lat,stop_lon,location_type

SELECT stop_id
,name as stop_name
,latitude as stop_lat
,longitude as stop_lon
,0 as location_type
FROM stop
order  by (stop_id) asc
INTO OUTFILE 'C:/Users/Anjali/Desktop/GoaTrans/code/GTFS/stops.txt'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'


route_id,agency_id,route_short_name,route_long_name,route_type

SELECT R.route_id as route_id
,'KTC' as agency_id
,'' as route_short_name
,CONCAT(S1.name,'-',S2.name) as route_long_name
,3 as route_type
from route R
inner join routestop RS1 on (R.route_id=RS1.route_id)
inner join stop S1 on (RS1.stop_id = S1.stop_id)
inner join routestop RS2 on (R.route_id=RS2.route_id)
inner join stop S2 on (RS2.stop_id = S2.stop_id)
where RS1.sequence=1
and RS2.sequence = ( select max(sequence) from routestop RS where RS.route_id = R.route_id )
INTO OUTFILE 'C:/Users/Anjali/Desktop/GoaTrans/code/GTFS/routes.txt'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'


route_id,service_id,trip_id,direction_id
SELECT route_id
,'FULLW' as service_id
,trip_id as trip_id
,direction as direction_id
FROM trip
INTO OUTFILE 'C:/Users/Anjali/Desktop/GoaTrans/code/GTFS/trips.txt'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'


trip_id,arrival_time,departure_time,stop_id,stop_sequence
SELECT rst.trip_id as trip_id
,rst.time as arrival_time
,rst.time as departure_time
,rs.stop_id as stop_id, 
CASE WHEN t.direction = 0 then
rs.sequence
else
rs.rev_sequence
end as stop_sequence
from routestop rs inner join routestoptrip rst inner join trip t
on rs.route_stop_id=rst.route_stop_id AND rst.trip_id=t.trip_id
INTO OUTFILE 'C:/Users/Anjali/Desktop/GoaTrans/code/GTFS/stop_times.txt'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'