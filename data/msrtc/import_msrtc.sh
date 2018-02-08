MYOPTS="--host=${DBHOST} --user=root --password=goatransport"

mysql ${MYOPTS} -D raloa2 < delete.sql
mysql ${MYOPTS} -D raloa2 < data/data/latlong/latlong.sql
mysql ${MYOPTS} -D raloa2 -e "update stop set location_status=1 where fleet_id=7;"

mysql ${MYOPTS} -D raloa2 < import_msrtc.sql

mysql ${MYOPTS} -D raloa2 --force < tripsummary.sql
