sftp -P 19321 feeds-kwwxw0@partnerupload.google.com <<EOF
	put ${1}
	bye
EOF
