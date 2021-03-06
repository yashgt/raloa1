drop table msrtc1.tripsummary;

/* Table of only the trips that have stops in TARA DB and boarding or alighting points or terminal stops*/
create table msrtc1.tripsummary
as 

select
        route_no
        ,trip_no
        , (select time(coalesce(departure_tm,arrival_tm))
                from msrtc1.listoftrips T1
                /*inner join msrtc1.listofstopsonroutes SOR1 on ( T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.bus_stop_cd)*/
                /*where SOR1.stop_seq=min_stop_seq*/
                where T1.stop_seq=min_stop_seq and T1.route_no=Tr.route_no and T1.trip_no=Tr.trip_no
		order by date(arrival_tm) desc
                limit 1
                ) as first_stop_departure_tm
        , (select time(coalesce(arrival_tm,departure_tm))
                from msrtc1.listoftrips T1
/*                inner join msrtc1.listofstopsonroutes SOR1 on (T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.bus_stop_cd)*/
                where T1.stop_seq=max_stop_seq and T1.route_no=Tr.route_no and T1.trip_no=Tr.trip_no
                order by date(arrival_tm) desc
		limit 1
                ) as last_stop_arrival_tm
        , min_stop_seq
        , max_stop_seq


from
(
select SOR.route_no, T.trip_no, min(T.stop_seq) as  min_stop_seq , max(T.stop_seq)  as max_stop_seq
from msrtc1.listoftrips T
inner join msrtc1.listofstopsonroutes SOR on (T.route_no=SOR.route_no and T.bus_stop_cd=SOR.bus_stop_cd)
inner join stop S on (T.bus_stop_cd=S.code and S.fleet_id=7)
where 
/*
T.trip_no='M1985'
and
*/ 
T.start_date<'2018-01-01'
and
(
T.is_alighting=1 
or T.is_boarding_stop=1 
or T.stop_seq=1
or T.stop_seq=(select max(stop_seq) from msrtc1.listofstopsonroutes SOR2 where SOR2.route_no=SOR.route_no)
)
and (time(T.arrival_tm)<>'00:00:00' or time(T.departure_tm)<>'00:00:00')
/*and 1 = (select count(*) from msrtc1.listoftrips T1 where T1.trip_no=T.trip_no and T1.route_no=T.route_no and T1.bus_stop_cd=T.bus_stop_cd group by date(T1.arrval_tm) as having date(T.arrival_tm)=date(T1.arrival_tm)))*/

group by SOR.route_no, T.trip_no
having count(distinct SOR.bus_stop_cd)>1

) as Tr
;

create index idx_trip_tripsummary on msrtc1.tripsummary(trip_no);
create index idx_route_tripsummary on msrtc1.tripsummary(route_no);

/*
inner join msrtc1.listoftrips T1 on (T1.TRIP_NO=Tr.trip_no)
inner join msrtc1.listofstopsonroutes SOR1 on (T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.BUS_STOP_CD)
where SOR1.stop_seq=Tr.min_stop_seq 
group by T1.trip_no
having count(*) > 1
*/
