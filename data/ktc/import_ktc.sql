delimiter //
drop procedure if exists import_missing_routes//
create procedure import_missing_routes()
begin
	declare done integer;
	declare id integer;
	declare route_cd varchar(255);
	declare depot_code varchar(255);
    declare depotdb varchar(255);
    /*declare @query varchar(500);*/
    declare depot_cd int default 1;
    
	declare c_missing_routes cursor for select erm_route_no from vw_missing_route R	
	;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    
    while depot_cd <=4 do
    
        case depot_cd 
			when 1 then select 'pnj' into depotdb ;
			when 2 then select 'mrg' into depotdb ;
			when 3 then select 'vsg' into depotdb ;
			when 4 then select 'prv' into depotdb ;
		end case;

        SET @query = CONCAT('CREATE or replace VIEW vw_missing_route as select erm_route_no from ', depotdb,  '.etm_route_master R left outer join internal_route_map RM on (','concat( cast(\'', depotdb, '\' as char character set utf8), cast(R.erm_route_no as char character set utf8))=RM.internal_route_cd) inner join etmtoload L on (concat( cast(\'',depotdb, '\' as char character set utf8),cast(R.erm_route_no as char character set utf8))=L.etmroute) where RM.route_id is null' ); 
        select @query; 

        PREPARE stmt from @query; 
        EXECUTE stmt; 
		DEALLOCATE PREPARE stmt; 

        open c_missing_routes;

		set done = false;
        /*Create routes from other depots that are not already present in TARA */
        get_missing_route : loop

            fetch c_missing_routes into route_cd;
            IF done THEN 
                LEAVE get_missing_route;
            END IF;
            set @id = 0;
            
                        
            call save_route(
                @id
                , 2
                , 'ABC'
                , concat(depotdb, route_cd)
                , null
                , null
                , null
                , 0);

            	set @stqry = CONCAT('insert into stage(stage_name, route_id, internal_stage_cd, is_via, sequence) select S.ert_stage_name ,',@id,' , S.ert_stage_code , (S.ert_stage_name=S.ert_route_via) , @rownum := @rownum +1 as rank from ( select distinct T.ert_stage_name , T.ERT_STAGE_CODE , T.ERT_ROUTE_VIA , T.ert_stage_no from ', depotdb ,'.etm_route_tran T where ert_route_no=\'', route_cd, '\' group by T.ert_stage_name, T.ERT_STAGE_CODE, (T.ert_stage_name=T.ERT_ROUTE_VIA) order by cast(T.ert_stage_no as unsigned)) S , (select @rownum :=0) r ') ;

        	select @stqry; 

        	PREPARE stmt from @stqry; 
        	EXECUTE stmt; 
			
			DEALLOCATE PREPARE stmt; 
            
        end loop get_missing_route;

        close c_missing_routes;
        
        set depot_cd = depot_cd + 1;
        
    end while;
	
end//

call import_missing_routes()//
