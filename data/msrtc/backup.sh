mysqldump --ignore-table=avishkar.sessions  --host=${DBHOST} --user=root --password=goatransport --add-drop-database --databases msrtc1 > msrtcdump.sql
