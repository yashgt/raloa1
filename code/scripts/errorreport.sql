/*
select RS.stop_id, RS.peer_stop_id, R.route_id
from route R
inner join routestop RS on (R.route_id=RS.route_id)
where 
	RS.stop_id in (96) or RS.peer_stop_id in (96);

select *
from segment
where from_stop_id in (96) or to_stop_id in (96);
*/


CREATE TEMPORARY TABLE IF NOT EXISTS table2 AS (
select *
from stop S
where peer_stop_id in
(
select peer_stop_id
from stop 
group by peer_stop_id
having count(*)>1
)
)
;

select T.stop_id, T.name, T.latitude, T.longitude, T.peer_stop_id, S.name, S.peer_stop_id 
from table2 T
inner join stop S on (T.peer_stop_id=S.stop_id)
order by T.peer_stop_id
;
/*select * from stop where stop_id in (221,222,1394,1567,1568); */
select RS.stop_id, RS.peer_stop_id, R.route_id
from route R
inner join routestop RS on (R.route_id=RS.route_id)
inner join table2 T on (RS.stop_id=T.stop_id or RS.peer_stop_id=T.stop_id or RS.peer_stop_id=T.peer_stop_id or RS.stop_id=T.peer_stop_id)
order by R.route_id
;

select S1.stop_id, S1.name, S2.stop_id, S2.name
from stop S1
inner join stop S2 on (S1.peer_stop_id = S2.stop_id and S1.stop_id=S2.peer_stop_id)
where S1.name <> S2.name
;

delete from stop_loc where stop_id not in (select stop_id from stop);

select S.stop_id, S.name, S.latitude, S.longitude, S.peer_stop_id, L.cnt
from stop S
inner join
(
select stop_id, count(*) as cnt
from
(
select 
S1.stop_id stop_id, st_distance(S1.location, S2.location) d
from stop_loc S1 
inner join stop_loc S2 on S1.stop_id<>S2.stop_id 
where 
st_distance(S1.location, S2.location) < 0.0002
) as T
group by stop_id
having count(*)>2
) L on (S.stop_id=L.stop_id)
order by S.latitude, S.longitude
; 

select RS.route_id, RS.stop_id, RS.peer_stop_id, S1.name, S1.stop_id, S1.peer_stop_id, S2.name, S2.stop_id, S2.peer_stop_id  
from routestop RS
inner join stop S1 on (RS.stop_id=S1.stop_id)
inner join stop S2 on (S1.peer_stop_id=S2.stop_id)
where RS.peer_stop_id<>S2.stop_id and RS.peer_stop_id<>RS.stop_id
;

/*
select S1.*
from segment S1
inner join table2 S2 on (S1.from_stop_id=S2.stop_id or S1.to_stop_id=S2.stop_id)
;
*/


