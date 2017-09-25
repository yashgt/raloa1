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
,ARRIVAL_TM datetime
,DEPARTURE_TM time
,IS_BOARDING_STOP boolean
,IS_ALIGHTING boolean
,DEPOT_CD varchar(255)
,BUS_TYPE_NM varchar(255)
,START_DATE datetime
,END_DATE datetime
,DAY_OFFSET int
,STOP_SEQ int

,foreign key(route_no) references listofroutes(route_no)
,foreign key(bus_stop_cd) references listofstops(bus_stop_cd)

);

create index idx_trip_rno_buscd on msrtc1.listoftrips(route_no, trip_no, bus_stop_cd);
create index idx_trip_trip on msrtc1.listoftrips(trip_no);
create index idx_r_r on msrtc1.listofroutes(route_no);
create index idx_sor_rn on msrtc1.listofstopsonroutes(route_no);
create index idx_sor_sc on msrtc1.listofstopsonroutes(bus_stop_cd);
create index idx_s_sc on msrtc1.listofstops(bus_stop_cd);


