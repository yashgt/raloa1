fleet_id=$1
echo $fleet_id
folder=gtfs_$fleet_id
mkdir -p ${folder}

export mypath="C:\Program Files\MySQL\MySQL Server 5.6\bin"

myopts="-uroot -pgoatrans --database=avishkar -A"

"${mypath}/mysql" ${myopts} -e"set @fleet_id=${fleet_id}; source agency.sql;" | tr '\t' ',' > ${folder}\agency.txt
"${mypath}/mysql" ${myopts} -e"set @fleet_id=${fleet_id}; source route.sql;" | tr '\t' ',' > ${folder}\route.txt
"${mypath}/mysql" ${myopts} -e"set @fleet_id=${fleet_id}; source stop.sql;" | tr '\t' ',' > ${folder}\stop.txt
"${mypath}/mysql" ${myopts} -e"set @fleet_id=${fleet_id}; source trip.sql;" | tr '\t' ',' > ${folder}\trip.txt
"${mypath}/mysql" ${myopts} -e"set @fleet_id=${fleet_id}; source frequencies.sql;" | tr '\t' ',' > ${folder}\frequencies.txt
"${mypath}/mysql" ${myopts} -e"source stop_times.sql;" | tr '\t' ',' > ${folder}\stop_times.txt
