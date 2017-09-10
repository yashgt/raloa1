file=../admin/public/gtfs_validation_results_7.html
regex="s/.*PATT \([[:alnum:]]\+\).*/\1/p"

sed -n -e "${regex/PATT/The first stop_time in trip}" -e "${regex/PATT/The last stop_time in trip}" -e "${regex/PATT/Duplicate stop_sequence in trip_id}" -e "${regex/PATT/High speed travel detected in trip}" -e "${regex/PATT/sequence number [[:digit:]]\+ in trip}" -e "${regex/PATT/Arrival time is before previous departure at sequence number [[:alnum:]]\+ in trip}" ${file} | sort | uniq > error_trips.txt

mysql --host=${DBHOST} --user=root --password=goatransport -D raloa2 -e "load data local infile 'error_trips.txt' replace into table error_trips"


