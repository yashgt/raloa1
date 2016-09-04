delete T1
from routestop T1
inner join
(
select stage_id, stop_id, peer_stop_id, min(sequence) as minseq
from routestop where route_id=185
group by stage_id, stop_id, peer_stop_id
order by min(sequence)
) T2 on (T1.stage_id= T2.stage_id and T1.stop_id=T2.stop_id and T1.peer_stop_id=T2.peer_stop_id and T1.sequence<>T2.minseq)
where T1.route_id=185


delete T1
from routestop T1
inner join
(
select stage_id, stop_id, peer_stop_id, min(route_stop_id) as minrsid
from routestop where route_id=185
group by stage_id, stop_id, peer_stop_id
order by min(sequence)
) T2 on (T1.stage_id= T2.stage_id and T1.stop_id=T2.stop_id and T1.peer_stop_id=T2.peer_stop_id and T1.route_stop_id<>T2.minrsid)
where T1.route_id=185
