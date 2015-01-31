agency_id,agency_name,agency_lang,agency_timezone,agency_phone,agency_url

SELECT 'KTC' as agency_id
,agency_name
,agency_lang
,agency_timezone
,agency_phone
,agency_url
INTO OUTFILE 'C:/Users/Anjali/Desktop/GoaTrans/code/GTFS/agency.txt'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'


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

SELECT route_id
,'KTC' as agency_id
,'' as route_short_name
,route_name as route_long_name
,3 as route_type
from route
INTO OUTFILE 'C:/Users/Anjali/Desktop/GoaTrans/code/GTFS/routes.txt'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'


route_id,service_id,trip_id,trip_short_name,direction_id
SELECT route_id
,'FULLW' as service_id comment 'value is referenced from the calendar.txt or calendar_dates.txt file'
,trip_id as trip_id
,trip_name as trip_short_name
,direction as direction_id
FROM trip
INTO OUTFILE 'C:/Users/Anjali/Desktop/GoaTrans/code/GTFS/trips.txt'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'


trip_id,arrival_time,departure_time,stop_id,stop_sequence

SELECT rst.trip_id as trip_id
,rst.time as arrival_time
,rst.time as departure_time
,rs.stop_id as stop_id 
,rs.sequence as stop_sequence
from routestop rs inner join routestoptrip rst inner join trip t
on rs.route_stop_id=rst.route_stop_id AND rst.trip_id=t.trip_id
INTO OUTFILE 'C:/Users/Anjali/Desktop/GoaTrans/code/GTFS/stop_times.txt'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'


trip_id,start_time,end_time,headway_secs

SELECT trip_id
,frequency_start_time as start_time
,frequency_end_time as end_time
,frequency_gap as headway_secs
from trip
INTO OUTFILE 'C:/Users/Anjali/Desktop/GoaTrans/code/GTFS/frequencies.txt'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'


feed_publisher_name,feed_publisher_url,feed_lang
SELECT 'GEC ENGICOS' as feed_publisher_name
,'www.gec.ac.in' as feed_publisher_url
,'en' as feed_lang
INTO OUTFILE 'C:/Users/Anjali/Desktop/GoaTrans/code/GTFS/feed_info.txt'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'