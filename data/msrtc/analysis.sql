/* route with stop multiple times */
select *
from msrtc.listofstopsonroutes RS
inner join
(
select ROUTE_NO, BUS_STOP_CD, count(*) 
from msrtc.listofstopsonroutes
group by route_no, BUS_STOP_CD
having count(*)>1
order by count(*) desc
) RS1
on (RS.ROUTE_NO=RS1.route_no)
order by RS.route_no
;

/* no trips */
select R.* from msrtc.listofroutes R 
left outer join msrtc.listoftrips T on R.route_no=T.ROUTE_NO
where T.ROUTE_NO is null
;

/* trips that have the same stop twice at the start or end of route */
select T1.trip_no, count(*)
from
(
select trip_no, min(stop_seq) as  min_stop_seq , max(stop_seq)  as max_stop_seq
from msrtc1.listoftrips T 
inner join msrtc1.listofstopsonroutes SOR on (T.route_no=SOR.route_no and T.bus_stop_cd=SOR.BUS_STOP_CD)
group by trip_no
) as Tr 
inner join msrtc1.listoftrips T1 on (T1.TRIP_NO=Tr.trip_no)
inner join msrtc1.listofstopsonroutes SOR1 on (T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.BUS_STOP_CD)
where SOR1.stop_seq=Tr.max_stop_seq 
group by T1.trip_no
having count(*) > 1
;

/* trips with no boarding nor alighting at certain stops */
select T1.*, SOR1.stop_seq
from msrtc1.listoftrips T1
inner join msrtc1.listofstopsonroutes SOR1 on (T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.BUS_STOP_CD)
where
T1.trip_no='S568'
order by SOR1.stop_seq
;


select S1.stop_id, S1.name, S1.latitude, S1.longitude, S2.stop_id, S2.name
from stop S1
inner join stop S2 on (S1.latitude=S2.latitude and S1.longitude=S2.longitude and S1.stop_id<>S2.stop_id)
where S1.fleet_id=0 
;

select S1.code as stop_1_code, S1.name as stop_1_name
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
;



select *,  timediff(T.arrival_tm, T.departure_tm)
from msrtc1.listoftrips T
inner join stop S on (S.code=T.bus_stop_cd)
where  T.departure_tm < T.arrival_tm and T.departure_tm <> '00:00:00' 
and timediff(T.arrival_tm, T.departure_tm) < '12:00:00'
;

select *
from msrtc1.listoftrips T
where T.trip_no in ('S239893', 'S240182', 'M6124')
and T.IS_ALIGHTING<0 or T.IS_BOARDING_STOP<0
;



