host=ny-prod-db.cvoo5nr5votw.ap-southeast-1.rds.amazonaws.com
user=root
pwd=goatransport
mysql --host=${host} --user=${user} --password=${pwd} < tables.sql
mysql --host=${host} --user=${user} --password=${pwd} --database=avishkar < procs.sql
mysql --host=${host} --user=${user} --password=${pwd} --database=avishkar < tempdata.sql

