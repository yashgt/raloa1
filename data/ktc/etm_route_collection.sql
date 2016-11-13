SELECT 
erm_route_no, erm_start_stage, erm_end_stage , erm_no_of_stages
/***/
FROM etm_route_master;

SELECT 
distinct concat(database(), ert_route_no), ert_stage_no, ert_stage_code, ert_stage_name 
/** */
FROM etm_route_tran
order by cast(ert_route_no as unsigned), cast(ert_stage_no as unsigned) ;

select U.erm_route_no, U.erm_start_stage, U.erm_end_stage, U.via, U.est_bus_type
/*,  U.tara_id*/
from
(
select 
concat('prv',R.erm_route_no) erm_route_no
, erm_start_stage
, erm_end_stage
, ST.est_bus_type
, (select distinct ert_route_via from prv.etm_route_tran T where T.ert_route_no=R.erm_route_no) as via
/*, RM.route_id as tara_id*/
from prv.etm_route_master R	
left outer join prv.etm_service_type ST on (R.erm_bus_code=ST.est_bus_code)
/*left outer join internal_route_map RM on (concat('prv',R.erm_route_no)=RM.internal_route_cd)*/

union all
select 
concat('vsg',R.erm_route_no) erm_route_no
, erm_start_stage
, erm_end_stage
, ST.est_bus_type
, (select distinct ert_route_via from vsg.etm_route_tran T where T.ert_route_no=R.erm_route_no) as via
/*, RM.route_id as tara_id*/
from vsg.etm_route_master R	
left outer join vsg.etm_service_type ST on (R.erm_bus_code=ST.est_bus_code)
/*left outer join internal_route_map RM on (concat('vsg',R.erm_route_no)=RM.internal_route_cd)*/

union all
select 
concat('pnj',R.erm_route_no) erm_route_no
, erm_start_stage
, erm_end_stage
, ST.est_bus_type
, (select distinct ert_route_via from pnj.etm_route_tran T where T.ert_route_no=R.erm_route_no) as via
/*, RM.route_id as tara_id*/
from pnj.etm_route_master R	
left outer join pnj.etm_service_type ST on (R.erm_bus_code=ST.est_bus_code)
/*left outer join internal_route_map RM on (concat('pnj',R.erm_route_no)=RM.internal_route_cd)*/

union all
select 
concat('mrg',R.erm_route_no) erm_route_no
, erm_start_stage
, erm_end_stage
, ST.est_bus_type
, (select distinct ert_route_via from mrg.etm_route_tran T where T.ert_route_no=R.erm_route_no) as via
/*, RM.route_id as tara_id*/
from mrg.etm_route_master R	
left outer join mrg.etm_service_type ST on (R.erm_bus_code=ST.est_bus_code)
/*left outer join internal_route_map RM on (concat('mrg',R.erm_route_no)=RM.internal_route_cd)	*/
) as U
order by ltrim(erm_start_stage), ltrim(erm_end_stage), ltrim(via), erm_route_no
;
