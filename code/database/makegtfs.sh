sdir=`dirname $0`
echo $sdir
cd $sdir

fleet_id=$1
echo ${fleet_id}
folder=gtfs_${fleet_id}
mkdir -p ${folder}

#export mypath="C:\Program Files\MySQL\MySQL Server 5.6\bin"
host=`jq -r ".database.host" ../config.json`
echo $host
user=`jq -r ".database.user" ../config.json`
password=`jq -r ".database.password" ../config.json`
database=`jq -r ".database.database" ../config.json`
echo ${database}

myopts="--user=${user} --password=${password} --database=${database} --host=${host}"
echo $myopts

mysql ${myopts} -e"set @fleet_id=${fleet_id}; source agency.sql;" | tr '\t' ',' > ${folder}/agency.txt
mysql ${myopts} -e"set @fleet_id=${fleet_id}; source calendar.sql;" | tr '\t' ',' > ${folder}/calendar.txt
mysql ${myopts} -e"set @fleet_id=${fleet_id}; source route.sql;" | tr '\t' ',' > ${folder}/routes.txt
mysql ${myopts} -e"set @fleet_id=${fleet_id}; source stop.sql;" | tr '\t' ',' > ${folder}/stops.txt
mysql ${myopts} -e"set @fleet_id=${fleet_id}; source trip.sql;" | tr '\t' ',' > ${folder}/trips.txt
mysql ${myopts} -e"set @fleet_id=${fleet_id}; source frequencies.sql;" | tr '\t' ',' > ${folder}/frequencies.txt
mysql ${myopts} -e"set @fleet_id=${fleet_id}; source stop_times.sql;" | tr '\t' ',' > ${folder}/stop_times.txt
cp feed_info.txt ${folder}/feed_info.txt
#find ${folder} -name *.txt -empty -type f -delete
wc -l ${folder}/*.txt | sed -n 's/^[[:space:]]*0 \(.*\)/\1/p' | xargs rm

zip -j -r ${folder}.zip ${folder}/*.txt
unzip -v ${folder}.zip

feedvalidator.py ${folder} -o ../admin/public/gtfs_validation_results_${fleet_id}.html

