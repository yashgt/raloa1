

select R.route_cd
from route R
inner join stage SG on (SG.route_id=R.route_id)
left outer join routestop RS on (RS.stage_id=SG.stage_id)
where RS.stage_id is null and R.start_stop_id is not null
group by R.route_cd;

-- Step 1
SET SESSION group_concat_max_len = 10000000;
drop table temp.mv_route_segments;
create table temp.mv_route_segments
as
select *
from vw_route_segments;

select count(*) from temp.mv_route_segments;
select * from temp.mv_route_segments;


-- Step 2
rename table temp.mv_matching_route_seg to temp.mv_matching_route_seg2;
drop table temp.mv_matching_route_seg;
create table temp.mv_matching_route_seg as 
select 
VR1.route_id, VR1.route_cd
, convert(substring_index(group_concat( convert(VR1.start_sequence,char) order by length(VR2.stage_codes) desc),',',1), unsigned) as start_sequence
, convert(substring_index(group_concat( convert(VR1.end_sequence,char) order by length(VR2.stage_codes) desc),',',1), unsigned) as end_sequence
, convert(substring_index(group_concat( convert(VR2.route_id,char) order by length(VR2.stage_codes) desc),',',1), unsigned) as matching_route_id
, substring_index(group_concat( VR2.route_cd order by length(VR2.stage_codes) desc),',',1) as matching_route_cd
, convert(substring_index(group_concat( convert(VR2.start_sequence,char) order by length(VR2.stage_codes) desc),',',1), unsigned) as matching_start_sequence
, convert(substring_index(group_concat( convert(VR2.end_sequence,char) order by length(VR2.stage_codes) desc),',',1), unsigned) as matching_end_sequence
, (select ifnull(max(sequence),0) from routestop where route_id=VR1.route_id) as max_stop_seq
-- select sequence from routestop where route_id=5876
, (select min(routestop.sequence) 
	from routestop 
    inner join stage on (routestop.stage_id=stage.stage_id)
--    where routestop.route_id=matching_route_id and stage.sequence=VR2.start_sequence
    group by routestop.route_id, stage.sequence
    -- having routestop.route_id=matching_route_id 
    having routestop.route_id=convert(substring_index(group_concat( convert(VR2.route_id,char) order by length(VR2.stage_codes) desc),',',1), unsigned)
    and
    stage.sequence=convert(substring_index(group_concat( convert(VR2.start_sequence,char) order by length(VR2.stage_codes) desc),',',1), unsigned)
    ) as min_match_seq 
, substring_index(group_concat( VR2.stage_codes order by length(VR2.stage_codes) desc),',',1) as matching_stage_codes    
from temp.mv_route_segments as VR1
inner join temp.mv_route_segments as VR2 on (VR1.stage_codes=VR2.stage_codes and VR1.route_id<>VR2.route_id)
where
    -- 0=(select count(*) from routestop where route_id=VR1.route_id)
        -- and VR1.start_sequence=1 and VR2.start_sequence=1
        
        /*
	(select count(*) from stage 
	left outer join routestop on (routestop.stage_id=stage.stage_id )
	where stage.route_id=VR1.route_id and routestop.route_id is null ) > 0 -- R1 is incomplete route */
    (
		select count(*) 
        from routestop RS 
        inner join stage SG on (RS.stage_id=SG.stage_id and RS.route_id=VR1.route_id)
        where 
        SG.sequence between VR1.start_sequence and VR1.end_sequence
        -- SG.sequence >= VR1.start_sequence -- All stages beyond this are empty
    ) = 0 -- Use only unfilled segments
    
    and (select count(*) from routestop where route_id=VR2.route_id)>0
    and
	(select count(*) from stage left outer join routestop on (routestop.stage_id=stage.stage_id )
	where stage.route_id=VR2.route_id and routestop.route_id is null ) = 0 /* R2 is complete */

group by VR1.route_id, VR1.route_cd
order by VR1.route_id, VR1.route_cd
;

