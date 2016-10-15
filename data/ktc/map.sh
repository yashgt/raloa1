sed -n -e '2,$ s/^\([[:digit:]][[:digit:]]*\),\([[:digit:]][[:digit:]]*\)\(.*\)/\1-\2-1/p' routes.csv > map.csv
sed -n -e '2,$s/^\([[:digit:]][[:digit:]]*\),[0-9]*,\([[:digit:]][[:digit:]]*\)\(.*\)/\1-\2-2/p' routes.csv  >> map.csv
sed -n -e '2,$s/^\([[:digit:]][[:digit:]]*\),[0-9]*,[0-9]*,\([[:digit:]][[:digit:]]*\)\(.*\)/\1-\2-3/p' routes.csv  >> map.csv
sed -n -e '2,$s/^\([[:digit:]][[:digit:]]*\),[0-9]*,[0-9]*,[0-9]*,\([[:digit:]][[:digit:]]*\)\(.*\)/\1-\2-4/p' routes.csv  >> map.csv
# | sed -n 's/\([[:digit:]]*\)-\([[:digit:]]*\).*/insert into routemap values(\1,\2);/p'

cat map.csv