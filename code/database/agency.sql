SELECT 
gtfs_agency_id as agency_id
,fleet_name as agency_name
,agency_lang
,agency_timezone
,agency_phone
,agency_url
from fleet where fleet_id=@fleet_id
;