sed -n -e '2,$s/^\([[:digit:]][[:digit:]]*\),[0-9]*,[0-9]*,[0-9]*,\([[:digit:]][[:digit:]]*\).*/insert into internal_route_map(route_id,internal_route_cd) values(\2,"pnj\1");/p' routes.csv  > map.sql
sed -n -e '2,$s/^.*,\([[:digit:]][[:digit:]]*\),[0-9]*,[0-9]*,\([[:digit:]][[:digit:]]*\).*/insert into internal_route_map(route_id,internal_route_cd) values(\2,"mrg\1");/p' routes.csv  >> map.sql
sed -n -e '2,$s/^.*,.*,\([[:digit:]][[:digit:]]*\),[0-9]*,\([[:digit:]][[:digit:]]*\).*/insert into internal_route_map(route_id,internal_route_cd) values(\2,"vsg\1");/p' routes.csv  >> map.sql
sed -n -e '2,$s/^.*,.*,.*,\([[:digit:]][[:digit:]]*\),\([[:digit:]][[:digit:]]*\).*/insert into internal_route_map(route_id, internal_route_cd) values(\2,"prv\1");/p' routes.csv  >> map.sql

echo "create table etmtoload(etmroute varchar(25));" >> map.sql
#N/A=Not given a TARA ID
#Y=Include
sed -n -e '2,$s/^\([a-z0-9]*\),.*,.*,.*,.*,.*,.*,.*,.*,.N\/A,Y,.*/insert into etmtoload(etmroute) values("\1");/p' etmtoload.csv >> map.sql

#sed -n -e '2,$ s/^\([[:digit:]][[:digit:]]*\),\([[:digit:]][[:digit:]]*\)\(.*\)/\1-\2-pnj/p' routes.csv > map.csv
#sed -n -e '2,$s/^\([[:digit:]][[:digit:]]*\),[0-9]*,\([[:digit:]][[:digit:]]*\)\(.*\)/\1-\2-mrg/p' routes.csv  >> map.csv
#sed -n "s/\([[:digit:]]*\)-\([[:digit:]]*\)-\([[:alnum:]]*\)/insert into internal_route_map values(\1,'\3\2');/p" map.csv

