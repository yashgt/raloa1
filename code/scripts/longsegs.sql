select * from route;

select RS1.route_id, RS1.sequence, RS2.sequence, S1.name, S2.name, G.distance 
from segment as G 
inner join stop as S1 
inner join stop as S2 on (G.from_stop_id=S1.stop_id and G.to_stop_id=S2.stop_id)
inner join routestop RS1 on (RS1.stop_id=S1.stop_id)
inner join routestop RS2 on (RS2.stop_id=S2.stop_id)
where 
G.distance> 6000 
and RS1.route_id=RS2.route_id
and RS1.sequence<RS2.sequence
order by distance desc;
