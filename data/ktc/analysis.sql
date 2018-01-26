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


