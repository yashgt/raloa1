set MYOPTS=--host=localhost --user=root --password=goatransport
set DB=msrtc1
set DIR=data\\data\\Google_data_281217
mysql %MYOPTS% -e "drop database msrtc1"
mysql %MYOPTS% < msrtc.sql
REM set IMPORT_OPTS=--host=localhost --user=root --password=goatransport --local --ignore-lines=1 --fields-terminated-by=\t -v 
REM mysqlimport %IMPORT_OPTS% --columns=BUS_STOP_CD,BUS_STOP_NM %DB% %DIR%\listofstops.csv
REM mysqlimport %IMPORT_OPTS% --columns=ROUTE_NO,ROUTE_NAME,FROM_STOP_CD,TILL_STOP_CD %DIR%\listofroutes.csv
REM mysqlimport %IMPORT_OPTS% --columns=ROUTE_NO,BUS_STOP_CD,STOP_SEQ %DIR%\listofstopsonroutes.csv
REM mysqlimport %IMPORT_OPTS% --columns=TRIP_NO,ROUTE_NO,BUS_STOP_CD,ARRIVAL_TM,DEPARTURE_TM %DIR%\listOfTrips.csv

REM mysql %MYOPTS% -D msrtc1 -e "load data local infile '%DIR%\\listofstops.csv' into table listofstops fields terminated by '\t' ignore 1 lines(BUS_STOP_CD, BUS_STOP_NM); show warnings" 
REM mysql %MYOPTS% -D msrtc1 -e "load data local infile '%DIR%\\listofroutes.csv' into table listofroutes fields terminated by '\t' ignore 1 lines(ROUTE_NO,ROUTE_NAME,FROM_STOP_CD,TILL_STOP_CD); show warnings" 
REM mysql %MYOPTS% -D msrtc1 -e "load data local infile '%DIR%\\listofstopsonroutes.csv' into table listofstopsonroutes fields terminated by '\t' ignore 1 lines(ROUTE_NO,BUS_STOP_CD,STOP_SEQ); show warnings" 
REM mysql %MYOPTS% -D msrtc1 -e "set @row = 0;load data local infile '%DIR%\\trips_boarding_alighting.csv' into table listoftrips fields terminated by '\t' ignore 1 lines(TRIP_NO,ROUTE_NO,BUS_STOP_CD,ARRIVAL_TM,DEPARTURE_TM,@is_boarding_stop, @is_alighting) set is_boarding_stop=(@is_boarding_stop='Y'), is_alighting=(@is_alighting='Y'), seq=@row := @row +1; show warnings" 

REM mysql %MYOPTS% -D msrtc1 -e "load data local infile 'data\\data\\BoradingAlighting.csv' into table listoftrips fields terminated by '\t' ignore 1 lines(TRIP_NO,ROUTE_NO,BUS_STOP_CD,ARRIVAL_TM,DEPARTURE_TM,@is_boarding_stop, @is_alighting) set is_boarding_stop=(@is_boarding_stop='Y'), is_alighting=(@is_alighting='Y'); show warnings" 

REM mysql %MYOPTS% -D raloa2 < delete.sql
REM mysql %MYOPTS% -D raloa2 < data\data\latlong\latlong.sql

REM mysql %MYOPTS% -D raloa2 --force < tripsummary.sql
REM mysql %MYOPTS% -D raloa2 < import_msrtc.sql





