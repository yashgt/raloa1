-- 74 complete
select R.route_id, R.route_cd, MR.matching_route_cd,
(select group_concat(internal_stage_cd order by sequence  separator '-' ) 
	from route 
    inner join stage on (route.route_id=stage.route_id) 
    group by route.route_cd having route.route_cd=R.route_cd) as stage_codes
from route R
left outer join temp.mv_matching_route_seg MR on (R.route_cd=MR.route_cd)
where R.fleet_id=2
    -- 0=(select count(*) from routestop where route_id=VR1.route_id)
    and
	(select count(*) from routestop where route_id=R.route_id)>0 -- some stops exist
    and
	(select count(*) from stage left outer join routestop on (routestop.stage_id=stage.stage_id )
	where stage.route_id=R.route_id and routestop.route_id is null ) = 0 /* R2 is complete */
order by R.route_cd    
;

-- 12 Partial
select R.route_id, R.route_cd, (select group_concat(internal_stage_cd order by sequence  separator '-' ) 
	from route 
    inner join stage on (route.route_id=stage.route_id) 
    group by route.route_cd having route.route_cd=R.route_cd) as stage_codes
from route R
where R.fleet_id=2
    -- 0=(select count(*) from routestop where route_id=VR1.route_id)
    and
	(select count(*) from routestop where route_id=R.route_id)>0 -- some stops exist
    and
	(select count(*) from stage left outer join routestop on (routestop.stage_id=stage.stage_id )
	where stage.route_id=R.route_id and routestop.route_id is null ) > 0 /* R2 has incomplete stages */
    -- and R.route_id in (select route_id from temp.mv_matching_route_seg)
;

-- Empty
select R.route_id, R.route_cd, (select group_concat(internal_stage_cd order by sequence  separator '-' ) 
	from route 
    inner join stage on (route.route_id=stage.route_id) 
    group by route.route_cd having route.route_cd=R.route_cd) as stage_codes
from route R
where R.fleet_id=2
    -- 0=(select count(*) from routestop where route_id=VR1.route_id)
    and
	(select count(*) from routestop where route_id=R.route_id)=0
group by R.route_id, R.route_cd    
;

-- Pending routes
select R.route_cd
, count(*) as pending
, (select count(*) from routestop where route_id=R.route_id) done
, (select group_concat(internal_stage_cd order by sequence  separator '-' ) 
	from route 
    inner join stage on (route.route_id=stage.route_id) 
    group by route.route_cd having route.route_cd=R.route_cd) as stage_codes
from route R
inner join stage SG on (R.route_id=SG.route_id)
left outer join routestop RS on (RS.stage_id=SG.stage_id)
where R.fleet_id=2
and RS.route_stop_id is null
group by R.route_cd, R.route_id
-- having count(*)>10
order by count(*) ;

