create index idx_trip_rno_buscd on msrtc1.listoftrips(route_no, bus_stop_cd);
create index idx_r_r on msrtc1.listofroutes(route_no);
create index idx_sor_rn on msrtc1.listofstopsonroutes(route_no);
create index idx_sor_sc on msrtc1.listofstopsonroutes(bus_stop_cd);
create index idx_s_sc on msrtc1.listofstops(bus_stop_cd);
