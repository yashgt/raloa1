
create table msrtc1.tripsummary
as 

select trip_no
	, (select departure_tm 
		from msrtc1.listoftrips T1 
		inner join msrtc1.listofstopsonroutes SOR1 on (T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.bus_stop_cd)
		where SOR1.stop_seq=min_stop_seq
		limit 1
		) as first_stop_departure_tm
	, (select arrival_tm 
		from msrtc1.listoftrips T1 
		inner join msrtc1.listofstopsonroutes SOR1 on (T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.bus_stop_cd)
		where SOR1.stop_seq=max_stop_seq
		limit 1
		) as last_stop_arrival_tm
	, min_stop_seq
	, max_stop_seq

/*select T1.trip_no, count(*)*/
from
(
select trip_no, min(stop_seq) as  min_stop_seq , max(stop_seq)  as max_stop_seq
from msrtc1.listoftrips T 
inner join msrtc1.listofstopsonroutes SOR on (T.route_no=SOR.route_no)
group by trip_no
) as Tr 

/*
inner join msrtc1.listoftrips T1 on (T1.TRIP_NO=Tr.trip_no)
inner join msrtc1.listofstopsonroutes SOR1 on (T1.route_no=SOR1.route_no and T1.bus_stop_cd=SOR1.BUS_STOP_CD)
where SOR1.stop_seq=Tr.min_stop_seq 
group by T1.trip_no
having count(*) > 1
*/
