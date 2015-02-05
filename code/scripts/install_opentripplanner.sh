sudo apt-get update
sudo apt-get install tomcat6 maven2 subversion default-jdk wget iptables tomcat6-examples tomcat6-admin
sudo apt-get install git

git clone git://github.com/opentripplanner/OpenTripPlanner.git
cd OpenTripPlanner
#git checkout stable
sudo mvn clean package

mkdir -p pdx
cd pdx
wget "http://developer.trimet.org/schedule/gtfs.zip" -O trimet.gtfs.zip
