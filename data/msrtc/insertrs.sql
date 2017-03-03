/*insert into routestop (stop_id, peer_stop_id, route_id, stage_id, sequence)*/
select 1
from dual
where exists
(
select 
/*count(*)*/
St.stop_id
,null
,Rt.route_id
,0
,RS.stop_seq

from  
route Rt
inner join internal_route_map M  on (M.route_id=Rt.route_id)
inner join msrtc1.listofstopsonroutes RS on (M.internal_route_cd=RS.route_no)
inner join msrtc1.listofstops S on (RS.bus_stop_cd=S.bus_stop_cd)
inner join stop St on (St.code=S.bus_stop_cd)
/*order by Rt.route_id, RS.stop_seq*/
where Rt.fleet_id=7
and St.fleet_id=7
)

;
