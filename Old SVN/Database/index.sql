--DROP index `name` on `stop`  ;
CREATE index `stop_index` on stop (name(225)) USING BTREE;


--DROP index `stop_id` on `routestop`  ;
CREATE index `routestop_index` on routestop (stop_id(11), route_id(11)) USING BTREE;



--DROP index `route_id` on `trip`  ;
CREATE index `trip_index` on trip (route_id(11)) USING BTREE; 


CREATE index `routestoptrip_index` on routestoptrip (route_stop_id(11), trip_id(11)) USING BTREE;


CREATE index `segment_index` on segment (stop_id1(11), stop_id2(11)) USING BTREE; 


CREATE index `bus_index` on bus (bus_id(11), curr_trip_id(11), company_id(11)) USING BTREE; 

