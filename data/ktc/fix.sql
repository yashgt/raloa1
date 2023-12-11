

-- fix VSD26 and 62

-- Update route name

update route R 
inner join 
(
select route_id
, trim( 
concat( (select stage_name from stage where route_id=R.route_id and sequence=1), "-",
(select stage_name 
		from stage 
        where route_id=R.route_id 
		and sequence=(select max(sequence) from stage where stage.route_id=R.route_id group by route_id having route_id=R.route_id)
) 
, coalesce( (select concat(' VIA ', group_concat(stage_name)) from stage where stage.route_id=R.route_id and stage.is_via=1 group by route_id having route_id=R.route_id), '') 
)) as route_name
from route R
where fleet_id=2
) as CR on CR.route_id=R.route_id 
set R.route_name=CR.route_name;
;

select route_id
, concat( (select stage_name from stage where route_id=R.route_id and sequence=1), "-",
(select stage_name 
		from stage 
        where route_id=R.route_id 
		and sequence=(select max(sequence) from stage group by route_id having route_id=R.route_id)
) 
, coalesce( (select concat(' VIA ', group_concat(stage_name)) from stage where is_via=1 group by route_id having route_id=R.route_id), '') 
) as route_name
from route R
where fleet_id=2
-- and R.route_id=6278
;


-- Panaji city bus
select *
from stop 
where name like '%city%' or name like '%Panaji%';

select route_id, route_name
from route R ;

select R.route_id, R.route_name , R.route_cd
from routestop RS
inner join route R on (R.route_id=RS.route_id)
where stop_id=2759
order by route_cd;

update routestop RS
inner join route R on (RS.route_id=R.route_id)
set RS.stop_id=1
where RS.stop_id=2759
and R.route_cd not in ()
;


-- --------
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

select *
from route
where route_id=6263;

update stage
set internal_stage_cd=substring(internal_stage_cd,1,3) ;

select * from stage
where length(internal_stage_cd)>3
;

select distinct R.route_cd
from
route R
inner join
(
select R.route_id, R.route_cd, RS.stage_id, count(*)
from routestop RS
inner join route R on (R.route_id=RS.route_id)
group by route_id, stage_id
having count(*) > 5
order by count(*) desc
) R1 on (R1.route_id=R.route_id)
;

select *
from routestop 
where route_id=6263
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
-- Stages with too many stops
select RS.route_id, R.route_cd, RS.stage_id, count(*)
from routestop RS
inner join route R on (R.route_id=RS.route_id)
group by RS.route_id, R.route_cd, RS.stage_id
order by count(*) desc
;

select *
from stage
where stage_name like '%MUXER%'
;


--  ------------- 


select R.route_id, R.route_cd, P.purged_internal_route_cd
from route R
inner join temp.mv_purgeroutes P on (P.route_id=R.route_id)
;

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



--  -----
select * from temp.vw_purgeroutes; 

-- Update R, IRM where route_cd is the rep and another similar route exists
update route R, internal_route_map IRM
inner join IRM on (R.route_id=IRM.route_id)
inner join temp.purgeroutes P on (R.route_cd=P.route_cd)
set R.internal_route_cd=''

;

