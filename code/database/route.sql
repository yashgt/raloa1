SELECT route_id
,'KTC' as agency_id
,'' as route_short_name
,route_name as route_long_name
,3 as route_type
from route
where fleet_id=@fleet_id
;