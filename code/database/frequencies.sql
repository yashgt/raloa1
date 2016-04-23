SELECT 
trip_id
,frequency_start_time as start_time
,case frequency_end_time<frequency_start_time when true then addtime(frequency_end_time, '24:00:00') else frequency_end_time end as end_time
,time_to_sec(frequency_gap) as headway_secs
from trip
where fleet_id=@fleet_id
and frequency_trip=1
;
