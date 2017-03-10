select Ex.route_id as route_id, Ex.stage_id as stage_id, Ex.seq as seq, (@row_number:=@row_number + 1) AS rank
from
(
	select R.route_id as route_id, SG.stage_id as stage_id, min(RS.sequence) as seq
	from stage SG
	inner join routestop RS on (SG.stage_id=RS.stage_id)
	inner join route R on (SG.route_id=R.route_id)
	where R.fleet_id=2 
	and R.route_id=218
	group by R.route_id, SG.stage_id
	order by min(RS.sequence)
) Ex
,(SELECT @row_number:=0) AS t

;

