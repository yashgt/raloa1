create index idx_route_stop_route on routestop(route_id);
create index idx_trip_route on trip(route_id);
create index idx_stage_route on stage(route_id);

create index idx_routestoptrip_trip on routestoptrip(trip_id);
create index idx_segment_fstop on segment(from_stop_id);
create index idx_segment_tstop on segment(to_stop_id);
