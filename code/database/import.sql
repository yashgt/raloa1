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

load data local 
infile 'C:\\mydata\\Projects\\NewYug\\raloa1\\data\\ktc\\temp.route.csv' 
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

load data local 
infile 'C:\\mydata\\Projects\\NewYug\\raloa1\\data\\ktc\\temp.internal_route_map.csv' 
into table temp.internal_route_map
FIELDS TERMINATED BY ','
IGNORE 1 LINES 
(@route_cd,@route_name,@internal_route_cd,@ETM_route_name,@ETM_Stage_Codes)
set route_cd=@route_cd
, route_name=@route_name
, internal_route_cd=@internal_route_cd
;

load data local 
infile 'C:\\mydata\\Projects\\NewYug\\raloa1\\data\\ktc\\temp.stage.csv' 
into table temp.stage
FIELDS TERMINATED BY ','
IGNORE 1 LINES 
(@depot, @route_no, @route_cd, @route_name, @stage_name, @sequence, @internal_stage_cd, @stage_type)
set route_cd=@route_cd
, stage_name=@stage_name, sequence=@sequence, internal_stage_cd=@internal_stage_cd, stage_type=@stage_type;


select 
-- count(*) 
*
from temp.route;

-- Find purged routes
select *
from route R
where R.route_cd not in (select route_cd from temp.route)
;


select IRM.internal_route_cd, R.route_cd, TIRM.internal_route_cd, TIRM.route_cd
from internal_route_map IRM 
inner join route R on (IRM.route_id=R.route_id)
inner join temp.internal_route_map TIRM on (TIRM.internal_route_cd=IRM.internal_route_cd)
-- where TIRM.route_cd<>R.route_cd
;

select *
from internal_route_map IRM
where IRM.internal_route_cd not in (select internal_route_cd from temp.internal_route_map)
;



select * 
from temp.internal_route_map
where route_name like '%AIRPORT%';


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
select *
from internal_route_map IRM;

insert into route(fleet_id, route_name, route_cd)
select 2, route_name, route_cd
from temp.route
where 
route_cd not in (select route_cd from route where fleet_id=2) 
and route_cd not like 'MRG3__' -- Keep Majhi bus out
order by route_cd;

-- first update
update internal_route_map IRM
-- select IRM.*, R.route_id from internal_route_map IRM
inner join temp.internal_route_map TIRM on (IRM.internal_route_cd=TIRM.internal_route_cd)
inner join route R on (TIRM.route_cd=R.route_cd)
set IRM.route_id=R.route_id
where R.fleet_id=2
and IRM.route_id<>R.route_id
and TIRM.internal_route_cd not like 'MRG3__' -- Keep Majhi bus out
;

insert into internal_route_map(route_id, internal_route_cd)
select R.route_id, RM.internal_route_cd
from route R
inner join temp.internal_route_map RM on (R.route_cd=RM.route_cd)
where R.fleet_id=2
and (RM.internal_route_cd not in (select internal_route_cd from internal_route_map))
and RM.internal_route_cd not like 'MRG3__' -- Keep Majhi bus out
-- and RM.internal_route_cd<>R.route_cd
;

