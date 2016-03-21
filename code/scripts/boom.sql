/* ACGL Bhuipal */
update routestop set stop_id=1501 where stop_id=76 and peer_stop_id=75 ;
update routestop set peer_stop_id=1501 where peer_stop_id=76 and stop_id=75 ;
update routestop set stop_id=1479 where stop_id=1448 and peer_stop_id=199 ;
update routestop set peer_stop_id=1479 where peer_stop_id=1448 and stop_id=199 ;

delete from stop where stop_id in (76,1448);
