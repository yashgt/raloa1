#mysql --user=root --password=goatrans <test.sql | tr '\t' ',' > text.txt
set opts=--user=root --password=goatrans --database=goatrans
mysql $opts < stops.sql | tr '\t' ',' > stops.txt
mysql $opts < routes.sql | tr '\t' ',' > routes.txt
mysql $opts < trips.sql | tr '\t' ',' > trips.txt
mysql $opts < stop_times.sql | tr '\t' ',' > stop_times.txt

