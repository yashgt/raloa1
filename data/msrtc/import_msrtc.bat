set MYOPTS=--host=localhost --user=root --password=goatransport
REM mysql %MYOPTS% -e "drop database msrtc1"
REM mysql %MYOPTS% < msrtc.sql
REM set IMPORT_OPTS=--host=localhost --user=root --password=goatransport --local --ignore-lines=1 --fields-terminated-by=\t -v msrtc
REM mysqlimport %IMPORT_OPTS% --columns=BUS_STOP_CD,BUS_STOP_NM data\data\ListOfStops.csv
REM mysqlimport %IMPORT_OPTS% --columns=ROUTE_NO,ROUTE_NAME,FROM_STOP_CD,TILL_STOP_CD data\data\listOfRoutes.csv
REM mysqlimport %IMPORT_OPTS% --columns=ROUTE_NO,BUS_STOP_CD,STOP_SEQ data\data\listOfStopsonRoutes.csv
REM mysqlimport %IMPORT_OPTS% --columns=TRIP_NO,ROUTE_NO,BUS_STOP_CD,ARRIVAL_TM,DEPARTURE_TM data\data\ListOfTrips.csv

REM mysql %MYOPTS% -D msrtc1 -e "load data local infile 'data\\data\\ListOfStops.csv' into table listofstops fields terminated by '\t' ignore 1 lines(BUS_STOP_CD, BUS_STOP_NM); show warnings" 
REM mysql %MYOPTS% -D msrtc1 -e "load data local infile 'data\\data\\ListOfRoutes.csv' into table listofroutes fields terminated by '\t' ignore 1 lines(ROUTE_NO,ROUTE_NAME,FROM_STOP_CD,TILL_STOP_CD); show warnings" 
REM mysql %MYOPTS% -D msrtc1 -e "load data local infile 'data\\data\\ListOfStopsonRoutes.csv' into table listofstopsonroutes fields terminated by '\t' ignore 1 lines(ROUTE_NO,BUS_STOP_CD,STOP_SEQ); show warnings" 
REM REM mysql %MYOPTS% -D msrtc1 -e "set @row = 0;load data local infile 'data\\data\\BoradingAlighting.csv' into table listoftrips fields terminated by '\t' ignore 1 lines(TRIP_NO,ROUTE_NO,BUS_STOP_CD,ARRIVAL_TM,DEPARTURE_TM,@is_boarding_stop, @is_alighting) set is_boarding_stop=(@is_boarding_stop='Y'), is_alighting=(@is_alighting='Y'), seq=@row := @row +1; show warnings" 
REM mysql %MYOPTS% -D msrtc1 -e "load data local infile 'data\\data\\BoradingAlighting.csv' into table listoftrips fields terminated by '\t' ignore 1 lines(TRIP_NO,ROUTE_NO,BUS_STOP_CD,ARRIVAL_TM,DEPARTURE_TM,@is_boarding_stop, @is_alighting) set is_boarding_stop=(@is_boarding_stop='Y'), is_alighting=(@is_alighting='Y'); show warnings" 

mysql %MYOPTS% -D raloa2 < delete.sql
mysql %MYOPTS% -D raloa2 < data\data\latlong\latlong.sql

mysql %MYOPTS% -D msrtc1 -e "delete from msrtc1.listoftrips where is_boarding_stop='N' and is_alighting='N';"

mysql %MYOPTS% -D raloa2 --force < tripsummary.sql
mysql %MYOPTS% -D raloa2 < import_msrtc.sql





