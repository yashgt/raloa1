/* ACGL Bhuipal */
update routestop set stop_id=1501 where stop_id=76 and peer_stop_id=75 ;
update routestop set peer_stop_id=1501 where peer_stop_id=76 and stop_id=75 ;

/*update routestop set stop_id=1479 where stop_id=1448 and peer_stop_id=199 ;
update routestop set peer_stop_id=1479 where peer_stop_id=1448 and stop_id=199 ;
*/

update stop set peer_stop_id=218 where stop_id=217;
update routestop set peer_stop_id=218 where peer_stop_id=1566 and stop_id=217 ;

update routestop set stop_id=1395 where stop_id=219 and peer_stop_id=220 ;

update stop set peer_stop_id=1567 where stop_id=1568;
update stop set peer_stop_id=1568 where stop_id=1567;
update routestop set stop_id=1568 where stop_id=221 and peer_stop_id=1567 ;
update routestop set peer_stop_id=1568 where peer_stop_id=221 and stop_id=1567 ;

update stop set peer_stop_id=null where stop_id=1429;
update routestop set stop_id=1433 where stop_id=1429 and peer_stop_id=508 ;


update stop set peer_stop_id=732 where stop_id=731;

update stop set peer_stop_id=908 where stop_id=909;
update stop set peer_stop_id=null where stop_id=1417;

update stop set peer_stop_id=null where stop_id=1479;

update stop set peer_stop_id=null where stop_id=226;

delete from segment;
delete from stop where stop_id in (76, 1566, 219,  297) ;

delete from stop where stop_id in (1570, 1571, 1572, 1573, 1574);
