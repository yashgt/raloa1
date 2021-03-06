delimiter //
drop procedure if exists import_msrtc//
create procedure import_msrtc()
begin
	declare done integer;
	declare id integer;
	declare trip_id integer;
    declare bus_stop_cd varchar(255);
    declare bus_stop_nm varchar(255);
	declare route_no, route_name, from_stop_cd, till_stop_cd varchar(255);
	declare from_stop_id, till_stop_id integer;

    
	declare c_stops cursor for 
	select S1.bus_stop_cd, S1.bus_stop_nm 
	from msrtc1.listofstops S1
	/*import ones that are not already present */
	left outer join stop S2  on (S2.code=S1.bus_stop_cd and S2.fleet_id=7) where S2.stop_id is null 

/*	where not exists (select 1 from stop S2 where S2.code=S1.bus_stop_cd and S2.fleet_id=7)*/
	/*and 1=0*/
	/*left outer join stop S2 use index (idx_stop_code) on (S2.code=S1.bus_stop_cd and S2.fleet_id=7)
	where S2.stop_id is null   	*/
	;

	declare c_routes cursor for
	select 
	CR.route_cd, R1.route_name
	,S1.stop_id, S2.stop_id
	from msrtc1.listofroutes R1 
    inner join 
(
select R1.route_no as route_no
, concat(R1.route_no, coalesce(concat("-", R2.route_no), "")) as route_cd
, R1.stops
from
(
	select 
	R1.route_no, group_concat(R1.bus_stop_cd ) as stops
	from
	(
		select R1.route_no, SOR.bus_stop_cd as bus_stop_cd	
		from msrtc1.listofroutes R1 	
		inner join msrtc1.listofstopsonroutes SOR on (R1.route_no=SOR.route_no)
		where exists (select 1 from msrtc1.listoftrips Tr where Tr.route_no=R1.route_no)
		/*and R1.route_no like '10%'	*/
		order by SOR.STOP_SEQ 
	) as R1
	group by R1.route_no
) as R1
left outer join
(
	select 
	R1.route_no, group_concat(R1.bus_stop_cd ) as stops
	from
	(
		select R1.route_no, SOR.bus_stop_cd as bus_stop_cd	
		from msrtc1.listofroutes R1 	
		inner join msrtc1.listofstopsonroutes SOR on (R1.route_no=SOR.route_no)
		where exists (select 1 from msrtc1.listoftrips Tr where Tr.route_no=R1.route_no)
		/*and R1.route_no like '10%'	*/
		order by SOR.STOP_SEQ desc
	) as R1
	group by R1.route_no
) as R2
on (R1.route_no <> R2.route_no and R1.stops=R2.stops)
where R1.route_no < R2.route_no or R2.route_no is null

)
	CR on (R1.route_no=CR.route_no)
	inner join stop S1 on (S1.code=R1.from_stop_cd and S1.fleet_id=7) /*import only those whose start and end stops are present already */
	inner join stop S2 on (S2.code=R1.till_stop_cd and S2.fleet_id=7)
	/*and exists (select 1 from msrtc1.listofstopsonroutes SOR where SOR.route_no=R1.route_no*/
	and exists (select 1 from msrtc1.listoftrips Tr where Tr.route_no=R1.route_no)
	left outer join internal_route_map M on (R1.route_no=M.internal_route_cd)
	left outer join route R on ( M.route_id=R.route_id and R.fleet_id=7)
	
	where R.route_id is null
	/*limit 500*/
	;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;


    open c_stops;

	set done = false;
        
    get_stops : loop
			select bus_stop_cd, bus_stop_nm;
            fetch c_stops into bus_stop_cd, bus_stop_nm;
            IF done THEN 
                LEAVE get_stops;
            END IF;
            set @id = 0;
            
            
            call save_stop(
                @id
                , bus_stop_nm
                , bus_stop_cd
    			, null, null
                , 7
                , null
                , 5);
            
    end loop get_stops;

    close c_stops;
	update stop set location_status=0 where fleet_id=7 and latitude is null and longitude is null;

	select 'Stops imported';

	/* import routes */
	open c_routes;
	set done = false;
	get_routes: loop
	fetch c_routes into route_no, route_name, from_stop_id, till_stop_id;
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
	, -1
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

/*
	call save_trip(@trip_id, T.trip_no, 1, 0, @id, 7, 0, null, null, null);

	insert into routestoptrip(route_stop_id, trip_id, arrival_tm, departure_tm)
	select route_stop_id, @trip_id, arrival_tm, departure_tm
	from route Rt
	inner join routestop rtst on (Rt.route_id=rtst.route_id)
	inner join 
	inner join internal_route_map M on (M.route_id=Rt.route_id)
	inner join msrtc1.listoftrips T on (M.internal_route_cd=T.route_no and T.bus_stop_cd=St.code)
	where Rt.route_id=@id
	;
*/


        
	end loop get_routes;


	select 'Routes imported';
        
	
end//



call import_msrtc()//
