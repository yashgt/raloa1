fleet_id=$1
echo $fleet_id
folder=gtfs_$fleet_id
mkdir -p ${folder}

export mypath="C:\Program Files\MySQL\MySQL Server 5.6\bin"

cd ${folder}
myopts="-uroot -pgoatrans --database=avishkar -A"

"${mypath}/mysql" ${myopts} -e"set @fleet_id=${fleet_id}; source ../agency.sql;" | tr '\t' ',' > agency.txt
