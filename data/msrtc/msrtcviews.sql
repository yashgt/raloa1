drop view routesummary;
create view routesummary as
select
route_name
, R.route_no
, R.FROM_STOP_CD
, R.TILL_STOP_CD
, S.bus_stop_cd as via_stop_cd
from
msrtc1.listofroutes R
left outer join msrtc1.listofstops S on
(
        case instr(R.route_name, ' via')
                when 0 then false
                else exists( select 1 from msrtc1.listofstopsonroutes RS where RS.bus_stop_cd=S.bus_stop_cd and RS.route_no=R.route_no and S.bus_stop_nm=substr(R.route_name from instr(R.route_name, ' via') + 5))
        end
)
;

create or replace view vw_fwd_routes
select 
	R1.route_no, R1.route_name, group_concat(R1.bus_stop_cd ) as stops
	from
	(
		select R1.route_no, R1.route_name, SOR.bus_stop_cd as bus_stop_cd	
		from msrtc1.listofroutes R1 	
		inner join msrtc1.listofstopsonroutes SOR on (R1.route_no=SOR.route_no)
		left outer join msrtc1.listofstops S on
		(
			case instr(R.route_name, ' via')
                when 0 then false
                else exists( select 1 from msrtc1.listofstopsonroutes RS where RS.bus_stop_cd=S.bus_stop_cd and RS.route_no=R.route_no and S.bus_stop_nm=substr(R.route_name from instr(R.route_name, ' via') + 5))
			end
		)
		where exists (select 1 from msrtc1.listoftrips Tr where Tr.route_no=R1.route_no)
		order by SOR.STOP_SEQ 
	) as R1
group by R1.route_no, R1.route_name
order by R1.route_no
;
