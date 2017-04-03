wget https://repo1.maven.org/maven2/org/opentripplanner/otp/1.1.0/otp-1.1.0-shaded.jar
#wget http://maven.conveyal.com.s3.amazonaws.com/org/opentripplanner/otp/0.20.0-SNAPSHOT/otp-0.20.0-20160422.165451-50-shaded.jar

#sudo yum update
#sudo yum install tomcat6 maven2 subversion default-jdk wget iptables tomcat6-examples tomcat6-admin
#sudo yum install git
#
#git clone git://github.com/opentripplanner/OpenTripPlanner.git
#cd OpenTripPlanner
##git checkout stable
#sudo wget http://repos.fedorapeople.org/repos/dchen/apache-maven/epel-apache-maven.repo -O /etc/yum.repos.d/epel-apache-maven.repo
#sudo sed -i s/\$releasever/6/g /etc/yum.repos.d/epel-apache-maven.repo
#sudo yum install -y apache-maven
#mvn –version
#
#wget http://maven.conveyal.com/org/processing/core/1.0.7/core-1.0.7.pom
#wget http://maven.conveyal.com/org/processing/core/1.0.7/core-1.0.7.jar
#wget http://maven.conveyal.com/crosby/binary/osmpbf/1.2.1/osmpbf-1.2.1.jar
#wget http://maven.conveyal.com/crosby/binary/osmpbf/1.2.1/osmpbf-1.2.1.pom
#sudo mvn install:install-file -Dfile=core-1.0.7.jar -DpomFile=core-1.0.7.pom
#sudo mvn install:install-file -Dfile=osmpbf-1.2.1.jar -DpomFile=osmpbf-1.2.1.pom
#
#sudo mvn clean package
#
#mkdir -p pdx
#cd pdx
#wget "http://developer.trimet.org/schedule/gtfs.zip" -O trimet.gtfs.zip