select *
from temp.mv_matching_route_seg
-- where route_id=5895
-- where route_cd in ('VSD81', 'VSD82')
where route_cd in ('PRV164') or matching_route_cd in ('PRV164')
-- where end_sequence-start_sequence <>matching_end_sequence-matching_start_sequence
order by matching_end_sequence-matching_start_sequence ;

-- Step 3
-- any segment
insert into routestop(stop_id, peer_stop_id, route_id, stage_id, sequence)
select RS2.stop_id, RS2.peer_stop_id, MR.route_id, SG1.stage_id
-- , RS2.sequence + MR.max_stop_seq-MR.min_match_seq + 1 as sequence
, RS2.sequence -- Give sequence as is
-- , MR.route_cd, MR.matching_route_cd, SG1.sequence sg1_seq, SG1.internal_stage_cd sg1_cd, SG2.sequence sg2_seq, SG2.internal_stage_cd sg2_cd, MR.matching_stage_codes
from temp.mv_matching_route_seg as MR 
inner join routestop as RS2	on (RS2.route_id=MR.matching_route_id)
inner join stage as SG2 
	on (RS2.stage_id=SG2.stage_id and (SG2.sequence between MR.matching_start_sequence and MR.matching_end_sequence) )
inner join stage as SG1 
	on (SG1.internal_stage_cd=SG2.internal_stage_cd 
		and SG1.route_id=MR.route_id 
        and cast(SG1.sequence as signed) = cast(SG2.sequence as signed) - ( cast(MR.matching_start_sequence as signed) - cast(MR.start_sequence as signed) )
 		and (SG1.sequence between MR.start_sequence and MR.end_sequence) 
        )
where
end_sequence-start_sequence = matching_end_sequence-matching_start_sequence  
-- and  MR.route_id=6430  
order by MR.route_id, RS2.sequence  
;    

/*
-- starting segment
insert into routestop(stop_id, peer_stop_id, route_id, stage_id, sequence)
select RS2.stop_id, RS2.peer_stop_id, MR.route_id, SG1.stage_id, RS2.sequence
-- , MR.route_cd, MR.matching_route_cd, SG1.sequence sg1_seq, SG1.internal_stage_cd sg1_cd, SG2.sequence sg2_seq, SG2.internal_stage_cd sg2_cd, MR.matching_stage_codes
from temp.mv_matching_route_seg as MR 
inner join routestop as RS2	on (RS2.route_id=MR.matching_route_id)
inner join stage as SG2 
	on (RS2.stage_id=SG2.stage_id and (SG2.sequence between MR.matching_start_sequence and MR.matching_end_sequence) )
inner join stage as SG1 
	on (SG1.internal_stage_cd=SG2.internal_stage_cd 
		and SG1.route_id=MR.route_id 
        and SG1.sequence=SG2.sequence 
 		-- and (SG1.sequence between MR.start_sequence and MR.end_sequence) 
        )
-- where MR.route_id=6022        
order by MR.route_id, RS2.sequence    
;    
*/

-- Verify
select route_id, sequence, count(*)
from routestop group by route_id, sequence
having count(*)>1
;

-- Stage 4
drop table temp.rsid;
create table temp.rsid 
as
select 
-- RS.*, SG.sequence
MV.route_cd
,RS.route_stop_id
,RS.sequence
, ROW_NUMBER() OVER(partition by R.route_id order by SG.sequence, RS.sequence) as new_stop_seq
from routestop RS
inner join route R on (R.route_id=RS.route_id)
inner join stage SG on (SG.route_id=R.route_id and RS.stage_id=SG.stage_id)
inner join temp.mv_matching_route_seg MV on (MV.route_cd=R.route_cd)
-- where MV.route_cd='VSD52'
-- where R.route_cd='PRV84'and R.fleet_id=2
;

update routestop RS
inner join temp.rsid T on (RS.route_stop_id=T.route_stop_id)
set RS.sequence=T.new_stop_seq
where RS.sequence<>T.new_stop_seq
;

select * from temp.rsid ;

select *
from routestop RS
inner join temp.rsid T on (RS.route_stop_id=T.route_stop_id)
where T.route_stop_id=63921
;