drop table temp.latest_stage;
create table temp.latest_stage
as 
select SGS.stage_id, SGS.internal_stage_cd, SGS.sequence as old_sequence, TSGS.sequence as new_sequence, SGS.route_cd
	from
	(
		select
        SG.stage_id as stage_id
        , SG.internal_stage_cd as internal_stage_cd
		, SG.sequence as sequence
		-- , row_number() over (partition by SG.route_id order by SG.sequence) as sg_sequence
        , row_number() over (partition by SG.route_id, SG.internal_stage_cd order by SG.sequence) as sg_sequence
		, R.route_cd
		from stage SG
		inner join route R on (SG.route_id=R.route_id and R.fleet_id=2)
        -- where R.route_cd='MRG199'
		order by R.route_cd
	) 
    SGS
	inner join
	(
		select TSG.internal_stage_cd
		,TSG.sequence as sequence
		-- , row_number() over (partition by TSG.route_cd order by TSG.sequence) as tsg_sequence -- find sequence among 
        , row_number() over (partition by TSG.route_cd, TSG.internal_stage_cd order by TSG.sequence) as tsg_sequence -- find sequence among 
		, TSG.route_cd
		from
		temp.stage TSG  
		where 
        -- route_cd = 'MRG199' and
		TSG.internal_stage_cd in 
		(select internal_stage_cd 
		from stage SG
		inner join route R on (SG.route_id=R.route_id) where R.route_cd=TSG.route_cd )           
	) 
    TSGS
	on (SGS.internal_stage_cd=TSGS.internal_stage_cd and SGS.route_cd=TSGS.route_cd 
     and SGS.sg_sequence=TSGS.tsg_sequence
    )
	-- where SGS.sequence <> TSGS.sequence
    -- where SGS.route_cd in ('PRV190','PRV191')
	order by SGS.route_cd, SGS.sequence
;

select 
-- SG.*
R.route_cd, SG.internal_stage_cd, count(*)
from stage SG
inner join route R on (SG.route_id=R.route_id and R.fleet_id=2)
/*
where R.route_cd in 
('MRG176' -- ZAN
,'MRG199' -- CUR
,'MRG58','PNJ170','PNJ3','PNJ44','PNJ111','PRV123','PRV151','PRV163','PRV164','PRV190','PRV191','PRV49','PRV83','PRV84','PRV85','VSD50','VSD63')
*/
group by R.route_cd, SG.internal_stage_cd
having count(*) > 1
order by R.route_cd,SG.sequence
;

select *
from temp.latest_stage SGM
where route_cd in
('PRV7','MRG202','VSD23')
-- ('MRG176' -- ZAN,'MRG199' -- CUR,'MRG58','PNJ170','PNJ3','PNJ44','PNJ111','PRV123','PRV151','PRV163','PRV164','PRV190','PRV191','PRV49','PRV83','PRV84','PRV85','VSD50','VSD63')
and old_sequence<>new_sequence
order by route_cd, old_sequence
;

-- delete removed stages of routes --190
delete RS
-- select R.route_cd, R.route_name, SG.internal_stage_cd, LSG.internal_stage_cd, RS.*
-- select R.route_cd, R.route_name, SG.internal_stage_cd, TSG.internal_stage_cd, RS.*
from stage SG
inner join routestop RS on (RS.stage_id=SG.stage_id)
inner join route R on (R.route_id=SG.route_id and R.fleet_id=2)
left outer join temp.latest_stage LSG on (SG.stage_id=LSG.stage_id)
-- left outer join temp.stage TSG on (SG.internal_stage_cd=TSG.internal_stage_cd and R.route_cd=TSG.route_cd)
where 
LSG.stage_id is null
-- TSG.route_cd is null
;

-- 128
delete SG
-- select R.route_cd, R.route_name, SG.internal_stage_cd
-- , LSG.internal_stage_cd
from stage SG
inner join route R on (R.route_id=SG.route_id and R.fleet_id=2)
-- left outer join temp.stage TSG on (SG.internal_stage_cd=TSG.internal_stage_cd and R.route_cd=TSG.route_cd) where TSG.route_cd is null
left outer join temp.latest_stage LSG on (SG.stage_id=LSG.stage_id) where LSG.route_cd is null
-- and R.route_cd='MRG58'
;

select *
from temp.latest_stage
where route_cd='MRG58';

select *
from stage SG
inner join route R on (SG.route_id=R.route_id and R.fleet_id=2 and R.route_cd='MRG58')
where route_cd='MRG58';

-- update stages --228
update stage SG
-- select * from stage SG
inner join route R on (SG.route_id=R.route_id)
inner join temp.latest_stage SGM on 
-- (SG.internal_stage_cd=SGM.internal_stage_cd and R.route_cd=SGM.route_cd and SG.sequence=SGM.old_sequence and SGM.stage_id=SG.stage_id)
(SGM.stage_id=SG.stage_id)
set SG.sequence=SGM.new_sequence
where SGM.old_sequence <> SGM.new_sequence
;

