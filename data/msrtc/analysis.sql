select * 
from msrtc1.listoftrips tr
inner join msrtc1.listofstopsonroutes sor on (tr.route_no=sor.route_no and tr.bus_stop_cd=sor.bus_stop_cd) 
where tr.trip_no='L5638'
order by sor.route_no, tr.trip_no,sor.STOP_SEQ;

select SOR.route_no, T.trip_no, min(stop_seq) as  min_stop_seq , max(stop_seq)  as max_stop_seq
from msrtc1.listoftrips T
inner join msrtc1.listofstopsonroutes SOR on (T.route_no=SOR.route_no and T.bus_stop_cd=SOR.bus_stop_cd)
where 
T.trip_no='S290074'
and 1 < (select count(*) from stop S where S.code=T.bus_stop_cd and S.fleet_id=7)
group by SOR.route_no, T.trip_no


select SOR.route_no, T.trip_no, min(stop_seq) as  min_stop_seq , max(stop_seq)  as max_stop_seq
, count(distinct S.code), count(*)

from msrtc1.listoftrips T
inner join msrtc1.listofstopsonroutes SOR on (T.route_no=SOR.route_no and T.bus_stop_cd=SOR.bus_stop_cd)
inner join stop S on (T.bus_stop_cd=S.code and S.fleet_id=7)
where T.trip_no='L6090'

group by SOR.route_no, T.trip_no
having count(distinct S.code)>1



select * from msrtc1.tripsummary
where trip_no='L0994';

select trip_no, count(*) from msrtc1.tripsummary
group by trip_no having count(*)>1;
delete from msrtc1.tripsummary;

select greatest(null, '16:00:01')
select T.*,S.stop_id, S.name, St.*, concat(S.latitude,",",S.longitude)
from msrtc1.listoftrips T
inner join msrtc1.listofstopsonroutes SOR on (T.bus_stop_cd=SOR.bus_stop_cd and T.route_no=SOR.route_no)
inner join msrtc1.listofstops St on (SOR.bus_stop_cd=St.bus_stop_cd)
inner join stop S on (T.bus_stop_cd=S.code)
where 
T.trip_no = 'S173953'
order by T.trip_no, SOR.stop_seq
;

SELECT 
distinct
M.internal_route_cd as route_id
,'FULLW' as service_id 
,Tr.trip_no as trip_id
,'' as trip_short_name
,0 as direction_id
FROM route R
inner join internal_route_map M on (R.route_id=M.route_id)
inner join msrtc1.listoftrips Tr on (M.internal_route_cd=Tr.route_no)
where R.fleet_id=7
and Tr.trip_no='L8357'
;

select *
from internal_route_map where internal_route_cd=38545

delete from internal_route_map where internal_route_cd= 90637
select *
		from msrtc1.listofstopsonroutes sor 
		inner join msrtc1.listoftrips Tr on (Tr.route_no=sor.route_no and sor.bus_stop_cd=Tr.bus_stop_cd)
		/*where sor.route_no=90637*/
		where 'PLDHID'=sor.bus_stop_cd
order by Tr.trip_no


select R.*
from msrtc1.listofroutes R
where R.from_stop_cd='SWR' and till_stop_cd='DDRE'

select R.*, T.*
from msrtc1.listofroutes R
inner join msrtc1.listoftrips T on (R.route_no=T.route_no)
where R.from_stop_cd='SWR' and till_stop_cd='DDRE'
and T.bus_stop_cd='SWR' or T.bus_stop_cd='DDRE'


where R.route_no=1836

select *
from msrtc1.listofroutes R
where from_stop_cd='AWBCBS' and till_stop_cd='KND';

select SOR.*, S.*, St.latitude, St.longitude
from msrtc1.listofstopsonroutes SOR
inner join msrtc1.listofstops S on (SOR.bus_stop_cd=S.bus_stop_cd)
left outer join stop St on (St.code=S.bus_stop_cd)
where SOR.route_no=12349
order by SOR.stop_seq
;
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

select route_no
from msrtc1.listofroutes R
group by route_no
having count(*)>1
;
select count(distinct route_no)
from msrtc1.listoftrips T;



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




update fleet
set agency_phone='+912223071528',agency_url='http://www.msrtc.gov.in/', agency_lang='en',agency_timezone='Asia/Kolkata'
where fleet_id=7