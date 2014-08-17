create procedure route_detail(
IN routeId int
)
begin
declare x int;
set x = 1;

while x < (select max(sequence) from routestop where route_id=routeId) DO
select S.stop_id as stop_id, S.name as stop_name, S.latitude as latitude, S.longitude as longitude, Seg.distance as distance
from stop S
inner join routestop RS on (S.stop_id=RS.stop_id)
inner join segment Seg on (S.stop_id=Seg.stop1_id)
where route_id = routeId AND stop1_id=(select stop_id from routestop where route_id=routeId AND sequence=x)  AND stop2_id=(select stop_id from routestop where route_id=routeId AND sequence=x+1) ;
SET x = x+1;
order by sequence asc;

select trip_id, direction
from trip
where route_id = routeId;

select T.trip_id as trip_id , RST.time as time , S.stop_id as stop_id
from trip T , routestoptrip RST , routestop RS , stop S 
where T.trip_id = RST.trip_id and RST.route_stop_id = RS.route_stop_id and RS.stop_id = S.stop_id and T.route_id = routeId ;

set x = 1;
while x < (select max(sequence) from routestop where route_id=routeId) DO
select distance, time
from segment
where stop1_id=(select stop_id from routestop where route_id=routeId AND sequence=x)  AND stop2_id=(select stop_id from routestop where route_id=routeId AND sequence=x+1) ;
SET x = x+1;
end while;
end//
