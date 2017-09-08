/*Vasco pedne Route ID 15 to be deleted Route no longer exists*/
call delete_route(15);
/*Route ID 16 is repeated of Route ID 23. ROUTE ID 16 to be deleted*/
call delete_route(16);

/*has trips*/
/*Route ID 74 to be deleted*/
call delete_trips_for_route(74);
call delete_route(74);

/*Pnj 40 is also vsg 26 route ID 664*/
/*Delete 598 vsg26*/
call delete_route(598);
 
/*Prv 72 initial stops to be deleted*/
 
/*Delete route 94 as same as 205. Link 205 as pnj51 &  prv61*/
/*has trips*/
call delete_trips_for_route(94);
call delete_route(94);
delete from internal_route_map where route_id=205;
insert into internal_route_map(route_id, internal_route_cd) values(205,'pnj51');
insert into internal_route_map(route_id, internal_route_cd) values(205,'prv61');
 
/*Route ID 169 is express. However same ETM ID is used for 169 and 171. ETM ID is MRG 34*/
 
/*Route ID 214 is same as Route ID 89 ie prv 43. So 89 to be deleted and 214 made as prv43. Keep 214 as it has stages*/
call delete_route(89);
 
/*Route ID 215 is erroneous route. To be deleted*/
call delete_route(215);
 
/*Route ID 224 is repeat of 649. 224 to be deleted*/
call delete_route(224);
 
/*Route ID 225 to be deleted. It's repeat of 644 of prv13*/
call delete_route(225);
 
/*Route 226. ETM ID unknown. Route valid. Market to Keri Ponda.*/
/*They say 226 was running earlier but now it is no more valid and non operating. Take a call wether to delete or keep. No timings.*/
call delete_route(226);
 
/*Panaji pisurlem ID 227 not existing route. TO be deleted*/
call delete_route(227);
 
/*ROUTE ID 228 to be deleted. It's repeat of prv24 ie ID 630*/
call delete_route(228);
 
/*Route 229 to be deleted. It's repeat of prv34 ie ID 83*/
call delete_route(229);

call delete_route(49);
