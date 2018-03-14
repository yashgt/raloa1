create or replace view vw_unmatched as
select M.internal_route_cd
, R1.route_no as f_route_no
, R1.route_name as f_route_name
, substring(R1.route_name, instr(R1.route_name,' via ')+5) as via
, R2.route_no as s_route_no
, R2.route_name as s_route_name
from internal_route_map M
inner join route R on (R.route_id=M.route_id)
inner join msrtc1.listofroutes R1 on substr(M.internal_route_cd,4)=R1.route_no
left outer join msrtc1.listofroutes R2 on (R1.from_stop_cd=R2.till_stop_cd and R1.till_stop_cd=R2.from_stop_cd)
where
R.fleet_id=7
and substring_index(M.internal_route_cd,'-',1)=M.internal_route_cd
and R1.route_no<R2.route_no
and exists (select 1 from msrtc1.listoftrips where route_no=R1.route_no limit 1)
and exists (select 1 from msrtc1.listoftrips where route_no=R2.route_no limit 1)
having (via is null or locate(via, R2.route_name)>0)
and exists (select 1 from vw_wanted_routes where internal_route_cd=M.internal_route_cd)
order by M.internal_route_cd
;
