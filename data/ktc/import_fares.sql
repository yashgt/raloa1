SELECT * FROM ktc_microfx.etm_route_tran;

SELECT 
B.ERT_STAGE_CODE
, A.ERT_STAGE_CODE
, (A.ert_slno - B.ert_slno) as stages
, (A.ert_kms - B.ert_kms) as kms
, F.emf_fare
FROM ktc_microfx.etm_route_tran as B
inner join ktc_microfx.etm_route_tran A on (B.ert_route_no=A.ert_route_no and B.ert_slno<A.ert_slno)
inner join ktc_microfx.etm_master_fares F on ((A.ert_slno - B.ert_slno)=F.emf_stage and A.ert_bus_code=F.emf_bus_code)
where A.ert_route_no=9
order by B.ert_slno, A.ert_slno;