select 
erm_route_no, erm_start_stage, erm_end_stage
, ST.est_bus_type
, (select distinct ert_route_via from prv.etm_route_tran T where T.ert_route_no=R.erm_route_no) as via

from prv.etm_route_master R	
inner join prv.etm_service_type ST on (R.erm_bus_code=ST.est_bus_code)
left outer join internal_route_map RM 
	on (concat('prv',R.erm_route_no)=RM.internal_route_cd)	
where RM.route_id is null
order by cast(erm_route_no as unsigned)
;

