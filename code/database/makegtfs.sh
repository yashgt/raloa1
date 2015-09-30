fleet_id=$1
echo $fleet_id
folder=gtfs_$fleet_id
mkdir -p ${folder}

#export mypath="C:\Program Files\MySQL\MySQL Server 5.6\bin"
host=`jq -r ".database.host" ../config.json`

myopts="-uroot -pgoatransport --database=raloa2 --host=${host}"
echo ${myopts}

mysql ${myopts} -e"set @fleet_id=${fleet_id}; source agency.sql;" | tr '\t' ',' > ${folder}/agency.txt
mysql ${myopts} -e"set @fleet_id=${fleet_id}; source route.sql;" | tr '\t' ',' > ${folder}/route.txt
mysql ${myopts} -e"set @fleet_id=${fleet_id}; source stop.sql;" | tr '\t' ',' > ${folder}/stop.txt
mysql ${myopts} -e"set @fleet_id=${fleet_id}; source trip.sql;" | tr '\t' ',' > ${folder}/trip.txt
mysql ${myopts} -e"set @fleet_id=${fleet_id}; source frequencies.sql;" | tr '\t' ',' > ${folder}/frequencies.txt
mysql ${myopts} -e"set @fleet_id=${fleet_id}; source stop_times.sql;" | tr '\t' ',' > ${folder}/stop_times.txt
