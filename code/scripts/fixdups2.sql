update stop set peer_stop_id=null where stop_id in (1259,1015, 1188, 184);

/*Corjuem*/
update stop set peer_stop_id=1258 where stop_id=1257;
update stop set peer_stop_id=1257 where stop_id=1258;
update stop set name = 'Aldona ferry jetty' where stop_id=1257 or stop_id=1258;

/*karashumol*/
update stop set peer_stop_id=1000 where stop_id=999;
update stop set peer_stop_id=999 where stop_id=1000;

/*Dharmapur*/
update stop set peer_stop_id=1186 where stop_id=1187;
update stop set peer_stop_id=1187 where stop_id=1186;

/*Verna Pirni*/
update stop set peer_stop_id=183 where stop_id=905;
update stop set peer_stop_id=905 where stop_id=183;
update routestop set peer_stop_id = null where stop_id=184 and route_id=2;


/*TEST*/
update stop set peer_stop_id=null where stop_id in (715,716,717);
delete from stop where stop_id in (715,716,717) ;
