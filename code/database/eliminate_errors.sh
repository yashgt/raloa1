file=../admin/public/gtfs_validation_results_7.html
regex="s/<li><div class=\"problem\">.*\(PATT \([[:alnum:]]\+\).*\)<\/div><br><\/li>/\2,\"\1\"/p"

echo "${regex/PATT/The first stop_time in trip}"

sed -n \
-e "${regex/PATT/Timetravel detected! Arrival time is before previous departure at sequence number [[:alnum:]]\+ in trip}" \
-e "${regex/PATT/The first stop_time in trip}" \
-e "${regex/PATT/The last stop_time in trip}" \
-e "${regex/PATT/Duplicate stop_sequence in trip_id}" \
-e "${regex/PATT/High speed travel detected in trip}" \
-e "${regex/PATT/sequence number [[:digit:]]\+ in trip}" \
-e "${regex/PATT/Invalid value  in field <code>arrival_time<\/code><br>The last stop_time in trip}" \
-e "${regex/PATT/Invalid value  in field <code>departure_time<\/code><br>The first stop_time in trip}" \
-e "${regex/PATT/Arrival time is before previous departure at sequence number [[:alnum:]]\+ in trip}" \
-e "s/<tr><td>\([[:alnum:]]\+\)<\/td><td>.*<\/td><td class=\"problem\">.*/\1,\"Departure time before arrival time\"/p" \
-e "s/.*The trip with the trip_id \"\([[:alnum:]]\+\)\" only has one stop on it.*/\1, \"Other stops of the trip have issues\"/p" \
${file} | sort | uniq > error_trips.txt
echo "L8518,Too fast travel" >> error_trips.txt
echo "L8441,Too fast travel" >> error_trips.txt
echo "L1500,Too fast travel" >> error_trips.txt
echo "L5295,Too fast travel" >> error_trips.txt

mysql --host=${DBHOST} --user=root --password=goatransport -D msrtc1 -e "delete from error_trips;"
mysql --host=${DBHOST} --user=root --password=goatransport -D msrtc1 --local-infile=1 -e "SET GLOBAL local_infile=true; load data local infile 'error_trips.txt' replace into table error_trips fields terminated by ',' enclosed by '\"' (trip_no,error); show warnings;"
mysql --host=${DBHOST} --user=root --password=goatransport -D msrtc1 -e "update error_trips E join listoftrips T on (E.trip_no=T.trip_no) set E.depot_cd=T.depot_cd, E.route_no=T.route_no"
mysql --host=${DBHOST} --user=root --password=goatransport -D msrtc1 -e "update error_trips set error=replace(error,'<code>','')"
mysql --host=${DBHOST} --user=root --password=goatransport -D msrtc1 -e "update error_trips set error=replace(error,'</code>','')"
mysql --host=${DBHOST} --user=root --password=goatransport -D msrtc1 -e "update error_trips set error=replace(error,'<br>','')"

mysql --host=${DBHOST} --user=root --password=goatransport -D msrtc1 -e "select depot_cd, route_no, trip_no, error from error_trips order by depot_cd, route_no, trip_no, error" | sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > error_trips.csv

#mutt -s "Errors" yashgt@gmail.com -a error_trips.csv  < /dev/null

