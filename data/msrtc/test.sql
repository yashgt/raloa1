insert into user(username, password, fleet_id, role_type) values ('mhuser', 'mhuser123', 7, 2);

select * from user;

select * from stop S where S.code='SNGR' and S.fleet_id=7;
select * from stop S where S.code='AWBCBS' and S.fleet_id=7;

select S1.bus_stop_cd, S1.bus_stop_nm 
	from msrtc.listofstops S1
	/*left outer join stop S2 use index (idx_stop_code) on (S2.code=S1.bus_stop_cd and S2.fleet_id=7)
	where S2.stop_id is null */   	
where S1.bus_stop_cd='SNGR'
	;

call get_fleet_detail(7);

SELECT * FROM msrtc.listoftrips
where route_no=288
order by DEPARTURE_TM;

select * from msrtc.listofroutes;
select ROUTE_NO, count(*) 
from msrtc.listofstopsonroutes
group by route_no
order by count(*) desc
;

select * from msrtc.listofroutes R 
left outer join msrtc.listofstopsonroutes RS on R.route_no=RS.ROUTE_NO
where RS.ROUTE_NO = 107119
order by stop_seq
;

select *
from msrtc.listofstops S 
where bus_stop_cd='RNKDMN'
select R.* from msrtc.listofroutes R 
left outer join msrtc.listoftrips T on R.route_no=T.ROUTE_NO
where T.ROUTE_NO is null
;


select *
from 
msrtc.listofstopsonroutes
where route_no=27265
order by stop_seq;

select distinct 
S.BUS_STOP_CD, S.BUS_STOP_NM
from msrtc.listofroutes R
inner join msrtc.listofstops S on (R.from_stop_cd=S.bus_stop_cd)
union distinct
select distinct 
S.BUS_STOP_CD, S.BUS_STOP_NM
from msrtc.listofroutes R
inner join msrtc.listofstops S on (R.till_stop_cd=S.bus_stop_cd)
union distinct
select distinct
S.BUS_STOP_CD
, S.BUS_STOP_NM
from 
msrtc.listofstops S
inner join msrtc.listofstopsonroutes RS on (RS.BUS_STOP_CD=S.bus_stop_cd)
inner join msrtc.listofroutes R on (RS.route_no=R.route_no)
where S.BUS_STOP_NM=case instr(route_name, ' via') when 0 then null else substr(route_name from instr(route_name, ' via') + 5) end

;

select count(*) from msrtc.listofroutes;
select count(*) from routesummary;

select 
count(*) 
from routesummary R1
left outer join routesummary R2 on 
(
R2.from_stop_cd=R1.till_stop_cd 
	and R2.till_stop_cd=R1.from_stop_cd 
	and ((R2.via_stop_cd=R1.via_stop_cd) or (R2.via_stop_cd is null and R1.via_stop_cd is null))
)
where R1.from_stop_cd<R1.till_stop_cd
;

select * from stop where fleet_id=7;
where R2.from_stop_cd is null;

where not exists 
(
	select * 
	from routesummary R2 
	where 
	
)
; 

select 
route_name
, R.route_no
, R.FROM_STOP_CD
, R.TILL_STOP_CD
, null as via_stop_cd
from 
msrtc.listofroutes R
where 
(case instr(R.route_name, ' via') 
		when 0 then null 
		else substr(R.route_name from instr(R.route_name, ' via') + 5) 
	end) is null
union all
select 
route_name
, R.route_no
, R.FROM_STOP_CD
, R.TILL_STOP_CD
, S.bus_stop_cd as via_stop_cd
from 
msrtc.listofroutes R
inner join msrtc.listofstopsonroutes RS on (RS.route_no=R.route_no)
inner join msrtc.listofstops S on 
(
	RS.bus_stop_cd=S.bus_stop_cd 
)
where
	S.bus_stop_nm=(case instr(R.route_name, ' via') 
		when 0 then null 
		else substr(R.route_name from instr(R.route_name, ' via') + 5) 
	end)

;

msrtc.listofstops S
inner join msrtc.listofstopsonroutes RS on (RS.BUS_STOP_CD=S.bus_stop_cd)
inner join msrtc.listofroutes R on (RS.route_no=R.route_no)
where S.BUS_STOP_NM=case instr(route_name, ' via') when 0 then null else substr(route_name from instr(route_name, ' via') + 5) end
;

select 
route_name
, case instr(route_name, ' via') when 0 then null else substr(route_name from instr(route_name, ' via') + 5) end as via
, S.BUS_STOP_CD
, S.BUS_STOP_NM
from 
msrtc.listofstops S
inner join msrtc.listofstopsonroutes RS on (RS.BUS_STOP_CD=S.bus_stop_cd)
inner join msrtc.listofroutes R on (RS.route_no=R.route_no)
where S.BUS_STOP_NM=case instr(route_name, ' via') when 0 then null else substr(route_name from instr(route_name, ' via') + 5) end
;

select * from stop where fleet_id=7 and name is not null;