mysqldump --ignore-table=raloa2.sessions  --host=taradb.cnld6dhtkcap.ap-south-1.rds.amazonaws.com --user=root --password=Spider123 --add-drop-database --databases raloa2 > proddump.sql
mysql --host=localhost --user=root --password=Spider123 < proddump.sql
mysql --host=localhost --user=root --password=Spider123 --database=raloa2 < procs.sql