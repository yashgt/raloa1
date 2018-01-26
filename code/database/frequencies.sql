SELECT 
trip_id
,frequency_start_time as start_time
,case frequency_end_time<frequency_start_time when true then addtime(frequency_end_time, '24:00:00') else frequency_end_time end as end_time
,time_to_sec(frequency_gap) as headway_secs
from trip T
inner join route R on (T.route_id=R.route_id)
where T.fleet_id=@fleet_id
and frequency_trip=1
and (R.is_deleted=0 or R.is_deleted is null)
;
