create database if not exists msrtc1;
use msrtc1;
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

create index idx_r_r on msrtc.listofroutes(route_no);
create index idx_sor_rn on msrtc.listofstopsonroutes(route_no);
create index idx_sor_sc on msrtc.listofstopsonroutes(bus_stop_cd);
create index idx_s_sc on msrtc.listofstops(bus_stop_cd);

