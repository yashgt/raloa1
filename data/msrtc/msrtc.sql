create database if not exists msrtc;
use msrtc;
create table if not exists listofstops
(
BUS_STOP_CD varchar(255)
,BUS_STOP_NM varchar(255)
,PRIMARY KEY (BUS_STOP_CD)
);

create table if not exists listofroutes
(
route_no varchar(255)
,route_name varchar(255)
,from_stop_cd varchar(255)
,till_stop_cd varchar(255)
,PRIMARY KEY (route_no)
,foreign key (from_stop_cd) references listofstops(bus_stop_cd)
,foreign key (till_stop_cd) references listofstops(bus_stop_cd)
);

create table if not exists listofstopsonroutes
(
ROUTE_NO varchar(255)
,BUS_STOP_CD varchar(255)
,STOP_SEQ int
,primary key(route_no, bus_stop_cd, stop_seq)
,foreign key (BUS_STOP_CD) references listofstops(bus_stop_cd)
,foreign key (route_no) references listofroutes(route_no)
);

create table if not exists listoftrips
(
TRIP_NO varchar(255)
,ROUTE_NO varchar(255)
,BUS_STOP_CD varchar(255)
,ARRIVAL_TM time
,DEPARTURE_TM time
,IS_BOARDING_STOP boolean
,IS_ALIGHTING boolean
,foreign key(route_no) references listofroutes(route_no)
,foreign key(bus_stop_cd) references listofstops(bus_stop_cd)
);

create view routesummary as
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
distinct
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

select 26111 + 35325

