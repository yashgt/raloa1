delimiter //
drop procedure if exists import_msrtc//
create procedure import_msrtc()
begin
	declare done integer;
	declare id integer;
    declare bus_stop_cd varchar(255);
    declare bus_stop_nm varchar(255);
	declare route_no, route_name, from_stop_cd, till_stop_cd varchar(255);
	declare from_stop_id, till_stop_id integer;

    
	declare c_stops cursor for 
	select S1.bus_stop_cd, S1.bus_stop_nm 
	from msrtc1.listofstops S1
	/*left outer join stop S2 use index (idx_stop_code) on (S2.code=S1.bus_stop_cd and S2.fleet_id=7)
	where S2.stop_id is null */   	
	;
	declare c_routes cursor for
	select 
	R1.route_no, R1.route_name
	,S1.stop_id, S2.stop_id
	from msrtc1.listofroutes R1 
	inner join stop S1 on (S1.code=R1.from_stop_cd and S1.fleet_id=7)
	inner join stop S2 on (S2.code=R1.till_stop_cd and S2.fleet_id=7)
	left outer join msrtc1.listofroutes R2 on
	(
	R2.from_stop_cd=R1.till_stop_cd
        and R2.till_stop_cd=R1.from_stop_cd
        /*and ((R2.via_stop_cd=R1.via_stop_cd) or (R2.via_stop_cd is null and R1.via_stop_cd is null))*/
		and case instr(R1.route_name, ' via')
			when 0 then instr(R2.route_name, ' via')=0
			else trim(substr(R1.route_name from instr(R1.route_name, ' via') + 5))=trim(substr(R2.route_name from instr(R2.route_name, ' via') + 5))
		end        
        )
	where R1.from_stop_cd<=R1.till_stop_cd
	and exists (select 1 from msrtc1.listofstopsonroutes SOR where SOR.route_no=R1.route_no)
	/*left outer join route R on (LOR.route_no=R.route_cd and R.fleet_id=7)
	left outer join internal_route_map M on (M.route_id=R.route_id and LOR.route_no=M.internal_route_cd)
	where R.route_id is null*/
	limit 500
	;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

	delete 
	/* select * */
	from internal_route_map 
	where route_id in (select route_id from route where fleet_id=7);
	delete from route where fleet_id=7;
    	delete from stop where fleet_id=7;


    open c_stops;

	set done = false;
        
    get_stops : loop

            fetch c_stops into bus_stop_cd, bus_stop_nm;
            IF done THEN 
                LEAVE get_stops;
            END IF;
            set @id = 0;
            
            
            call save_stop(
                @id
                , bus_stop_nm
                , bus_stop_cd
                , 19.239088, 75.592857
                , 7
                , null
                , 5);
            
    end loop get_stops;

    close c_stops;

	select 'Stops imported';

	/* import routes */
	open c_routes;
	set done = false;
	get_routes: loop
	fetch c_routes into route_no, route_name, from_stop_id, till_stop_id;
    IF done THEN 
		LEAVE get_routes;
    END IF;
/*	select route_no, route_name, from_stop_cd, till_stop_cd; */
	set @id = 0;
	call save_route(
	  @id
	, 7
	, route_name
    , route_no
/*
	, (select stop_id from stop S where S.code=from_stop_cd and S.fleet_id=7)
	, (select stop_id from stop S where S.code=till_stop_cd and S.fleet_id=7)
*/
	, from_stop_id
	, till_stop_id
	, null
	, 5
);

	/* import routestops */
	insert into routestop (stop_id, peer_stop_id, route_id, stage_id, sequence)
	select 
	St.stop_id
	,null
	,Rt.route_id
	,0
	,RS.stop_seq
	from  
	route Rt
	inner join internal_route_map M  on (M.route_id=Rt.route_id)
	inner join msrtc1.listofstopsonroutes RS on (M.internal_route_cd=RS.route_no)
	inner join msrtc1.listofstops S on (RS.bus_stop_cd=S.bus_stop_cd)
	inner join stop St on (St.code=S.bus_stop_cd)
	where Rt.fleet_id=7
	and St.fleet_id=7
	and M.internal_route_cd=route_no
	order by RS.stop_seq
	;
        
	end loop get_routes;


	select 'Routes imported';
        
	
end//

/*call import_msrtc()// */