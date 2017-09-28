select
replace(TST.trip_id,'`','') as trip_id
, coalesce( 
	case 
		when TST.first_stop and TST.departure_time is not null then TST.departure_time
		when TST.arrival_time is null then TST.departure_time
		when TST.arrival_time > TST.departure_time and (TST.arrival_time is not null and TST.departure_time is not null) then TST.departure_time /*hack*/
		else TST.arrival_time 
	end
, '')
as arrival_time
,coalesce( 
	case 
		when TST.last_stop and TST.arrival_time is not null then TST.arrival_time
		when TST.departure_time is null then TST.arrival_time
		when TST.arrival_time > TST.departure_time and (TST.arrival_time is not null and TST.departure_time is not null) then TST.arrival_time
		else TST.departure_time
	end
,'')
as departure_time
, TST.stop_id
, TST.stop_sequence
, case 
	when TST.pickup_type=1 and TST.drop_off_type=1 then 0  /*hack 0*/
	else TST.pickup_type
  end as pickup_type	
, case 
	when TST.pickup_type=1 and TST.drop_off_type=1 then 0 
	else TST.drop_off_type
  end as drop_off_type
from
(

SELECT
Tr.trip_no as trip_id
, time(case 
	when time(Tr.arrival_tm) = '00:00:00' or Tr.arrival_tm is null then null
	/*when (Tr.stop_seq > Ts.min_stop_seq) and time(Tr.arrival_tm) < (select first_stop_departure_tm from msrtc1.tripsummary T where T.trip_no=Tr.trip_no) then addtime(Tr.arrival_tm, '24:00:00')*/
	when (Tr.stop_seq > Ts.min_stop_seq) and time(Tr.arrival_tm) < Ts.first_stop_departure_tm then addtime(Tr.arrival_tm, '24:00:00')
	/* when (Tr.stop_seq > Ts.min_stop_seq) then str_to_date(date_format(Tr.arrival_tm + interval Tr.day_offset day,'%H:%i:%s'),'%H:%i:%s') */
	else Tr.arrival_tm
	end) as arrival_time

,case 
	when Tr.departure_tm = '00:00:00' or Tr.departure_tm is null then null
    	/*when (Tr.stop_seq < Ts.max_stop_seq) and Tr.departure_tm < (select first_stop_departure_tm from msrtc1.tripsummary T where T.trip_no=Tr.trip_no) then addtime(Tr.departure_tm, '24:00:00')*/
    	when (Tr.stop_seq < Ts.max_stop_seq) and Tr.departure_tm < Ts.first_stop_departure_tm then addtime(Tr.departure_tm, '24:00:00')
    	/* when (Tr.stop_seq < Ts.max_stop_seq) then str_to_date(date_format(Tr.departure_tm + interval Tr.day_offset day,'%H:%i:%s'),'%H:%i:%s') */
	when (time(Tr.arrival_tm) > Tr.departure_tm) and (Tr.arrival_tm is not null and Tr.departure_tm is not null) and (timediff(time(Tr.arrival_tm), Tr.departure_tm) > '05:00:00') then addtime(Tr.departure_tm, '24:00:00')
    	else Tr.departure_tm
	end as departure_time
,Tr.bus_stop_cd as stop_id
,Tr.stop_seq as stop_sequence
,abs(Tr.is_boarding_stop-1) as pickup_type
,abs(Tr.is_alighting-1) as drop_off_type
, Tr.stop_seq = Ts.min_stop_seq as first_stop
, Tr.stop_seq = Ts.max_stop_seq as last_stop
FROM 
route R
inner join internal_route_map M on (R.route_id=M.route_id)
/*inner join msrtc1.listofroutes lor on (M.internal_route_cd=lor.route_no) */
inner join msrtc1.tripsummary Ts on (Ts.route_no=M.internal_route_cd)
inner join msrtc1.listoftrips Tr on (Ts.trip_no=Tr.trip_no and Ts.route_no=Tr.route_no)
inner join stop S force index (idx_s_sc) on (S.code=Tr.bus_stop_cd and S.fleet_id=7)
where 
R.fleet_id=7
and
(
Tr.is_alighting=1 
or Tr.is_boarding_stop=1 
or Tr.stop_seq=1
or Tr.stop_seq=Ts.max_stop_seq
)
and Tr.start_date<'2018-01-01'
/*and Ts.trip_no = 'L2629' */
and date(Tr.arrival_tm) = (select max(date(arrival_tm)) from msrtc1.listoftrips T1 where T1.trip_no=Tr.trip_no and T1.route_no=Tr.route_no and T1.bus_stop_cd=Tr.bus_stop_cd)

and Ts.trip_no not in (select trip_no from msrtc1.tripsummary group by trip_no having count(*)>1)
and case @skip_errors when true then not exists ( select 1 from error_trips where trip_no=Ts.trip_no ) else true end
order by Ts.trip_no, Ts.route_no, Tr.stop_seq
) as TST
order by TST.trip_id, TST.stop_sequence
;



