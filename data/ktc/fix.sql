update stage
set internal_stage_cd=case 
	when stage_name='VELIM' then 'VLM' 
    when stage_name='BARADI' then 'BRD' 
    when stage_name='MUXER B/S' then 'ZAR'
    when stage_name='BETUL X' then 'BTX'
    when stage_name='BETUL' then 'BTL'
    when stage_name='DANDO' then 'DDO'
    when stage_name='THANE' then 'TNE'
    else internal_stage_cd
    end
where internal_stage_cd is null and 
	stage_name in ('VELIM','BARADI', 'MUXER B/S', 'BETUL X','BETUL','DANDO','THANE')
;


update stage
set internal_stage_cd=substring(internal_stage_cd,1,3) ;

select * from stage
where length(internal_stage_cd)>3
;

select route_cd, stage_name, hex(internal_stage_cd), hex(substring(internal_stage_cd,1,3)), length(trim(internal_stage_cd))
from stage 
inner join route on (route.fleet_id=2 and stage.route_id=route.route_id)
where length(internal_stage_cd)=4 or internal_stage_cd is null
group by length(internal_stage_cd)
;

update stage
set internal_stage_cd=case 
	when stage_name='EV R FERRY' then 'RAS' 
    else internal_stage_cd
    end
where stage_name in ('EV R FERRY')
;

select *
from stage 
where stage_name = 'EV R FERRY' ;
-- select SG.*, SC.name, SC.code

update stage SG
-- select SG.*, SC.name, SC.code
-- from stage SG
inner join route R on (SG.route_id=R.route_id)
inner join temp.shortcodes SC on (SG.stage_name=SC.name)
set SG.internal_stage_cd=SC.code
where R.fleet_id=2
and SG.internal_stage_cd is null
;

update stage
set internal_stage_cd=case 
when stage_name='EV PANAJI' then 'PNJ'
when stage_name='EV BAMB GMC' then 'GMC'
when stage_name='GOAUNVERSIT' then 'GUN'
when stage_name='CAB.DE.RAM' then 'CAB'
when stage_name='OLD GOA CHURCH' then 'OLD'
else internal_stage_cd
    end
where stage_name in ('EV PANAJI','EV BAMB GMC','GOAUNVERSIT','CAB.DE.RAM','OLD GOA CHURCH')
and internal_stage_cd is null

;


select *
from stage
where stage_name like '%MUXER%'
;

create table if not exists temp.purgeroutes
(
route_cd varchar(255)
);

SET GLOBAL local_infile = 1;
load data local 
infile 'D:\\Projects\\NewYug\\raloa1\\data\\ktc\\temp.purgeroutes.csv' 
into table temp.purgeroutes
FIELDS TERMINATED BY ','
IGNORE 1 LINES 
;

select *
from temp.purgeroutes;

create table temp.mv_purgeroutes
as
select R.route_id
,R.route_cd ,RM.internal_route_cd as purged_internal_route_cd
,IRM.internal_route_cd as new_internal_route_cd
from
internal_route_map RM
inner join route R on (R.route_id=RM.route_id)
inner join temp.purgeroutes P on (RM.internal_route_cd=P.route_cd)
left outer join internal_route_map IRM on (IRM.route_id=R.route_id and IRM.internal_route_cd<>P.route_cd)
order by R.route_cd
;

select * from temp.vw_purgeroutes; 

-- Update R, IRM where route_cd is the rep and another similar route exists
update route R, internal_route_map IRM
inner join IRM on (R.route_id=IRM.route_id)
inner join temp.purgeroutes P on (R.route_cd=P.route_cd)
set R.internal_route_cd=''

;
 

select * from temp.vw_purgeroutes; 

-- Delete R, IRM, RS, SG
delete RS
from route R
inner join routestop RS on (RS.route_id=R.route_id)
inner join temp.vw_purgeroutes P on (R.route_cd=P.purged_internal_route_cd)
where P.new_internal_route_cd is null
;

delete SG
from route R
inner join stage SG on (SG.route_id=R.route_id)
inner join temp.vw_purgeroutes P on (R.route_cd=P.purged_internal_route_cd)
where P.new_internal_route_cd is null
;

delete IRM
from route R
inner join internal_route_map IRM on (R.route_id=IRM.route_id)
inner join temp.vw_purgeroutes P on (R.route_cd=P.purged_internal_route_cd)
where P.new_internal_route_cd is null
;

delete R
from route R
inner join temp.vw_purgeroutes P on (R.route_cd=P.purged_internal_route_cd)
where P.new_internal_route_cd is null
;


--  ------------- 

-- select *
update stage SG
inner join route R on (SG.route_id=R.route_id)
set internal_stage_cd='SRD'
where R.route_cd='MRG175' and internal_stage_cd='SRI'
;

update stage SG
inner join route R on (SG.route_id=R.route_id)
set internal_stage_cd='CBT'
where R.route_cd='MRG153' and internal_stage_cd='BGM'
;

select *
from stage SG
inner join route R on (SG.route_id=R.route_id)
where R.route_cd='MRG175' 
;


delete RS
from routestop RS
inner join route R on (RS.route_id=R.route_id)
where R.route_cd in ('PRV164');

