/*no boarding nor alighting inspite of terminal stops*/

/* route with stop multiple times */
select *
from msrtc1.listofstopsonroutes RS
inner join
(
select ROUTE_NO, BUS_STOP_CD, count(*) 
from msrtc1.listofstopsonroutes
group by route_no, BUS_STOP_CD
having count(*)>1
order by count(*) desc
) RS1
on (RS.ROUTE_NO=RS1.route_no)
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


/* departure earlier than arrival */
select T.*,  timediff(T.arrival_tm, T.departure_tm) time_diff
from msrtc1.listoftrips T
inner join stop S on (S.code=T.bus_stop_cd)
where  T.departure_tm < T.arrival_tm and T.departure_tm <> '00:00:00' 
and timediff(T.arrival_tm, T.departure_tm) < '12:00:00'
;

