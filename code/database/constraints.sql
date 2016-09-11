alter table routestop
add constraint 'fk_peer_stop_id'
foreign key ('peer_stop_id')
references 'stop'('stop_id')
on delete cascade