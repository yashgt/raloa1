mysql --host=${DBHOST} --user=root --password=goatransport < dump.sql
mysql --host=${DBHOST} --user=root --password=goatransport --database=raloa2 < procs.sql
