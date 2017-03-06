#cat a.csv | sed -n -e '/,[A-Z]\+$/p' | grep -i "Bus terminus" | sed "s/.*/call save_stop( @id , '\2' , '\3' , lat  , lon , in_fleet_id  , in_peer_stop_id , in_user_id )/g"

rm latlong.sql

for i in ./*.xlsx
do
	echo "Importing from ${i}"
	xlsx2csv -s 1 "${i}" | sed -n -e '/,[A-Z]\+$/p' | grep -i "Bus terminus" | sed "s/^\([^,]*,\)\{2\}\([^,]*\),[^,]*,\([^,]*\),\([^,]*\),.*,\([A-Z]\+\)$/set @id=0; call save_stop(@id, '\2', '\5', \3,\4, 7, null, 3);/" >> latlong.sql
done

for i in ./*.xls
do
	echo "Importing from ${i}"
	xls2csv -x "${i}" -c a.csv 
	cat a.csv | sed -n -e '/,[A-Z]\+$/p' | grep -i "Bus terminus" | sed "s/^[0-9]\+\([^,]*,\)\{2\}\"\{0,1\}\([^,\"]*\)\"\{0,1\},[^,]*,\([^,]*\),\([^,]*\),.*,\([A-Z]\+\)$/set @id=0; call save_stop(@id, '\2', '\5', \3,\4, 7, null, 3);/" >> latlong.sql
done

