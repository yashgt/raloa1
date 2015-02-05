GRAPH_DIR := /var/otp/graphs
GTFS_DIR := /var/otp/gtfs
OTP_DIR := ${HOME}/OpenTripPlanner

#$(GRAPH_DIR)/goa/Graph.obj: $(GTFS_DIR)/ktcl_goa.zip $(GTFS_DIR)/river_nav_goa.zip
$(GRAPH_DIR)/goa/Graph.obj: 
	java -Xmx2G -jar target/otp.jar --build $(GTFS_DIR)/goa
	mv $(GTFS_DIR)/goa/Graph.obj $(@)

start_otp:
	java -Xmx512M -jar $(OTP_DIR)/target/otp.jar --server -p 9090 --securePort 9091 -r goa -g $(GRAPH_DIR) & 
	echo $!
