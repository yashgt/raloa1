insert into stop(latitude, longitude,name) values(17.5, 72.0, 'A');
insert into stop(latitude, longitude,name) values(17.4, 72.3, 'B');
insert into stop(latitude, longitude,name) values(17.3, 73.0, 'C');
insert into stop(latitude, longitude,name) values(17.2, 74.0, 'D');
insert into stop(latitude, longitude,name) values(17.1, 72.0, 'E');
/*select stop_id, AsText(location), loc_text from stop_loc ;*/

set profiling=1;
/*explain*/
select stop_id, AsText(location), ST_Distance(PointFromText('POINT(17.2 72)'), location) as distance
from stop_detail 
order by distance
limit 1;

alter table stop_loc ADD SPATIAL INDEX(location);
select stop_id, AsText(location), ST_Distance(PointFromText('POINT(17.2 72)'), location) as distance
from stop_detail 
order by distance
limit 1;

show profiles;