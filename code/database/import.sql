create schema temp;
SET GLOBAL local_infile = 1;
SHOW GLOBAL VARIABLES LIKE 'local_infile'; 
drop table temp.route ;
drop table temp.internal_route_map ;
drop table temp.stage ;
CREATE TABLE if not exists temp.route
(
depot varchar(255),
route_no varchar(255),
route_cd varchar(255),
route_name varchar(255)
);

CREATE TABLE if not exists temp.internal_route_map
(
route_cd varchar(255),
route_name varchar(255),
internal_route_cd varchar(255)
);

CREATE TABLE if not exists temp.stage
(
route_cd varchar(255),
stage_name varchar(255),
sequence integer,
internal_stage_cd varchar(255),
stage_type varchar(255)
);

create table if not exists temp.shortcodes
(name varchar(255),
code varchar(3)
);
load data local 
infile 'D:\\Projects\\NewYug\\raloa1\\data\\ktc\\temp.shortcodes.csv' 
into table temp.shortcodes
FIELDS TERMINATED BY ','
IGNORE 1 LINES 
;
select count(*) from temp.shortcodes;

select * from temp.shortcodes;



load data local 
infile 'D:\\Projects\\NewYug\\raloa1\\data\\ktc\\temp.route.csv' 
into table temp.route
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES 
(@depot, @route_no, @route_cd, @route_name)
set depot=@depot
, route_no=@route_no
, route_cd=@route_cd
, route_name=@route_name
;

select 
-- count(*) 
*
from temp.route;

load data local 
infile 'D:\\Projects\\NewYug\\raloa1\\data\\ktc\\temp.internal_route_map.csv' 
into table temp.internal_route_map
FIELDS TERMINATED BY ','
IGNORE 1 LINES 
(@route_cd,@route_name,@internal_route_cd,@ETM_route_name,@ETM_Stage_Codes)
set route_cd=@route_cd
, route_name=@route_name
, internal_route_cd=@internal_route_cd
;

select * 
from temp.internal_route_map
where route_name like '%AIRPORT%';


load data local 
infile 'D:\\Projects\\NewYug\\raloa1\\data\\ktc\\temp.stage.csv' 
into table temp.stage
FIELDS TERMINATED BY ','
IGNORE 1 LINES 
(@depot, @route_no, @route_cd, @route_name, @stage_name, @sequence, @internal_stage_cd, @stage_type)
set route_cd=@route_cd
, stage_name=@stage_name, sequence=@sequence, internal_stage_cd=@internal_stage_cd, stage_type=@stage_type;


select count(*) from temp.internal_route_map;
select count(*) from temp.stage;

select * from fleet;
select distinct fleet_id from route;

/*
delete RM
from internal_route_map RM
inner join route R on (R.route_id=RM.route_id )
where R.fleet_id=2 
;

delete RST
from route R 
inner join routestop RS on (R.route_id = RS.route_id )
inner join routestoptrip RST on (RST.route_stop_id=RS.route_stop_id)
where R.fleet_id=2
;

delete RS
from route R 
inner join routestop RS on (R.route_id = RS.route_id )
where R.fleet_id=2
;

delete SG
from route R 
inner join stage SG on (R.route_id = SG.route_id )
where R.fleet_id=2
;

delete T
from route R 
inner join trip T on (R.route_id = T.route_id )
where R.fleet_id=2
;

delete from route where fleet_id=2;
--  START
insert into route(fleet_id, route_name, route_cd)
select 2, route_name, route_cd
from temp.route
where route_cd not in (select route_cd from route where fleet_id=2) 
order by route_cd;

select *
from route
where fleet_id=2
and route_cd in ( 'PRV150' ,'PRV154' ,'PRV160' ,'PRV161','PRV197' ,'PRV226' ,'VSD70')
;

select *
from internal_route_map IRM
inner join route R on (IRM.route_id=R.route_id)
where internal_route_cd in ( 'PRV150' ,'PRV154' ,'PRV160' ,'PRV161','PRV197' ,'PRV226' ,'VSD70')
;

select * from temp.route;
select *
from temp.internal_route_map IRM
where internal_route_cd in ('MRG301');
*/

insert into internal_route_map(route_id, internal_route_cd)
select R.route_id, RM.internal_route_cd
from route R
inner join temp.internal_route_map RM on (R.route_cd=RM.route_cd)
where R.fleet_id=2
and (RM.internal_route_cd not in (select internal_route_cd from internal_route_map))
and RM.internal_route_cd<>R.route_cd
;

insert into stage(stage_name, route_id, internal_stage_cd, is_via, sequence)
select SG.stage_name
, R.route_id
, SG.internal_stage_cd
, case 
	when SG.stage_type is null then null 
    when SG.stage_type = "via" then 1    
  end,
  SG.sequence  
from temp.stage SG
inner join temp.route TR on (SG.route_cd=TR.route_cd)
inner join route R on (TR.route_cd=R.route_cd and R.fleet_id=2)
;

select *, length(internal_stage_cd) from temp.stage where route_cd='MRG176';
select 
SG.*
/*
, SG.internal_stage_cd
, case 
	when SG.stage_type is null then null 
    when SG.stage_type = "via" then 1    
  end,
  SG.sequence
  */
from temp.stage SG
left outer join temp.route TR on (SG.route_cd=TR.route_cd)
where TR.route_cd is null 
;


select * from route where fleet_id=2 and route_cd='MRG1';

select * from temp.internal_route_map where route_cd='MRG1';

call get_route_detail(6089);

call get_fleet_detail(3);

select *
from temp.stage 
group by route_cd, sequence
having count(*)>1
;
select count(*)
from route where fleet_id=2
