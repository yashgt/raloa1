#cat a.csv | sed -n -e '/,[A-Z]\+$/p' | grep -i "Bus terminus" | sed "s/.*/call save_stop( @id , '\2' , '\3' , lat  , lon , in_fleet_id  , in_peer_stop_id , in_user_id )/g"

rm latlong.sql

for i in *.xlsx
do
	j=`echo $i | cut -d'.' -f1`
	echo "Importing from ${j}"
	echo "/* Stops provided by ${j} */" >> latlong.sql
	xlsx2csv -s 1 "${i}" | sed -n -e '/,[A-Z]\+,*$/p' | grep -i "^[^,]*,${j}" | grep -i "Bus terminus" | sed "s/^\([^,]*,\)\{2\}\([^,]*\),[^,]*,\([^,]*\),\([^,]*\),.*,\([A-Z]\+\),*$/set @id=0; call save_stop(@id, '\2', '\5', \3,\4, 7, null, 3);/" >> latlong.sql
done

for i in *.xls
do
	j=`echo $i | cut -d'.' -f1`
	echo "Importing from ${j}"
	echo "/* Stops provided by ${j} */" >> latlong.sql
	xls2csv -x "${i}" -c a.csv 
	cat a.csv | sed -n -e '/,[A-Z]\+,*$/p' | grep -i "^[^,]*,${j}" | grep -i "Bus terminus" | sed "s/\([^,]*,\)\{2\}\"\{0,1\}\([^,\"]*\)\"\{0,1\},[^,]*,\([^,]*\),\([^,]*\),.*,\([A-Z]\+\),*$/set @id=0; call save_stop(@id, '\2', '\5', \3,\4, 7, null, 3);/" >> latlong.sql
done

