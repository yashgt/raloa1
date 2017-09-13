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
	when TST.pickup_type=1 and TST.drop_off_type=1 then 0  /*hack*/
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
, case 
	when Tr.arrival_tm = '00:00:00' or Tr.arrival_tm is null then null
	when (sor.stop_seq > Ts.min_stop_seq) and Tr.arrival_tm < (select first_stop_departure_tm from msrtc1.tripsummary T where T.trip_no=Tr.trip_no) then addtime(Tr.arrival_tm, '24:00:00')
	else Tr.arrival_tm
	end as arrival_time

,case 
	when Tr.departure_tm = '00:00:00' or Tr.departure_tm is null then null
    	when (sor.stop_seq < Ts.max_stop_seq) and Tr.departure_tm < (select first_stop_departure_tm from msrtc1.tripsummary T where T.trip_no=Tr.trip_no) then addtime(Tr.departure_tm, '24:00:00')
    	else Tr.departure_tm
	end as departure_time
,sor.bus_stop_cd as stop_id
,sor.stop_seq as stop_sequence
,abs(Tr.is_boarding_stop-1) as pickup_type
,abs(Tr.is_alighting-1) as drop_off_type
, sor.stop_seq = Ts.min_stop_seq as first_stop
, sor.stop_seq = Ts.max_stop_seq as last_stop
, R.route_id
FROM route R
inner join internal_route_map M on (R.route_id=M.route_id)
inner join msrtc1.listofstopsonroutes sor on (M.internal_route_cd=sor.route_no)
inner join stop S on (S.code=sor.bus_stop_cd and S.fleet_id=7)
inner join msrtc1.listoftrips Tr on (sor.route_no=Tr.ROUTE_NO and sor.bus_stop_cd=Tr.bus_stop_cd )
inner join msrtc1.tripsummary Ts on (Ts.trip_no=Tr.trip_no)
where 
R.fleet_id=7

and
(
Tr.is_alighting=1 
or Tr.is_boarding_stop=1 
or sor.stop_seq=1
or sor.stop_seq=(select max(stop_seq) from msrtc1.listofstopsonroutes SOR2 where SOR2.route_no=sor.route_no)
)
/*and 	(case 
	when Ts.min_stop_seq=sor.stop_seq 
		then (Tr.arrival_tm = '00:00:00' or Tr.arrival_tm is null or (Tr.departure_tm <> '00:00:00' and Tr.arrival_tm is not null and Tr.arrival_tm<=Tr.departure_tm) )
	when Ts.max_stop_seq=sor.stop_seq 
		then (Tr.departure_tm = '00:00:00' or Tr.departure_tm is null or (Tr.arrival_tm <> '00:00:00' and Tr.departure_tm is not null and Tr.arrival_tm<=Tr.departure_tm) )
	else true	
	end 
	)
*/
/*and Ts.trip_no = 'L0994' */

and Tr.trip_no not in (select trip_no from msrtc1.tripsummary group by trip_no having count(*)>1)
/*and not exists ( select 1 from error_trips where trip_no=Tr.trip_no )*/
order by M.internal_route_cd, Tr.trip_no, sor.stop_seq
) as TST
;



