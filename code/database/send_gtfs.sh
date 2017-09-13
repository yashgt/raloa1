fleet_id=${1}

gtfs_file=gtfs_${fleet_id}.zip
case ${fleet_id} in 
	"3") sftuser="feeds-kwwxw0"
	;;
	"7") sftuser="feeds-9xz93o"
	;;
	"8") sftuser="feeds-881m87"
	;;
esac
sftp_batch=batch_${fleet_id}.sftp
echo "Sending ${gtfs_file} to ${sftuser} using ${sftp_batch}"
cat <<EOF > ${sftp_batch}
	put ${gtfs_file}
	bye
EOF
cat batch_${fleet_id}.sftp

sftp -vvv -b ${sftp_batch} -i ny-prod.pem -P 19321 ${sftuser}@partnerupload.google.com 
