SELECT 
trip_id
,frequency_start_time as start_time
,frequency_end_time as end_time
,time_to_sec(frequency_gap) as headway_secs
from trip
where fleet_id=@fleet_id
and frequency_trip=1
;
