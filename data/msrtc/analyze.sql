/*no boarding nor alighting inspite of terminal stops*/
select T1.*, SOR1.stop_seq
from msrtc1.listoftrips T1
inner join msrtc1.listofstopsonroutes SOR1 on (T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.BUS_STOP_CD)
where T1.IS_BOARDING_STOP=0 and T1.IS_ALIGHTING=0

and (SOR1.stop_seq=1
or
SOR1.stop_seq= (select max(stop_seq) from msrtc1.listofstopsonroutes SOR2 where SOR2.route_no=SOR1.route_no)
)

/*and T1.trip_no='S195393'*/

order by T1.route_no, T1.trip_no, SOR1.stop_seq
;

/* terminal stops with no time */

SELECT
Tr.trip_no as trip_id
,Tr.arrival_tm
,Tr.departure_tm 
/*
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
*/
,sor.bus_stop_cd as stop_id
,sor.stop_seq as stop_sequence
,abs(Tr.is_boarding_stop-1) as pickup_type
,abs(Tr.is_alighting-1) as drop_off_type
, sor.stop_seq = Ts.min_stop_seq as first_stop
, sor.stop_seq = Ts.max_stop_seq as last_stop
, Tr.depot_cd
, M.internal_route_cd
FROM route R
inner join internal_route_map M on (R.route_id=M.route_id)
inner join msrtc1.listofstopsonroutes sor on (M.internal_route_cd=sor.route_no)
inner join stop S on (S.code=sor.bus_stop_cd and S.fleet_id=7)
inner join msrtc1.listoftrips Tr on (sor.route_no=Tr.ROUTE_NO and sor.bus_stop_cd=Tr.bus_stop_cd )
inner join msrtc1.tripsummary Ts on (Ts.trip_no=Tr.trip_no)
where R.fleet_id=7
and (Ts.min_stop_seq=sor.stop_seq  or Ts.max_stop_seq=sor.stop_seq )
and (case 
	when Tr.arrival_tm = '00:00:00' or Tr.arrival_tm is null then null
	else Tr.arrival_tm
	end is null
	and
	case 
	when Tr.departure_tm = '00:00:00' or Tr.departure_tm is null then null
   	else Tr.departure_tm
	end is null
)
and Tr.trip_no not in (select trip_no from msrtc1.tripsummary group by trip_no having count(*)>1)
/*and Tr.trip_no in ('S163002', 'S163003', 'S56481', 'S239898`')*/
order by M.internal_route_cd, Tr.trip_no, sor.stop_seq

;

/* departure earlier than arrival */
select T.*,  timediff(T.arrival_tm, T.departure_tm) time_diff
from msrtc1.listoftrips T
inner join stop S on (S.code=T.bus_stop_cd)
where  T.departure_tm < T.arrival_tm and T.departure_tm <> '00:00:00' 
and timediff(T.arrival_tm, T.departure_tm) < '12:00:00'
;


select trip_no,count( distinct route_no)
from msrtc1.listoftrips
group by trip_no
having count(distinct route_no)>1;

/* route with stop multiple times */
select RS.*
from msrtc1.listofstopsonroutes RS
inner join
(
select ROUTE_NO, BUS_STOP_CD, count(*) 
from msrtc1.listofstopsonroutes
group by route_no, BUS_STOP_CD
having count(*)>1
order by count(*) desc
) RS1
on (RS.ROUTE_NO=RS1.route_no and RS.bus_stop_cd=RS1.bus_stop_cd)
inner join stop S on (S.code=RS.bus_stop_cd)
inner join msrtc1.listoftrips T on (T.route_no=RS.route_no and T.bus_stop_cd=RS.BUS_STOP_CD)
where (T.IS_BOARDING_STOP=1 or T.IS_ALIGHTING=1)
order by RS.route_no
;

/* no trips */
select R.* from msrtc1.listofroutes R 
left outer join msrtc1.listoftrips T on R.route_no=T.ROUTE_NO
where T.ROUTE_NO is null
;

/* trips that have the same stop twice at the start or end of route */
select T1.trip_no, min(T1.route_no) as route_no, SOR1.stop_seq, count(*)
from
msrtc1.tripsummary as Tr 
inner join msrtc1.listoftrips T1 on (T1.TRIP_NO=Tr.trip_no)
inner join msrtc1.listofstopsonroutes SOR1 on (T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.BUS_STOP_CD)
inner join stop S on (S.code=SOR1.bus_stop_cd and S.fleet_id=7)
where SOR1.stop_seq=Tr.max_stop_seq or SOR1.stop_seq=Tr.min_stop_seq
group by T1.trip_no, SOR1.stop_seq
having count(*) > 1
;

/* trips with no boarding nor alighting at certain stops */
select T1.*, SOR1.stop_seq
from msrtc1.listoftrips T1
inner join msrtc1.listofstopsonroutes SOR1 on (T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.BUS_STOP_CD)
inner join stop S on (SOR1.bus_stop_cd=S.code and S.fleet_id=7)
where T1.IS_BOARDING_STOP=0 and T1.IS_ALIGHTING=0
order by T1.route_no, T1.trip_no, SOR1.stop_seq
;


/*multiple stops at same location */
select S1.code as stop_1_code
, S1.name as stop_1_name
, S2.code as stop_2_code
, S2.name as stop_2_name
, st_distance(point(S1.longitude, S1.latitude), point(S2.longitude, S2.latitude)) as distance
from msrtc1.listofstops LS1
inner join stop S1 on (LS1.bus_stop_cd=S1.code)
inner join msrtc1.listofstops LS2
inner join stop S2 on (LS2.bus_stop_cd=S2.code and S1.code<>S2.code)
where st_distance(point(S1.longitude, S1.latitude), point(S2.longitude, S2.latitude)) = 0
and S1.fleet_id=S2.fleet_id
and S1.fleet_id=7
and S1.name <= S2.name
order by S1.latitude, S1.longitude
;

/*trips with start date greater than today*/
select *
from msrtc1.listoftrips 
where start_date>'2018-01-01';

select T1.*
from msrtc1.listoftrips T1
inner join msrtc1.listoftrips T2 on T1.trip_no=T2.trip_no and T1.stop_seq>T2.stop_seq and T1.day_offset=T2.day_offset+1
where T1.day_offset>0;



