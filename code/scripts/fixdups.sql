update stop set peer_stop_id=null where stop_id in (96,167,212,229,386);

update stop set peer_stop_id=125 where stop_id=124;
update stop set peer_stop_id=124 where stop_id=125;

update stop set peer_stop_id=213 where stop_id=214;
update stop set peer_stop_id=214 where stop_id=213;

update stop set peer_stop_id=230 where stop_id=241;
update stop set peer_stop_id=241 where stop_id=230;

update stop set peer_stop_id=384 where stop_id=385;
update stop set peer_stop_id=385 where stop_id=384;