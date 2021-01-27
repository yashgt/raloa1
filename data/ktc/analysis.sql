select distinct A.internal_route_cd
from 
(
select R.route_id as route_id
, (select group_concat(internal_route_cd separator ',') from internal_route_map group by route_id having route_id=R.route_id) as internal_route_cd
, SG.stage_id
, SG.stage_name
from route R
inner join stage SG on SG.route_id=R.route_id
left outer join routestop RS on (RS.route_id=R.route_id and RS.stage_id=SG.stage_id)
where R.fleet_id=2
and RS.route_stop_id is null
order by internal_route_cd
) A
;



select distinct T.route_id 
from routestoptrip RST 
inner join trip T on (RST.trip_id=T.trip_id) 
inner join routestop RS on (RST.route_stop_id=RS.route_stop_id)
where T.fleet_id=3 
and time between '00:00' and '06:00' 
and RS.sequence=1
order by T.route_id
;


select *
from stop
where fleet_id=2;

select SG.stage_name
from stage SG
inner join route R on (SG.route_id=R.route_id)
and R.fleet_id=2
and SG.is_via=true


select R.route_id, S1.name, S2.name
from route R
inner join stop S1 on (R.start_stop_id=S1.stop_id)
inner join stop S2 on (R.end_stop_id=S2.stop_id)
where (S1.name like 'Vasco%' and S2.name like 'Panaji%') or (S2.name like 'Vasco%' and S1.name like 'Panaji%');

/* Triangular format of a route */
select RS.sequence, S.name, S.latitude, S.longitude, coalesce(SG.distance,0) as distance
from route R
inner join routestop RS on (RS.route_id=R.route_id)
inner join stop S on (S.stop_id in (RS.stop_id))
left outer join stop PS on 
	(PS.stop_id in (select stop_id 
		from routestop 
        where 
        route_id=R.route_id and sequence=RS.sequence-1 ))
left outer join segment SG on (SG.from_stop_id=PS.stop_id and SG.to_stop_id=S.stop_id)
where R.route_id in 
/*(525)*/
/*(602)*/
(
order by R.route_id, RS.sequence;

select R.route_id, RS.sequence, S.name, S.latitude, S.longitude
from route R
inner join routestop RS on (RS.route_id=R.route_id)
inner join stop S on (S.stop_id in (RS.peer_stop_id))
left outer join stop PS on 
	(PS.stop_id in (select stop_id 
		from routestop 
        where 
        route_id=R.route_id and sequence=RS.sequence+1 ))
where R.route_id in 
/*(525)*/
(622)
/*
(select R.route_id
from route R
inner join stop S1 on (R.start_stop_id=S1.stop_id)
inner join stop S2 on (R.end_stop_id=S2.stop_id)
where (S1.name like 'Vasco%' and S2.name like 'Panaji%') or (S2.name like 'Vasco%' and S1.name like 'Panaji%')
)*/
order by R.route_id, RS.sequence desc