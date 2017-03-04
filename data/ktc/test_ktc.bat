cd ..\..\code\database
call .\restore.bat

cd ..\..\data\ktc

sh map.sh > map_etm_routes.sql
mysql --host=localhost --user=root --password=goatransport --database=raloa2 < map_etm_routes.sql
mysql --host=localhost --user=root --password=goatransport --database=raloa2 < import_ktc.sql