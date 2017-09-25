drop table msrtc1.tripsummary;

/* Table of only the trips that have stops in TARA DB and boarding or alighting points or terminal stops*/
create table msrtc1.tripsummary
as 

select
        route_no
        ,trip_no
        , (select coalesce(departure_tm,arrival_tm)
                from msrtc1.listoftrips T1
                inner join msrtc1.listofstopsonroutes SOR1 on ( T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.bus_stop_cd)
                where SOR1.stop_seq=min_stop_seq
				and T1.route_no=Tr.route_no and T1.trip_no=Tr.trip_no
                limit 1
                ) as first_stop_departure_tm
        , (select coalesce(arrival_tm,departure_tm)
                from msrtc1.listoftrips T1
                inner join msrtc1.listofstopsonroutes SOR1 on (T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.bus_stop_cd)
                where SOR1.stop_seq=max_stop_seq
				and T1.route_no=Tr.route_no and T1.trip_no=Tr.trip_no
                limit 1
                ) as last_stop_arrival_tm
        , min_stop_seq
        , max_stop_seq


from
(
select SOR.route_no, T.trip_no, min(stop_seq) as  min_stop_seq , max(stop_seq)  as max_stop_seq
from msrtc1.listoftrips T
inner join msrtc1.listofstopsonroutes SOR on (T.route_no=SOR.route_no and T.bus_stop_cd=SOR.bus_stop_cd)
inner join stop S on (T.bus_stop_cd=S.code and S.fleet_id=7)
where 
/*
T.trip_no='M1985'
and
*/ 

(
T.is_alighting=1 
or T.is_boarding_stop=1 
or SOR.stop_seq=1
or SOR.stop_seq=(select max(stop_seq) from msrtc1.listofstopsonroutes SOR2 where SOR2.route_no=SOR.route_no)
)
group by SOR.route_no, T.trip_no
having count(distinct S.code)>1

) as Tr
;

create index idx_trip_tripsummary on msrtc1.tripsummary(trip_no);

/*
inner join msrtc1.listoftrips T1 on (T1.TRIP_NO=Tr.trip_no)
inner join msrtc1.listofstopsonroutes SOR1 on (T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.BUS_STOP_CD)
where SOR1.stop_seq=Tr.min_stop_seq 
group by T1.trip_no
having count(*) > 1
*/
