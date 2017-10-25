CREATE OR REPLACE
VIEW `vw_ktc_route` AS
    select 
        concat('prv', `m`.`ERM_ROUTE_NO`) AS `erm_route_no`,
        `m`.`ERM_START_STAGE` AS `erm_start_stage`,
        `t`.`ERT_ROUTE_VIA` AS `ert_route_via`,
        `m`.`ERM_END_STAGE` AS `erm_end_stage`,
        `m`.`ERM_NO_OF_STAGES` AS `erm_no_of_stages`,
        `m`.`ERM_ROUTE_TYPE` AS `erm_route_type`,
        `t`.`ERT_ROUTE_TYPE` AS `ert_route_type`,
        `st`.`EST_BUS_TYPE` AS `est_bus_type`
    from
        ((`prv`.`etm_route_master` `m`
        join `prv`.`etm_route_tran` `t` ON (((convert( `t`.`ERT_ROUTE_NO` using utf8) = `m`.`ERM_ROUTE_NO`)
            and (`t`.`ERT_STAGE_NO` = 1))))
        left join `prv`.`etm_service_type` `st` ON ((`m`.`ERM_BUS_CODE` = `st`.`EST_BUS_CODE`))) 
    union all select 
        concat('mrg', `m`.`ERM_ROUTE_NO`) AS `erm_route_no`,
        `m`.`ERM_START_STAGE` AS `erm_start_stage`,
        `t`.`ERT_ROUTE_VIA` AS `ert_route_via`,
        `m`.`ERM_END_STAGE` AS `erm_end_stage`,
        `m`.`ERM_NO_OF_STAGES` AS `erm_no_of_stages`,
        `m`.`ERM_ROUTE_TYPE` AS `erm_route_type`,
        `t`.`ERT_ROUTE_TYPE` AS `ert_route_type`,
        `st`.`EST_BUS_TYPE` AS `est_bus_type`
    from
        ((`mrg`.`etm_route_master` `m`
        join `mrg`.`etm_route_tran` `t` ON (((`t`.`ERT_ROUTE_NO` = `m`.`ERM_ROUTE_NO`)
            and (`t`.`ERT_STAGE_NO` = 1))))
        left join `mrg`.`etm_service_type` `st` ON ((`m`.`ERM_BUS_CODE` = `st`.`EST_BUS_CODE`))) 
    union all select 
        concat('pnj', `m`.`ERM_ROUTE_NO`) AS `erm_route_no`,
        `m`.`ERM_START_STAGE` AS `erm_start_stage`,
        `t`.`ERT_ROUTE_VIA` AS `ert_route_via`,
        `m`.`ERM_END_STAGE` AS `erm_end_stage`,
        `m`.`ERM_NO_OF_STAGES` AS `erm_no_of_stages`,
        `m`.`ERM_ROUTE_TYPE` AS `erm_route_type`,
        `t`.`ERT_ROUTE_TYPE` AS `ert_route_type`,
        `st`.`EST_BUS_TYPE` AS `est_bus_type`
    from
        ((`pnj`.`etm_route_master` `m`
        join `pnj`.`etm_route_tran` `t` ON (((`t`.`ERT_ROUTE_NO` = `m`.`ERM_ROUTE_NO`)
            and (`t`.`ERT_STAGE_NO` = 1))))
        left join `pnj`.`etm_service_type` `st` ON ((`m`.`ERM_BUS_CODE` = `st`.`EST_BUS_CODE`))) 
    union all select 
        concat('vsg', `m`.`ERM_ROUTE_NO`) AS `erm_route_no`,
        `m`.`ERM_START_STAGE` AS `erm_start_stage`,
        `t`.`ERT_ROUTE_VIA` AS `ert_route_via`,
        `m`.`ERM_END_STAGE` AS `erm_end_stage`,
        `m`.`ERM_NO_OF_STAGES` AS `erm_no_of_stages`,
        `m`.`ERM_ROUTE_TYPE` AS `erm_route_type`,
        `t`.`ERT_ROUTE_TYPE` AS `ert_route_type`,
        `st`.`EST_BUS_TYPE` AS `est_bus_type`
    from
        ((`vsg`.`etm_route_master` `m`
        join `vsg`.`etm_route_tran` `t` ON (((`t`.`ERT_ROUTE_NO` = `m`.`ERM_ROUTE_NO`)
            and (`t`.`ERT_STAGE_NO` = 1))))
        left join `vsg`.`etm_service_type` `st` ON ((`m`.`ERM_BUS_CODE` = `st`.`EST_BUS_CODE`)))

;

CREATE OR REPLACE
VIEW `vw_ktc_route_tran` AS
    select distinct
        concat('prv',
                `prv`.`etm_route_tran`.`ERT_ROUTE_NO`) AS `ert_route_no`,
        `prv`.`etm_route_tran`.`ERT_STAGE_NO` AS `ert_stage_no`,
        `prv`.`etm_route_tran`.`ERT_STAGE_CODE` AS `ert_stage_code`,
        `prv`.`etm_route_tran`.`ERT_STAGE_NAME` AS `ert_stage_name`
    from
        `prv`.`etm_route_tran` 
    union all select distinct
        concat('mrg',
                `mrg`.`etm_route_tran`.`ERT_ROUTE_NO`) AS `ert_route_no`,
        `mrg`.`etm_route_tran`.`ERT_STAGE_NO` AS `ert_stage_no`,
        `mrg`.`etm_route_tran`.`ERT_STAGE_CODE` AS `ert_stage_code`,
        `mrg`.`etm_route_tran`.`ERT_STAGE_NAME` AS `ert_stage_name`
    from
        `mrg`.`etm_route_tran` 
    union all select distinct
        concat('pnj',
                `pnj`.`etm_route_tran`.`ERT_ROUTE_NO`) AS `ert_route_no`,
        `pnj`.`etm_route_tran`.`ERT_STAGE_NO` AS `ert_stage_no`,
        `pnj`.`etm_route_tran`.`ERT_STAGE_CODE` AS `ert_stage_code`,
        `pnj`.`etm_route_tran`.`ERT_STAGE_NAME` AS `ert_stage_name`
    from
        `pnj`.`etm_route_tran` 
    union all select distinct
        concat('vsg',
                `vsg`.`etm_route_tran`.`ERT_ROUTE_NO`) AS `ert_route_no`,
        `vsg`.`etm_route_tran`.`ERT_STAGE_NO` AS `ert_stage_no`,
        `vsg`.`etm_route_tran`.`ERT_STAGE_CODE` AS `ert_stage_code`,
        `vsg`.`etm_route_tran`.`ERT_STAGE_NAME` AS `ert_stage_name`
    from
        `vsg`.`etm_route_tran`

;
