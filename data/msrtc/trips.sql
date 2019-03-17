drop table tripsummary;

/* Table of only the trips that have stops with latlon and boarding or alighting points or terminal stops*/
create table tripsummary
as 

select
        route_no
        ,trip_no
        , (select time(coalesce(departure_tm,arrival_tm))
                from listoftrips T1
                /*inner join msrtc1.listofstopsonroutes SOR1 on ( T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.bus_stop_cd)*/
                /*where SOR1.stop_seq=min_stop_seq*/
                where T1.stop_seq=min_stop_seq and T1.route_no=Tr.route_no and T1.trip_no=Tr.trip_no
		order by date(arrival_tm) desc
                limit 1
                ) as first_stop_departure_tm
        , (select time(coalesce(arrival_tm,departure_tm))
                from listoftrips T1
/*                inner join msrtc1.listofstopsonroutes SOR1 on (T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.bus_stop_cd)*/
                where T1.stop_seq=max_stop_seq and T1.route_no=Tr.route_no and T1.trip_no=Tr.trip_no
                order by date(arrival_tm) desc
		limit 1
                ) as last_stop_arrival_tm
        , min_stop_seq
        , max_stop_seq

from
(
select
SOR.route_no
, R.stop_cnt
, R.geocoded_stop_cnt
, T.trip_no
, min(T.stop_seq) as  min_stop_seq
, max(T.stop_seq)  as max_stop_seq
from listofroutes R
inner join listofstopsonroutes SOR on (SOR.route_no=R.route_no)
left outer join listoftrips T 
	on (
	T.route_no=SOR.route_no and T.bus_stop_cd=SOR.bus_stop_cd
	and T.start_date<'2018-01-01'
	and
	(
		T.is_alighting=1 
		or T.is_boarding_stop=1 
		or T.stop_seq=1
		or T.stop_seq=(select max(stop_seq) from listofstopsonroutes SOR2 where SOR2.route_no=SOR.route_no)
	)
	and (T.arrival_tm<>'0000-00-00 00:00:00' or T.departure_tm<>'0000-00-00 00:00:00')
	)
where 
R.stop_cnt=R.geocoded_stop_cnt
group by SOR.route_no, T.trip_no
having T.trip_no is not null

) as Tr
;


create index idx_trip_tripsummary on tripsummary(trip_no);
create index idx_route_tripsummary on tripsummary(route_no);


