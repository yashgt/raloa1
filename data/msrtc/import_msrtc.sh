MYOPTS="--host=${DBHOST} --user=root --password=goatransport"

mysql ${MYOPTS} -D raloa2 < delete.sql
mysql ${MYOPTS} -D raloa2 < data/data/latlong/latlong.sql

#mysql ${MYOPTS} -D raloa2 --force < tripsummary.sql
mysql ${MYOPTS} -D raloa2 < import_msrtc.sql

