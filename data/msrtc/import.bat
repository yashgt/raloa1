cat stops.txt | tr "|" "\n" | sed "s/\(.*\)(\(.*\))/7,'\1','\2',0/g" > stop.csv

mysqlimport --local --columns="fleet_id,code,name,location_status" --fields-enclosed-by="'" --host=localhost --password=goatransport --user=root raloa2 stop.csv
