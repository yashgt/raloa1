select S.stop_id, S.name, S.peer_stop_id, R.route_id
from stop S
left outer join routestop RS on (S.stop_id=RS.stop_id)
left outer join route R on (RS.route_id=R.route_id)
inner join (
select 
peer_stop_id 
from stop group by peer_stop_id
having count(*)>1 and peer_stop_id is not null
) D on (S.peer_stop_id=D.peer_stop_id)


order by S.peer_stop_id;
