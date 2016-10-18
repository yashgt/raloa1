sed -n -e '2,$ s/^\([[:digit:]][[:digit:]]*\),\([[:digit:]][[:digit:]]*\)\(.*\)/\1-\2-pnj/p' routes.csv > map.csv
sed -n -e '2,$s/^\([[:digit:]][[:digit:]]*\),[0-9]*,\([[:digit:]][[:digit:]]*\)\(.*\)/\1-\2-mrg/p' routes.csv  >> map.csv
sed -n -e '2,$s/^\([[:digit:]][[:digit:]]*\),[0-9]*,[0-9]*,\([[:digit:]][[:digit:]]*\)\(.*\)/\1-\2-vsg/p' routes.csv  >> map.csv
sed -n -e '2,$s/^\([[:digit:]][[:digit:]]*\),[0-9]*,[0-9]*,[0-9]*,\([[:digit:]][[:digit:]]*\)\(.*\)/\1-\2-prv/p' routes.csv  >> map.csv
sed -n "s/\([[:digit:]]*\)-\([[:digit:]]*\)-\([[:alnum:]]*\)/insert into internal_route_map values(\1,'\3\2');/p" map.csv

