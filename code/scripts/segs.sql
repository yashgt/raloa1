delimiter //

drop procedure if exists drop_segs//

CREATE procedure drop_segs()
BEGIN
		DECLARE done INT DEFAULT FALSE;
        DECLARE f_id, t_id, cnt INT ;
        DECLARE i int default 5 ;
		declare l int;
		
        declare cur1 cursor for select from_stop_id as fid, to_stop_id as tid, count(*) as c from segment group by from_stop_id, to_stop_id having count(*)>1 order by count(*) desc;
		DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
		open cur1;

		read_loop: while true do
			fetch cur1 into f_id, t_id, cnt;
			IF done THEN
				LEAVE read_loop;
			END IF;
			set i = i-1;
			set l = cnt -1;
			select f_id, t_id, cnt;


			delete 
			from segment
			where from_stop_id = f_id and to_stop_id=t_id
			limit l;
			
		end while;

		close cur1;
END//

call drop_segs()//