/*
(
	select SGS.stage_id, SGS.internal_stage_cd, SGS.sequence as old_sequence, TSGS.sequence as new_sequence, SGS.route_cd
	from
	(
		select
        SG.stage_id as stage_id
        , SG.internal_stage_cd as internal_stage_cd
		, SG.sequence as sequence
		, row_number() over (partition by SG.route_id order by SG.sequence) as sg_sequence
		, R.route_cd
		from stage SG
		inner join route R on (SG.route_id=R.route_id and R.fleet_id=2)
		order by R.route_cd
	) SGS
	inner join
	(
		select TSG.internal_stage_cd
		,TSG.sequence as sequence
		, row_number() over (partition by TSG.route_cd order by TSG.sequence) as tsg_sequence
		, TSG.route_cd
		from
		temp.stage TSG 
		where 
		TSG.internal_stage_cd in 
		(select internal_stage_cd 
		from stage SG
		inner join route R on (SG.route_id=R.route_id) where R.route_cd=TSG.route_cd )
	) TSGS
	on (SGS.internal_stage_cd=TSGS.internal_stage_cd and SGS.route_cd=TSGS.route_cd and SGS.sg_sequence=TSGS.tsg_sequence)
	where SGS.sequence <> TSGS.sequence
	order by SGS.route_cd
) as SGM on 
	(SG.internal_stage_cd=SGM.internal_stage_cd and R.route_cd=SGM.route_cd and SG.sequence=SGM.old_sequence and SGM.stage_id=SG.stage_id)
*/

select *
from temp.stage TSG
where route_cd in ('PRV7','MRG202','VSD23')
;
insert into stage(stage_name, route_id, internal_stage_cd, is_via, sequence)
select TSG.stage_name
, R.route_id
-- , R.route_cd
, TSG.internal_stage_cd
, case 
	when TSG.stage_type is null then null 
    when TSG.stage_type like "via" then 1    
  end,
  TSG.sequence  
from temp.stage TSG
inner join route R on (R.route_cd=TSG.route_cd and R.fleet_id=2)
left outer join stage SG on (SG.internal_stage_cd=TSG.internal_stage_cd and SG.route_id=R.route_id and SG.sequence=TSG.sequence)
where 
SG.internal_stage_cd is null 
-- R.route_cd in ('PRV7','MRG202','VSD23')
order by R.route_cd, TSG.sequence
;

delete IRM
-- select *
from internal_route_map IRM
inner join route R on (R.route_id=IRM.route_id)
left outer join stage SG on (R.route_id=SG.route_id)
where 
SG.route_id is null and 
R.fleet_id=2
;

-- Delete routes that have no stages left
delete R
-- select * 
from route R
left outer join stage SG on (R.route_id=SG.route_id)
where 
SG.route_id is null and 
R.fleet_id=2
;

and R.route_cd in ('VSD23', 'PRV7', 'MRG202') -- These wre previously there but now are not rep routes.



delete R
from route R
inner join temp.mv_purgeroutes P on (R.route_cd=P.purged_internal_route_cd)
where P.new_internal_route_cd is null
;
-- 

select *
from
(
select R.route_cd, SG.internal_stage_cd, SG.sequence
, row_number() over (partition by SG.route_id order by SG.sequence) as row_num
from stage SG 
inner join route R on (SG.route_id=R.route_id and R.fleet_id=2)
-- where R.route_cd in ('VSD62','VSD26')
where R.route_cd in ('MRG176','MRG199')
order by R.route_cd, SG.sequence
) SGM
where sequence<>row_num;


select SG.*, TSG.*
from stage SG
inner join route R on (SG.route_id=R.route_id and R.fleet_id=2)
inner join temp.stage TSG 
	on (TSG.internal_stage_cd=SG.internal_stage_cd and TSG.sequence<>SG.sequence and TSG.route_cd=R.route_cd)
order by R.route_id, SG.sequence
;

-- insert stages


-- ----------

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
