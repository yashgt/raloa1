set -x
MYOPTS="--host=${DBHOST} --user=root --password=goatransport"

mysql ${MYOPTS} -D raloa2 < delete.sql
mysql ${MYOPTS} -D raloa2 < data/data/latlong/latlong.sql
mysql ${MYOPTS} -D raloa2 -e "update stop set location_status=1 where fleet_id=7;"

#mysql ${MYOPTS} -D raloa2 --force < tripsummary.sql
mysql ${MYOPTS} -D raloa2 < import_msrtc.sql
mysql ${MYOPTS} -D raloa2 -e "update stop set location_status=0, latitude=18.959045, longitude=72.452314 where fleet_id=7 and latitude is null and longitude is null;"

