drop table temp.purgeroutes;
create table if not exists temp.purgeroutes
(
route_cd varchar(255)
);

delete from temp.purgeroutes;

SET GLOBAL local_infile = 1;
load data local 
infile 
-- 'C:\\mydata\\Projects\\NewYug\\raloa1\\data\\ktc\\temp.purgeroutes.csv' 
'C:/mydata/Projects/NewYug/raloa1/data/ktc/temp.purgeroutes.csv'
into table temp.purgeroutes
FIELDS TERMINATED BY ','
IGNORE 1 LINES 
(@route_cd) -- input columns
set
route_cd=replace(@route_cd,'\r','')
;


select route_cd, length(route_cd)
from temp.purgeroutes;

-- REPORT
select *
from internal_route_map
where internal_route_cd in (select route_cd from temp.purgeroutes)
;
-- List of existing IRMs that match the purged routes
drop table temp.mv_purgeroutes;
create table temp.mv_purgeroutes
as
select 
R.route_id -- parent route
,R.route_cd -- parent route cd
,RM.internal_route_cd as purged_internal_route_cd
, (select internal_route_cd 
from internal_route_map RM
where
RM.route_id=R.route_id 
and RM.internal_route_cd<>P.route_cd 
and RM.internal_route_cd not in (select route_cd from temp.purgeroutes) 
order by RM.internal_route_cd limit 1
) as new_internal_route_cd

from
temp.purgeroutes P 
inner join internal_route_map RM on (RM.internal_route_cd=P.route_cd)
inner join route R on (R.route_id=RM.route_id)
order by P.route_cd
;
select * from temp.mv_purgeroutes
order by purged_internal_route_cd; 

-- Delete R, IRM, RS, SG
-- Delete RS only if the purged routes 
delete RS
from route R
inner join routestop RS on (RS.route_id=R.route_id)
inner join temp.mv_purgeroutes P on (R.route_cd=P.purged_internal_route_cd)
where P.new_internal_route_cd is null
;

delete SG
from route R
inner join stage SG on (SG.route_id=R.route_id)
inner join temp.mv_purgeroutes P on (R.route_cd=P.purged_internal_route_cd)
where P.new_internal_route_cd is null
;



delete IRM
from internal_route_map IRM
inner join temp.mv_purgeroutes P on (IRM.internal_route_cd=P.purged_internal_route_cd)
;

delete R
from route R
inner join temp.mv_purgeroutes P on (R.route_cd=P.purged_internal_route_cd)
where P.new_internal_route_cd is null
;

select *
from route R
inner join temp.mv_purgeroutes P on (P.purged_internal_route_cd=R.route_cd)
;

-- If Purged route is Rep of someone else, set the Rep as something else
update route R
inner join temp.mv_purgeroutes P on (P.purged_internal_route_cd=R.route_cd)
set R.route_cd=P.new_internal_route_cd
where P.new_internal_route_cd is not null -- replace only where substitute are available
;