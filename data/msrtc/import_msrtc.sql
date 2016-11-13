delimiter //
drop procedure if exists import_msrtc//
create procedure import_msrtc()
begin
	declare done integer;
	declare id integer;
    declare bus_stop_cd varchar(255);
    declare bus_stop_nm varchar(255);
	declare route_no, route_name, from_stop_cd, till_stop_cd varchar(255);

    
	declare c_stops cursor for 
	select S1.bus_stop_cd, S1.bus_stop_nm 
	from msrtc.listofstops S1
	/*left outer join stop S2 use index (idx_stop_code) on (S2.code=S1.bus_stop_cd and S2.fleet_id=7)
	where S2.stop_id is null */   	
	;
	declare c_routes cursor for
	select LOR.route_no, LOR.route_name, LOR.from_stop_cd, LOR.till_stop_cd
	from msrtc.listofroutes LOR
	/*left outer join route R on (LOR.route_no=R.route_cd and R.fleet_id=7)
	left outer join internal_route_map M on (M.route_id=R.route_id and LOR.route_no=M.internal_route_cd)
	where R.route_id is null*/
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
                , 0
                , 0
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
	fetch c_routes into route_no, route_name, from_stop_cd, till_stop_cd;
    IF done THEN 
		LEAVE get_routes;
    END IF;
	select route_no, route_name, from_stop_cd, till_stop_cd;
	set @id = 0;
	call save_route(
	  @id
	, 7
	, route_name
    , route_no
	, (select stop_id from stop S where S.code=from_stop_cd and S.fleet_id=7)
	, (select stop_id from stop S where S.code=till_stop_cd and S.fleet_id=7)
	, null
	, 5
);
	end loop get_routes;

	/* import routestops */
        
        
	
end//

/*call import_msrtc()//*/
