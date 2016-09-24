SELECT 
distinct concat(database(), ert_route_no), ert_stage_no, ert_stage_code, ert_stage_name 
/** */
FROM etm_route_tran
order by cast(ert_route_no as unsigned), cast(ert_stage_no as unsigned) ;