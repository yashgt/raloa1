select peer_stop_id from stop group by peer_stop_id having count(*)>1;
