

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
, substring_index(group_concat( VR2.stage_codes order by length(VR2.stage_codes) desc),',',1) as matching_stage_codes
from temp.mv_route_segments as VR1
inner join temp.mv_route_segments as VR2 on (VR1.stage_codes=VR2.stage_codes and VR1.route_id<>VR2.route_id)
where
/*
	(select count(*) from stage 
	left outer join routestop on (routestop.stage_id=stage.stage_id and stage.route_id=VR1.route_id)
	where routestop.route_id is null ) > 0 /* R1 is incomplete route */
    0=(select count(*) from routestop where route_id=VR1.route_id)
    and (select count(*) from routestop where route_id=VR2.route_id)>0
    and
	(select count(*) from stage left outer join routestop on (routestop.stage_id=stage.stage_id )
	where stage.route_id=VR2.route_id and routestop.route_id is null ) = 0 /* R2 is complete */
    and VR1.start_sequence=1 and VR2.start_sequence=1

group by VR1.route_id, VR1.route_cd
order by VR1.route_id, VR1.route_cd
;

select *
from temp.mv_matching_route_seg;
-- Step 3

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
 -- 			and (SG1.sequence between MR.start_sequence and MR.end_sequence) 
        )
-- where MR.route_id=6022        
order by MR.route_id, RS2.sequence    
;    

