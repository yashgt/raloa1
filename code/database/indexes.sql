/*
create index idx_route_stop_route on routestop(route_id);
create index idx_trip_route on trip(route_id);
create index idx_stage_route on stage(route_id);

create index idx_routestoptrip_trip on routestoptrip(trip_id);
create index idx_segment_fstop on segment(from_stop_id);
create index idx_segment_tstop on segment(to_stop_id);


create index idx_stop_code on stop(code, fleet_id);

drop index idx_route_startstop on route;
create index idx_route_startstop on route(start_stop_id);
create index idx_route_endstop on route(end_stop_id);
create index idx_internal_route_map_route on internal_route_map(route_id);
*/

create index idx_internal_route_map_rc on internal_route_map(internal_route_cd);
create index idx_stop_code on stop(code, fleet_id);

