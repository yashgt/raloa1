delimiter //


drop procedure if exists Source//
create procedure Source(
	IN source_stop varchar(200)
	)
begin
	select latitude,longitude 
	from stop 
	where stop.name like source_stop ;
end//



drop procedure if exists Destination //
create procedure Destination(
	IN destination_stop varchar(200)
	)
begin
	select latitude,longitude 
	from stop 
	where stop.name like destination_stop ;
end//
