echo Running from ${PWD}
etmfolder="data/data/report"
target=msrtc1
MYOPTS="--host=localhost --user=root --password=goatransport"
LOADOPTS="fields terminated by '\t' enclosed by '\"' "

mysql ${MYOPTS} -e "drop database ${target}"
mysql ${MYOPTS} < msrtc.sql
IMPORT_OPTS="${MYOPTS} --local --ignore-lines=1 --fields-terminated-by=, -v msrtc"

#in2csv ${etmfolder}/listof_routes.xlsx > ${etmfolder}/listof_routes.csv
#in2csv ${etmfolder}/listof_stops.xlsx > ${etmfolder}/listof_stops.csv
#in2csv ${etmfolder}/listofStopOfRoutes.xlsx > ${etmfolder}/listofStopOfRoutes.csv
#in2csv ${etmfolder}/listofBoardingAlighting.xlsx > ${etmfolder}/listofBoardingAlighting.csv

#xlsx2csv -s 1 -e "./${etmfolder}/listof_routes.xlsx" | sed -e "s/\\n//g" > "${etmfolder}/listof_routes.csv"
#dos2unix "${etmfolder}/listof_routes.csv"
#dos2unix "${etmfolder}/listof_routes.csv"
#
#xlsx2csv -s 1 -e "./${etmfolder}/listof_stops.xlsx" > "${etmfolder}/listof_stops.csv"
#dos2unix "${etmfolder}/listof_stops.csv"
#dos2unix "${etmfolder}/listof_stops.csv"
#
#xlsx2csv -s 1 -e "./${etmfolder}/listofStopOfRoutes.xlsx" > "${etmfolder}/listofStopOfRoutes.csv"
#dos2unix "${etmfolder}/listofStopOfRoutes.csv"
#dos2unix "${etmfolder}/listofStopOfRoutes.csv"
#
#xlsx2csv -s 1 -e "./${etmfolder}/listofBoardingAlighting.xlsx" > "${etmfolder}/listofBoardingAlighting.csv"
#dos2unix "${etmfolder}/listofBoardingAlighting.csv"
#dos2unix "${etmfolder}/listofBoardingAlighting.csv"
##sed -n -e "s/^\([[:alnum:]]*,\)\{3\}.* \(.*\)$/\1\2/p" "${etmfolder}/listofBoardingAlighting.csv"

#mysql ${MYOPTS} -D ${target} -e "load data local infile '${etmfolder}/listof_stops.csv' into table listofstops fields terminated by ',' enclosed by '\"' ignore 1 lines(BUS_STOP_CD, BUS_STOP_NM); show warnings" 
mysql ${MYOPTS} -D ${target} -e "load data local infile '${etmfolder}/listof_stops.csv' into table listofstops ${LOADOPTS}(BUS_STOP_CD, BUS_STOP_NM); show warnings" 
mysql ${MYOPTS} -D ${target} -e "update listofstops set bus_stop_nm=trim(bus_stop_nm);"
mysql ${MYOPTS} -D ${target} -e "update listofstops set bus_stop_nm=trim(leading ',' from bus_stop_nm);"
mysql ${MYOPTS} -D ${target} -e "update listofstops set bus_stop_nm=trim(trailing ',' from bus_stop_nm);"

mysql ${MYOPTS} -D ${target} -e "load data local infile '${etmfolder}/listof_routes.csv' into table listofroutes ${LOADOPTS}(ROUTE_NO,ROUTE_NAME,FROM_STOP_CD,TILL_STOP_CD); show warnings" 
mysql ${MYOPTS} -D ${target} -e "load data local infile '${etmfolder}/listofStopsOfRoutes.csv' into table listofstopsonroutes ${LOADOPTS}(ROUTE_NO,BUS_STOP_CD,STOP_SEQ); show warnings" 
mysql ${MYOPTS} -D ${target} -e "load data local infile '${etmfolder}/listofBoardingAlighting.csv' replace into table listoftrips ${LOADOPTS}(TRIP_NO,ROUTE_NO,BUS_STOP_CD,@arrival_tm,DEPARTURE_TM,@is_boarding_stop, @is_alighting,DEPOT_CD,BUS_TYPE_NM, START_DATE, END_DATE, DAY_OFFSET, STOP_SEQ) set arrival_tm=STR_TO_DATE(@ARRIVAL_TM,'%Y-%m-%d %H:%i:%s') ,is_boarding_stop=(@is_boarding_stop='Y'), is_alighting=(@is_alighting='Y'); show warnings" 

#mysql ${MYOPTS} -D ${target} -e "load data local infile '${etmfolder}/listofBoardingAlighting.csv' ignore into table listoftrips fields terminated by ',' replace 1 lines(TRIP_NO,ROUTE_NO,BUS_STOP_CD,@arrival_tm,DEPARTURE_TM,@is_boarding_stop, @is_alighting) set arrival_tm=STR_TO_DATE(@arrival_tm,'%d-%m-%Y %H:%i:%s') ,is_boarding_stop=(@is_boarding_stop='Y'), is_alighting=(@is_alighting='Y'); show warnings"

mysql ${MYOPTS} -D ${target} -e "update listoftrips set trip_no=trim(leading '\`' from trip_no);"
mysql ${MYOPTS} -D ${target} -e "update listoftrips set trip_no=trim(trailing '\`' from trip_no);"

mysql ${MYOPTS} -D ${target} --force < tripsummary.sql

mysql ${MYOPTS} -D ${target} -e "select count(*) from listoftrips;"

mysql ${MYOPTS} -D ${target} -e "select R.* from listofroutes R left outer join listofstops S on (R.from_stop_cd=S.bus_stop_cd) where S.bus_stop_cd is null;"
