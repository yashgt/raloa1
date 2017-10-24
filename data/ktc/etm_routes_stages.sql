select R.*
from
(
SELECT distinct concat('prv', ert_route_no) as ert_route_no, ert_stage_no, ert_stage_code, ert_stage_name FROM prv.etm_route_tran 
union all
SELECT distinct concat('mrg', ert_route_no) as ert_route_no, ert_stage_no, ert_stage_code, ert_stage_name FROM mrg.etm_route_tran 
union all
SELECT distinct concat('pnj', ert_route_no) as ert_route_no, ert_stage_no, ert_stage_code, ert_stage_name FROM pnj.etm_route_tran 
union all
SELECT distinct concat('vsg', ert_route_no) as ert_route_no, ert_stage_no, ert_stage_code, ert_stage_name FROM vsg.etm_route_tran 
) as R
order by R.ert_route_no, cast(ert_stage_no as unsigned) ;