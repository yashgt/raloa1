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
inner join stop S on (S.code =T.bus_stop_cd)
where  T.departure_tm < T.arrival_tm and T.departure_tm <> '00:00:00' 
and timediff(T.arrival_tm, T.departure_tm) < '12:00:00'
;


select * from msrtc1.listofroutes;


select 
	R1.route_no, R1.route_name
	,S1.stop_id, S2.stop_id
	from msrtc1.listofroutes R1 
inner join (
select R1.route_no as route_no, concat(R1.route_no, coalesce(concat("-", R2.route_no), "")) as route_cd, R1.stops
from
(
	select 
	R1.route_no, group_concat(R1.bus_stop_cd) as stops
	from
	(
		select R1.route_no, SOR.bus_stop_cd as bus_stop_cd	
		from msrtc1.listofroutes R1 	
		inner join msrtc1.listofstopsonroutes SOR on (R1.route_no=SOR.route_no)
		where exists (select 1 from msrtc1.listoftrips Tr where Tr.route_no=R1.route_no)
		and R1.route_no like '10%'	
		order by SOR.STOP_SEQ
	) as R1
	group by R1.route_no
) as R1
left outer join
(
	select 
	R1.route_no, group_concat(R1.bus_stop_cd) as stops
	from
	(
		select R1.route_no, SOR.bus_stop_cd as bus_stop_cd	
		from msrtc1.listofroutes R1 	
		inner join msrtc1.listofstopsonroutes SOR on (R1.route_no=SOR.route_no)
		where exists (select 1 from msrtc1.listoftrips Tr where Tr.route_no=R1.route_no)
		and R1.route_no like '10%'	
		order by SOR.STOP_SEQ desc
	) as R1
	group by R1.route_no
) as R2
on (R1.route_no <> R2.route_no and R1.stops=R2.stops)
where R1.route_no < R2.route_no or R2.route_no is null

) as CR on (R1.route_no=CR.route_no)
	inner join stop S1 on (S1.code=R1.from_stop_cd and S1.fleet_id=7) /*import only those whose start and end stops are present already */
	inner join stop S2 on (S2.code=R1.till_stop_cd and S2.fleet_id=7)
	and exists (select 1 from msrtc1.listoftrips Tr where Tr.route_no=R1.route_no)
	left outer join internal_route_map M on (R1.route_no=M.internal_route_cd)
	left outer join route R on ( M.route_id=R.route_id and R.fleet_id=7)
	
	where R.route_id is null
	
	
select R1.route_no as route_no, concat(R1.route_no, coalesce(concat("-", R2.route_no), "")) as route_cd, R1.stops
from
(
	select 
	R1.route_no, group_concat(R1.bus_stop_cd) as stops
	from
	(
		select R1.route_no, SOR.bus_stop_cd as bus_stop_cd	
		from msrtc1.listofroutes R1 	
		inner join msrtc1.listofstopsonroutes SOR on (R1.route_no=SOR.route_no)
		where exists (select 1 from msrtc1.listoftrips Tr where Tr.route_no=R1.route_no)
		and R1.route_no like '10%'	
		order by SOR.STOP_SEQ
	) as R1
	group by R1.route_no
) as R1
left outer join
(
	select 
	R1.route_no, group_concat(R1.bus_stop_cd) as stops
	from
	(
		select R1.route_no, SOR.bus_stop_cd as bus_stop_cd	
		from msrtc1.listofroutes R1 	
		inner join msrtc1.listofstopsonroutes SOR on (R1.route_no=SOR.route_no)
		where exists (select 1 from msrtc1.listoftrips Tr where Tr.route_no=R1.route_no)
		and R1.route_no like '10%'	
		order by SOR.STOP_SEQ desc
	) as R1
	group by R1.route_no
) as R2
on (R1.route_no <> R2.route_no and R1.stops=R2.stops)
where R1.route_no < R2.route_no or R2.route_no is null
;

	
	

select * 
from msrtc1.listofstopsonroutes SOR
where route_no in ('59065', '59066', '97149', '97150', '97174', '97175')
order by route_no, stop_seq;


select *
from msrtc1.listoftrips T
where route_no= '97174'
order by trip_no
;



select substring(R.internal_route_cd, 1,3) as division_cd
,LOR.route_name
,R.internal_route_cd
from
(
	select 
	R.route_id as route_id
	, case R.route_name='ABC' or R.route_name is null 
		when true then convert(R.route_id using utf8) 
		else R.route_name
	end as route_name
    , (select group_concat(internal_route_cd separator ',') from internal_route_map where route_id=R.route_id group by route_id ) as internal_route_cd
	, coalesce(S1.name
                , (select SG.stage_name 
                from stage SG 
                where SG.route_id=R.route_id 
                and SG.sequence=(select min(SG1.sequence) from stage SG1 where SG1.route_id=R.route_id group by SG1.route_id))) 
    as start_stop_name
	, coalesce(S2.name
				, (select stage_name 
				from stage SG 
				where SG.route_id=R.route_id 
				and SG.sequence=(select max(SG1.sequence) from stage SG1 where SG1.route_id=R.route_id group by SG1.route_id))) as end_stop_name
,(case 
	(S1.location_status<>0 
	and S2.location_status<>0 	
	and exists 
	(select *
		from routestop RS 		
		inner join stop S 
		where RS.stop_id=S.stop_id and RS.route_id=R.route_id and S.location_status=0		
	)	
	) 
	when true then 1 
	else 0 
	end ) * 16
| (select case count(*) when 0 then 0 else 1 end from trip where route_id=R.route_id and fleet_id=7 limit 1) * 8
| (select case count(*) when 0 then 0 else 1 end from internal_route_map where route_id=R.route_id limit 1) * 4 
| (select case count(*) when 0 then 0 else 1 end from stage SG where SG.route_id=R.route_id limit 1) * 2 
| (select case count(*) when 0 then 0 else 1 end from routestop RS where RS.route_id=R.route_id limit 1)
    as status

	from route R
    left outer join stop S1 on (R.start_stop_id=S1.stop_id)
	left outer join stop S2 on (R.end_stop_id=S2.stop_id)    
	where R.fleet_id = 7
	and R.is_deleted=0
	having status>=16
	order by start_stop_name asc, end_stop_name asc, route_name asc
) as R
inner join msrtc1.listofroutes LOR on (substr(R.internal_route_cd,5,length(substring_index(substr(R.internal_route_cd,5),'-',1)))=LOR.route_no)
order by division_cd, LOR.route_name
	;


select substr('asd-adasda',5);
	

select R1.route_no, R1.route_name, R1.via_stop_cd, R2.route_no, R2.route_name, R2.via_stop_cd
from msrtc1.listofroutes R1
inner join msrtc1.listofroutes R2 
	on (R1.from_stop_cd=R2.till_stop_cd 
	and R1.till_stop_cd=R2.from_stop_cd 
	and (R1.via_stop_cd=R2.via_stop_cd or (R1.via_stop_cd is null and R2.via_stop_cd is null))
	)
where R1.route_no < R2.route_no
/*and R1.via_stop_cd<>R2.via_stop_cd*/

and R1.onward_stops<>R2.return_stops
;
