set basedir=C:\mydata\Projects\NewYug\raloa1\data\ktc\feednow
cd %basedir%
REM more +1 fare_rules_2.txt >> fare_rules.txt
tail -n +2 fare_rules_2.txt >> fare_rules.txt
del fare_rules_2.txt
tar -acf gtfs.zip *.txt
java -jar C:\mydata\UTILS\gtfs-validator-4.2.0-cli.jar -i %basedir%\gtfs.zip -o %HOMEPATH%