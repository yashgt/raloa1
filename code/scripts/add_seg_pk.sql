alter table segment add column is_stale boolean default 0; 

SET FOREIGN_KEY_CHECKS = 0;
alter table segment add primary key (from_stop_id, to_stop_id);

SET FOREIGN_KEY_CHECKS = 1;
