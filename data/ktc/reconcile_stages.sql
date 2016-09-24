	update stage S
	inner join route R on (S.route_id=R.route_id)
	inner join internal_route_map RM on (R.route_id=RM.route_id)
	inner join ktc_microfx.etm_route_tran T on (T.erm_route_no=RM.internal_route_cd and S.)
	set internal_stage_cd = T.ERT_STAGE_CODE