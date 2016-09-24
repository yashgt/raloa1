delimiter //
drop procedure if exists import_routes//
create procedure import_routes()
begin
	declare done integer;
	declare id integer;
	declare route_cd varchar(255);
	declare depot_code varchar(255);

	declare c_missing_routes cursor for
	select erm_route_no 
	from etm_route_master R
	left outer join raloa2.internal_route_map RM on (R.erm_route_no=RM.internal_route_cd)
	where RM.route_id is null 
	;



	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
	open c_missing_routes;
	
	/*Import the stages in existing routes if stages are missing */
	insert into raloa2.stage(stage_name, route_id, internal_stage_cd)
		select T.ert_stage_name, R.route_id, T.ERT_STAGE_CODE
		from raloa2.route R
		inner join raloa2.internal_route_map RM on (R.route_id=RM.route_id)
		inner join etm_route_tran T on (T.ert_route_no=RM.internal_route_cd)
		where ert_route_no=route_cd
		and R.fleet_id=2 /*parameterize*/
		and R.start_stop_id is not null and R.end_stop_id is not null
		and (select count(*) from raloa2.stage SG where SG.route_id=R.route_id)=1
		order by R.route_id, cast(T.ert_stage_no as unsigned);


	/*Create routes from other depots that are not already present in TARA */
	get_missing_route : loop

		fetch c_missing_routes into route_cd;
		IF done THEN 
			LEAVE get_missing_route;
		END IF;
		set @id = 0;
		call raloa2.save_route(
			@id
			, 2
			, 'ABC'
			, concat(database(), route_cd)
			, null
			, null
			, null
			, 0);

		insert into raloa2.stage(stage_name, route_id, internal_stage_cd)
		select T.ert_stage_name, @id, T.ERT_STAGE_CODE
		from etm_route_tran T 
		where ert_route_no=route_cd
		order by cast(T.ert_stage_no as unsigned);
		
	end loop get_missing_route;

	close c_missing_routes;
	
end//

/*call import_routes()//*/

