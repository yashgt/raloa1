function initializeApp($rootScope) {
    //Initialize the app
}

tempId = 2; //temporary
var STOP_ICON = "/images/bus_stop.png";
var DEL_STOP_ICON = "/images/del_bus_stop.jpg";
var PEER_STOP_ICON = "/images/peer_bus_stop.png";
var ROUTE_STOP_ICON = "/images/route_bus_stop.png";
var ROUTE_STOP_REV_ICON = "/images/route_bus_stop.png";
var ACTIVE_STOP_ICON = "/images/bus_stop.png";
var LINKABLE_STOP_ICON = "/images/bus_stop.png";

var HOST = window.location.protocol + "//" + window.location.host;
console.log(HOST);

function RouteController($scope, $log, getthereAdminService, stopChannel, locationChannel, routeHelpChannel
    //, messageCenterService
    , flash, GoogleMapApi, IsReady, uiGridConstants) {


    $scope.fleet = {
        selected: undefined
    };
	
	$scope.$watch('routeDetail', function(newVal, oldVal, scope){		
		if(newVal!=undefined && newVal.routeId!=-1){	//Either new route or existing route is getting changed
			if(oldVal!=undefined && oldVal.routeId!=newVal.routeId) {
				scope.isRouteDirty = false;
			}
			else{
				scope.isRouteDirty = true;
			}
		}
	}, true);

    $scope.$watch('fleet.selected', function(newValue, oldValue) {
        if ((newValue !== oldValue)) {
            //$( "input[name='stopName']" ).focus();
            $scope.fleetChosen(newValue);
        }
    });

    $scope.hangOn = {
        promise: null,
        message: "Please wait",
        backdrop: true,
        delay: 0,
        minDuration: 0
    }

    stopChannel.add(function(stopDetail) { //Invoked by DI when a Stop is defined
        //$scope.stopDetail.stopName = stopDetail.name;

        $scope.stopDetail.name = stopDetail.name;
        //$scope.stopDetail.id = -1;
        console.log("Saving stop %j", $scope.stopDetail);

        $scope.saveStop($scope.stopDetail);
    });


    $scope.newStage = {
        title: ""
    };



    $scope.fleetDetail = {
	
        center: {
            latitude: 0,
            longitude: 0
        },
        zoom: 12,
        bounds: {
            northeast: {
                latitude: 15.855126,
                longitude: 74.421425
            },
            southwest: {
                latitude: 14.867264,
                longitude: 73.622169
            }
        },
        stops: [],
        routes: [1]
		
    };
    addStopWindow = function(latLng) {

        //$scope.map.infoWindow.coords = {latitude:latLng.lat(), longitude:latLng.lng()};

        //TODO
		
        
		$scope.stopDetail = locationChannel.stopDetail = {
            id: 0,
            latitude: latLng.lat(),
            longitude: latLng.lng(),
            name: "",
            address: ""
        };
		/*
        locationChannel.publishLocation({
            latitude: latLng.lat(),
            longitude: latLng.lng()
        });
		*/
       
		$scope.map.infoWindow.show = true;

    };

	editStop = function(stop) {
		console.log("Editing stop " + JSON.stringify(stop));
		$scope.stopDetail = locationChannel.stopDetail = stop;
		$scope.map.infoWindow.show = true;
	};
    deleteStop = function(stopDetail) {
        
		var r = confirm("Are you sure you want to delete stop " + stop.name + "?");
		if (r == true) {
			$log.debug("Deleting stop " + JSON.stringify(stop));
			getthereAdminService.deleteStop(stopDetail.id, function(stop) {
				removeFromStops(stop);					
			});
		} else {			
		}
    };
    linkStop = function(stop) {

        console.log("Linking stop %j", stop);

        //User to click on a stop on the opposite side of the road
        //$scope.$apply(function(){
        var peerStop = jQuery.extend({}, stop);
        peerStop.id = -stop.id;
        peerStop.icon = PEER_STOP_ICON;
        peerStop.peerStopId = stop.id;
		peerStop.options.draggable = true;

        console.log("Peer stop %j", peerStop);
        pushToStops(peerStop);
        //$scope.fleetDetail.stops.push(peerStop);
        //});
        //Let the stop show a different icon
        //Allow user to click another stop. Once done, the two stops are brothers of each other.
    };

    $scope.clearRoute = function() {
		$scope.forAllStops( function(rs){
			if (rs.onwardStop) rs.onwardStop.icon = STOP_ICON;
            if (rs.returnStop) rs.returnStop.icon = STOP_ICON;
		});
		
		/*
        if ($scope.routeDetail != undefined) {
            if ($scope.routeDetail.stages != undefined) {
                $scope.routeDetail.stages.forEach(function(stage) {
                    if (stage.stops != undefined) {
                        stage.stops.forEach(function(routestop) {
                            if (routestop.onwardStop) routestop.onwardStop.icon = STOP_ICON;
                            if (routestop.returnStop) routestop.returnStop.icon = STOP_ICON;
                            //stop.icon = STOP_ICON;
                        });
                    }
                });
            }
        }
		*/

        $scope.routeDetail = {
            routeId: -1,
            stages: [],
            trips: [
                [],
                []
            ]
        };
        $scope.isRouteDirty = false;
		routeHelpChannel.resetDisplay();
        $scope.clearScheduleGrid();
    };

    var enableStopDragging = function() {
        markers.forEach(function(marker) {
            marker.draggable = true;
        });

        $scope.fleetDetail.stops.forEach(function(stop) {
            stop.options.draggable = true;
        });
    };
    var disableStopDragging = function() {
        markers.forEach(function(marker) {
            marker.draggable = false;
        });

        $scope.fleetDetail.stops.forEach(function(stop) {
            stop.options.draggable = false;
        });
    };

    //Route creation region
    $scope.closeRoute = function() {

        $scope.clearRoute();
        enableStopDragging();

    };
    $scope.newRoute = function() {
        $scope.clearRoute();
        $scope.gridRoutesApi.selection.clearSelectedRows();
        $scope.routeDetail.routeId = 0;
        $scope.scheduleOptions[0].data = $scope.routeDetail.trips[0];
        $scope.scheduleOptions[1].data = $scope.routeDetail.trips[1];
        disableStopDragging();
    };


    $scope.extendRoute = function() {
        [0, 1].forEach(function(dir) {
            $scope.scheduleOptions[dir].data = $scope.routeDetail.trips[dir] = [];
        });
        $scope.routeDetail.routeId = 0;
		$scope.routeDetail.stages.forEach(function(stage) {
			stage.stageId = -1;
		});

        disableStopDragging();
    };

	$scope.forAllStopTimes = function(cb){
		[0,1].forEach(function(dir){
			$scope.routeDetail.trips[dir].forEach(function(trip){
				Object.keys(trip.stops).forEach(function(stopId){
					cb(trip,stopId);
				});
			});
		});
	};
	
	$scope.sanctifyRoute = function(){
				$scope.forAllStops(function(rs){
					rs.onwardStop = getActiveStopById(rs.onwardStop.id);
					rs.returnStop = getActiveStopById(rs.returnStop.id);
				});
				
				$scope.forAllStopTimes(function(trip, stopId){
					var tm = moment(trip.stops[''+ stopId], 'HH:mm');
					trip.stops[''+ stopId] = tm.format('hh:mm a');
				});
	};
	
    $scope.saveRoute = function() {
		var tripIncomplete = false;
		$scope.forAllStopTimes(function(trip, stopId){
			var stopTime = trip.stops[''+ stopId];
			if( stopTime == undefined || stopTime==''){
				tripIncomplete = true;
			}
		});
		if(tripIncomplete){
			flash.error = 'Some trips are incomplete';
			return ;
		}
		
		$scope.forAllStopTimes(function(trip, stopId){
			var tm = moment(trip.stops[''+ stopId], 'hh:mm a');
			trip.stops[''+ stopId] = tm.format('HH:mm');
		});
        $scope.hangOn.promise = getthereAdminService.saveRoute($scope.routeDetail, function(route) {

            flash.success = 'Route saved successully';
			
			if ($scope.routeDetail.routeId == 0) { //Check this before it is overwritten
                $scope.fleetDetail.routes.push(route);
                $scope.gridRoutesApi.selection.selectRow(route);
            }
			
			$scope.routeDetail = route;
            $scope.routeDetail.isDirty = false;
				
			$scope.sanctifyRoute();
			$scope.resetSchedules();


        }, function(error) {
            flash.error = 'Route could not be saved';
        });
    };
    //Route creation region ends

    $scope.getContextMenu = function(menuList) {

        var contextMenuOptions = {};
        contextMenuOptions.classNames = {
            menu: 'context_menu',
            menuSeparator: 'context_menu_separator'
        };


        //	create an array of ContextMenuItem objects
        //	an 'id' is defined for each of the four directions related items
        var menuItems = [];
        _.each(menuList, function(menuItem) {
            if (menuItem.condition == true || menuItem.condition == undefined) {
                menuItems.push(menuItem);
            }
        });

        contextMenuOptions.menuItems = menuItems;

        var contextMenu = new ContextMenu($scope.gmap, contextMenuOptions);

        
        //	listen for the ContextMenu 'menu_item_selected' event
        google.maps.event.addListener(contextMenu, 'menu_item_selected', function(latLng, eventName, model) {
            var item = _.find(menuItems, function(item) {
                return item.eventName == eventName;
            });
            $scope.$apply(function() {
                if (model == undefined) {
                    item.handler(latLng);
                } else {
                    item.handler(model);
                }
            });
        });

        return contextMenu;
    }; //getContextMenu
    $scope.setContextMenu = function() {
        //All map-level menu items should be put here
        $scope.contextMenu = $scope.getContextMenu([{
            className: 'context_menu_item',
            eventName: 'add_stop',
            label: 'Add stop',
            handler: addStopWindow
        }]);

        //All marker-level menu items should be put here		
        $scope.stopContextMenu = $scope.getContextMenu([{
            className: 'context_menu_item',
            eventName: 'delete_stop',
            label: 'Delete stop',
            handler: deleteStop
        }, {
            className: 'context_menu_item',
            eventName: 'link_stop',
            label: 'Link stop',
            handler: linkStop
        }, {
            className: 'context_menu_item',
            eventName: 'edit_stop',
            label: 'Edit stop',
            handler: editStop
        }]);

    };

    IsReady.promise().then(function(maps) {
        $scope.gmap = $scope.map.control.getGMap();
        markerclusterer = new MarkerClusterer($scope.gmap, [], mcOptions);

        $scope.stopLayer.setMap($scope.gmap);
        $scope.myParser = new geoXML3.parser({
            map: $scope.gmap,
            suppressInfoWindows: true,
            afterParse: useTheData,
            createMarker: createMarker
        });


        routeHelpChannel.gmap = $scope.gmap;
        $log.debug("GMap ready");

        //$scope.showStops();


        $scope.setContextMenu();
    });

    $scope.mapEvents = {
        rightclick: function(gMap, eventName, model) {
            if (model.$id) {
                model = model.coords; //use scope portion then
            }
            $scope.contextMenu.show(model["0"].latLng);
            //alert("Model: event:" + eventName + " " + JSON.stringify(model));
        }

    };
    $scope.markerOptions = {
        draggable: true,
        title: 'Label1'
    };
    var scnt = 0;

    function binarySearch(array, key) {
        var lo = 0,
            hi = array.length - 1,
            mid,
            element;
        while (lo <= hi) {
            mid = ((lo + hi) >> 1);
            element = array[mid];
            if (element.id < key) {
                lo = mid + 1;
            } else if (element.id > key) {
                hi = mid - 1;
            } else {
                return array[mid];
            }
        }
        return undefined;
    }

    $scope.showStops = function() {
		if(!$scope.gmap)
			return;
        markers = [];
		
		markerclusterer.clearMarkers();

        if ($scope.fleetDetail && $scope.fleetDetail.fleetId) {
            
            var kmlURL = HOST + '/api/kml/' + $scope.fleetDetail.fleetId;

            if ($scope.myParser.docs[0]) {
                $scope.myParser.hideDocument($scope.myParser.docs[0]);

            }

            //if($scope.myParser.docsBy
            $scope.myParser.parse(kmlURL);
        }


        /*
			//For some strange reason, creating markers from objects makes it slow. 
			if($scope.fleetDetail && $scope.fleetDetail.allstops){
			            $scope.fleetDetail.allstops.forEach(function(stop) {
		
				var markerOptions = {
      optimized: false,
      position: new google.maps.LatLng(stop.latitude,stop.longitude)
      ,map: $scope.gmap
	  , model: stop
    };
				addMarker(markerOptions);
            });
			}
			*/

    };

	$scope.removeStage = function(stage){
		//$scope.routeDetail.stages.splice(
		//TODO
	};
	
    $scope.addStopToStage = function(fleetstop, routestage) {
        var returnstop;

        if (fleetstop.peerStopId) {
            //returnstop = _.find($scope.fleetDetail.stops, function(returnstop) { return returnstop.id == fleetstop.peerStopId; });
            returnstop = binarySearch($scope.fleetDetail.stops, fleetstop.peerStopId) || fleetstop;

        } else {
            returnstop = fleetstop;
        }

        $scope.addStopsToStage(fleetstop, returnstop, routestage);

    };

    $scope.addStopsToStage = function(onwardStop, returnStop, stage) {
        var routeStop = {};
        if (onwardStop != undefined) {
            onwardStop.icon = ROUTE_STOP_ICON;
            $scope.addStopToScheduleGrid(0, onwardStop);
        }
        if (returnStop != undefined) {
            returnStop.icon = ROUTE_STOP_ICON;
            $scope.addStopToScheduleGrid(1, returnStop);
        }

        routeStop.onwardStop = onwardStop;
        routeStop.returnStop = returnStop;
        console.log("Adding %j %j to stage %j", onwardStop, returnStop, stage);
        stage.stops.push(routeStop);
        return routeStop;
    };

    //SCHEDULE REGION
    $scope.clearScheduleGrid = function() {
        [0, 1].forEach(function(dir) {
            $scope.scheduleOptions[dir].columnDefs.splice($scope.scheduleOptions[dir].fixedCols, 100);
			$scope.scheduleOptions[dir].selectedRows = [];
        });

    };
    $scope.addStopToScheduleGrid = function(dir, fleetstop) {
        var def = {
            name: fleetstop.name
            ,displayName: fleetstop.name
            ,field: "stops." + fleetstop.id
			,type: 'string'
            ,enableCellEdit: true
            //,editableCellTemplate: "<div tooltip=\"" + fleetstop.name + "\"><form name=\"inputForm\"><input date-mask maxlength=\"8\" type=\"text\" ng-class=\"'colt' + col.uid\" ui-grid-editor ng-model=\"MODEL_COL_FIELD\"></form></div>"
			,editableCellTemplate:'templates/stoptime.html'			
			//,disableHiding: true
			//,enableSorting: true
			,headerCellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
				//if (row.entity.stops[''+ fleetstop.id] ==undefined ||  row.entity.stops[''+ fleetstop.id] == '' ) {
					return 'stop_name';
				//}
			}
			, minWidth: 80
			//, maxWidth: 40
			/*
			,cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
				if (row.entity.stops[''+ fleetstop.id] ==undefined ||  row.entity.stops[''+ fleetstop.id] == '' ) {
					return 'unsettime';
				}
			}
			*/
        };

        var idx = dir == 0 ? $scope.scheduleOptions[dir].columnDefs.length : $scope.scheduleOptions[dir].fixedCols;
		
		if($scope.scheduleOptions[dir].columnDefs.length == $scope.scheduleOptions[dir].fixedCols) //This is column for first stop
		{
			def.sort = { direction: uiGridConstants.ASC };
			def.pinnedLeft = true;
		}
		

        $scope.scheduleOptions[dir].columnDefs.splice(idx, 0, def);
    };
    $scope.delStopFromScheduleGrid = function(dir, stop) {
        var idx = _.findIndex($scope.scheduleOptions[dir].columnDefs, {
            field: "stops." + stop.id
        });
        $scope.scheduleOptions[dir].columnDefs.splice(idx, 1);
    };

	$scope.resetSchedules = function(){
		[0, 1].forEach(function(dir) {
                $scope.scheduleOptions[dir].data = $scope.routeDetail.trips[dir];
        });
	};
    $scope.getRoute = function(routeId) {
        getthereAdminService.getRoute(routeId, function(routeDetail) {
            $scope.routeDetail.routeId = routeId;

            $scope.clearScheduleGrid();

			var bounds = new google.maps.LatLngBounds(); 
            routeDetail.stages.forEach(function(stage) {

                var routestage = {
                    title: stage.title,
                    stageId: stage.stageId,
                    stops: []
                };
                $scope.routeDetail.stages.push(routestage);
                console.log("Adding ", routestage);

                stage.stops.forEach(function(routestop) {
                    var onwardStop = getActiveStopById(routestop.onwardStop.id);
					bounds.extend(new google.maps.LatLng(onwardStop.latitude, onwardStop.longitude));
                    var returnStop = getActiveStopById(routestop.returnStop.id);
					bounds.extend(new google.maps.LatLng(returnStop.latitude, returnStop.longitude));

                    var newroutestop = $scope.addStopsToStage(onwardStop, returnStop, routestage);
                    newroutestop.segments = [routestop.onwardStop.distance, routestop.returnStop.distance];
                });


            });
			$scope.fleetDetail.bounds = {
                northeast: {
                    latitude: bounds.getNorthEast().lat(),
                    longitude: bounds.getNorthEast().lng()
                },
                southwest: {
                    latitude: bounds.getSouthWest().lat(),
                    longitude: bounds.getSouthWest().lng()
                }
            };
			
            $scope.routeDetail.trips = routeDetail.trips;
			
			$scope.forAllStopTimes(function(trip, stopId){
					var tm = moment(trip.stops[''+ stopId], 'HH:mm');
					trip.stops[''+ stopId] = tm.format('hh:mm a');
			});
			
			$scope.resetSchedules();
			$scope.routeDetail.deletedTrips = [];
            //$scope.scheduleOptions.data = $scope.routeDetail.trips;
			var firstStop = $scope.routeDetail.stages[0].stops[0].onwardStop
			var lastStop = (_.last((_.last($scope.routeDetail.stages)).stops)).onwardStop;
			var allStops = [];
			$scope.forAllStops(function(rs){ allStops.push(rs); });
			var wayPoints = _.sample(allStops,8).map(function(rs){ return rs.onwardStop;});
			//var wayPoints = allStops.map(function(rs){ return rs.onwardStop;});
			//var wayPoints = [];
			routeHelpChannel.showRoute(firstStop,lastStop, wayPoints); 
			
			$scope.isRouteDirty = false;

        });
    };

    $scope.forAllStops = function(cb) {
		if($scope.routeDetail && $scope.routeDetail.stages){
        $scope.routeDetail.stages.forEach(function(stage) {
            stage.stops.forEach(cb);
        });
		}
    };
	
	$scope.areSegmentsReady = function(){
		var ready = true;
		$scope.forAllStops(function(rs){
			if(rs.segments[0] ==0 && rs.segments[1]==0){
				ready = false;
			}
		});
		return ready;
	};
	
	$scope.isFirstStopTimeSet = function(dir){
		if($scope.routeDetail && $scope.routeDetail.stages.length > 0){
		var fsid = dir==0 ? (_.first((_.first($scope.routeDetail.stages)).stops)).onwardStop.id : (_.last(_.last($scope.routeDetail.stages)).stops).returnStop.id ;
		var x = _.findIndex($scope.scheduleOptions[dir].selectedRows, function(row){ 
				return row.entity.stops[''+fsid] == ""; 
			});
			return x==undefined ;	
		}
		else{
			return false;
		}
	};

    $scope.findRouteStop = function(cb) {
        var rs;
        _.find($scope.routeDetail.stages, function(stage) {
            var rst = _.find(stage.stops, cb);
            rs = rst;
            return rst != undefined;
        });
        return rs;
    };

	$scope.showData = function(){
		console.log(JSON.stringify($scope.fleetDetail));
	};
    $scope.addTrip = function(dir) {
        console.log($scope);
        console.log(_);
        var latestTrip = _.min($scope.routeDetail.trips[dir], function(trip) {
            return trip.tripId;
        });

        var newTrip = {
            tripId: (latestTrip.tripId < 0) ? latestTrip.tripId - 1 : -1,
			fleetId:$scope.fleetDetail.fleetId,
            direction: dir,
            serviceId: $scope.fleetDetail.defaultServiceId,
            frequencyTrip: false,
            frequencyStartTime: '00:00',
            frequencyEndTime: '00:00',
			frequency_gap : '00:00',
            stops: {}
        };

        $scope.forAllStops(function(routestop) {
            newTrip.stops['' + ((dir == 0) ? routestop.onwardStop.id : routestop.returnStop.id) + ''] = '';
        });

        /*
		$scope.routeDetail.stages.forEach(function(stage) {
                stage.stops.forEach(function(stop) {
					newTrip.stops[''+stop.id+''] = '08:00';
                });
        });
		*/


        $scope.routeDetail.trips[dir].push(newTrip);
		//$scope.scheduleOptions[dir].gridApi.core.notifyDataChange( grid, uiGridConstants.dataChange.EDIT )
        $scope.routeDetail.isDirty = true;
    };

	
	$scope.deleteTrips= function(dir) {
		$scope.scheduleOptions[dir].selectedRows.forEach(function(row){
				var trip = row.entity;
				console.log(trip);
				var idx = _.findIndex($scope.routeDetail.trips[dir], {
					tripId: trip.tripId
				});
				var delTrips = $scope.routeDetail.trips[dir].splice(idx, 1);
				delTrips.forEach(function(trip){
					$scope.routeDetail.deletedTrips.push(trip);
				});
				$scope.routeDetail.isDirty = true;
		});
		$scope.scheduleOptions[dir].selectedRows = [];
    };
	$scope.autocompleteTrips= function(dir){
		$scope.scheduleOptions[dir].selectedRows.forEach(function(row){
			var trip = row.entity;
			var i = 0;
            var allstops = [];
            var allsegments = [];

            $scope.forAllStops(function(routestop) {
                allstops.push((dir == 0) ? routestop.onwardStop : routestop.returnStop);
                allsegments.push(routestop.segments[dir]);
            });
			
            if (dir == 1) {
                allstops.reverse();
                allsegments.reverse();
            }
			
            for (i = 0; i < allstops.length; i++) {
                if (i != 0 && allsegments[i]>=0) {
                    //var prevtime = Date.parse(trip.stops[''+ allstops[i-1].id]) ;
                    var prevtime = moment(trip.stops['' + allstops[i-1].id], 'hh:mm a');
                    // 30*1000 m in 60 min
                    // distance in X
                    var inctime = allsegments[i] * 60 / 30000;
                    trip.stops['' + allstops[i].id] = prevtime.add(inctime, 'm').format('hh:mm a');
                }
            }
			$scope.routeDetail.isDirty = true;
		});
		$scope.scheduleOptions[dir].gridApi.selection.clearSelectedRows(null);
		$scope.scheduleOptions[dir].selectedRows = [];
	};

	var isTripEditable = function($scoperow){
		//use $scope.row.entity and $scope.col.colDef to determine if editing is allowed
		return $scoperow.row.entity.fleetId==$scope.fleetDetail.fleetId;
	};
	
	var tripOwnerShipClass = "\"{\'myTrip\': grid.appScope.fleetDetail.fleetId==row.entity.fleetId}\"";
    $scope.scheduleOptions = [];
    [0, 1].forEach(function(dir) {
        $scope.scheduleOptions.splice(dir, 0, {
            enableSorting: false,
            enableCellEdit: true,
			cellEditableCondition: isTripEditable, 
			enableCellEditOnFocus : true,
            enableColumnMenus: false,
			enableSelectAll: true,
			enableRowHeaderSelection: true,
			enableScrollbars: true,
			multiSelect : true,
			minRowsToShow : 2,
			maxRowsToShow : 10,
			enableSelectionBatchEvent: true,
			onRegisterApi: function(gridApi){
      //set gridApi on scope
			$scope.scheduleOptions[dir].gridApi = gridApi;
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
			if(row.isSelected) {
				$scope.scheduleOptions[dir].selectedRows.push(row);
			}
			else{
				_.pull($scope.scheduleOptions[dir].selectedRows,row);
			}
      });
	  
		 gridApi.edit.on.afterCellEdit( $scope, function( rowEntity, colDef ) {
			rowEntity.isDirty = true;
			$scope.routeDetail.isDirty = true;
		 });
	  
		},
            columnDefs: [
			
			{
                name: 'ID',
                field: 'tripId',
                enableCellEdit: false,
                cellTemplate: '<div>{{ (row.entity.tripId<0)? "NEW" : "" + row.entity.tripId  }}</div>'
				,disableColumnMenu: true
				,enableColumnResizing:false
				,maxWidth:50
				,cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
          if (row.entity.tripId < 0 ) {
            return 'newtrip';
          }
        }
            }, {
                editableCellTemplate: 'ui-grid/dropdownEditor',
                name: 'Service',
                field: 'serviceId',
                cellFilter: 'service',
                editDropdownIdLabel: 'serviceId',
                editDropdownValueLabel: 'serviceName',
                editDropdownOptionsArray: []
				,disableColumnMenu: true
				,minWidth:80
            }, {
                name: 'isFrequency',
                displayName: 'Freq?',
                field: 'frequencyTrip',
                type: 'boolean'				
				,disableColumnMenu: true
				,minWidth:20
            }, {
                name: 'frequencyStart',
                displayName: 'Frequency St.',
                field: 'frequencyStartTime'
				,minWidth:80
				
            }, {
                name: 'frequencyEnd',
                displayName: 'Frequency En.',
                field: 'frequencyEndTime'
                //,pinnedLeft: true
				,disableColumnMenu: true
				,minWidth:80
            }, {
                name: 'frequencyGap',
                displayName: 'Frequency interval',
                field: 'frequencyGap'				
				,minWidth:80
            }]
        });
		$scope.scheduleOptions[dir].rowTemplate = 'templates/schedRow.html' 
		$scope.scheduleOptions[dir].selectedRows = [];
        $scope.scheduleOptions[dir].fixedCols = $scope.scheduleOptions[dir].columnDefs.length;
		$scope.scheduleOptions[dir].options = { stopCols : []};
    });

    //SCHEDULE REGION ENDS

    //FARE REGION
    $scope.showFares = function() {
        $scope.fareGridOptions.columnDefs.splice(1, 100);
        $scope.routeDetail.stages.forEach(function(stage) {
            var stageCol = {
                name: '' + stage.stageId,
                displayName: stage.title,
                field: 'stages.' + stage.stageId
            };
            $scope.fareGridOptions.columnDefs.push(stageCol);
        });
        $scope.fareGridOptions.data = $scope.routeDetail.stages;
    };
    $scope.fareGridOptions = {
        enableSorting: false,
        enableCellEdit: true,
        enableColumnMenus: false,
        columnDefs: [{
            name: 'title',
            displayName: 'Source',
            field: 'title'
        }]
    }
    //FARE REGION ENDS

    $scope.stopLayer = new google.maps.KmlLayer({});


    google.maps.event.addListener($scope.stopLayer, 'status_changed', function() {
        console.log("Layer is now " + $scope.stopLayer.getStatus());
    });



    //ROUTELIST REGION

    $scope.routeListOptions = {
        enableSorting: true,
        enableCellEdit: false,
        enableColumnMenus: false,
        enableFiltering: true,
		enableScrollBars: true,
        enableRowHeaderSelection: false,
		enableColumnResizing: true,
        multiSelect: false,
        columnDefs: [{
            name: 'No.',
            field: 'routeNum'
			, cellClass: 'routeNum'
			, cellTooltip: true
			, minWidth: 40
			, maxWidth: 40
        }, {
            name: 'From',
            field: 'st'
			,cellClass: 'stopName'
			, cellTooltip: true
			//,celltemplate: 'templates/routelistStopName.html'
			//,cellTemplate: '<div class="stopName" ng-class="{\'svcd_route\':row.entity.serviced,  \'unsvcd_route\':!row.entity.serviced}" title="{{ row.entity.st }}">{{ row.entity.st }}</div>'
        }, {
            name: 'To',
            field: 'en'
			,cellClass: 'stopName'
			, cellTooltip: true
			//,cellTemplate: '<div class="stopName" ng-class="{\'svcd_route\':row.entity.serviced,  \'unsvcd_route\':!row.entity.serviced}" title="{{ row.entity.en }}">{{ row.entity.en }}</div>'
        }]
		//,rowTemplate: '<div ng-class="{\'svcd_route\':row.entity.serviced,  \'unsvcd_route\':!row.entity.serviced}"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>'
		//,rowTemplate: '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>'
		/*
		,rowTemplate: '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell ">' +
                           '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }"> </div>' +
                           '<div ng-cell></div>' +
                     '</div>'
					 */
		, rowTemplate: 'templates/routeRow.html' 
        ,onRegisterApi: function(gridApi) {
            $scope.gridRoutesApi = gridApi;

            gridApi.selection.on.rowSelectionChanged($scope, function(row) {
                console.log(row);
                $scope.clearRoute();
                if (row.isSelected) {
                    $scope.getRoute(row.entity.routeId);
                }

            });
        }
    };


    //ROUTELIST REGION ENDS

    //CALENDAR REGION
    $scope.saveCalendar = function(rowEntity) {

        $scope.gridCalendarApi.rowEdit.setSavePromise($scope.gridCalendarApi.grid, rowEntity, getthereAdminService.saveCalendar(rowEntity));

    };
    $scope.calendarOptions = {
        enableSorting: false,
        enableCellEdit: true,
        enableColumnMenus: false,
        columnDefs: [{
            name: 'Name',
            field: 'serviceName'
        }, {
            name: 'Monday',
            field: 'mon',
            type: 'boolean'
        }, {
            name: 'Tuesday',
            field: 'tue',
            type: 'boolean'
        }, {
            name: 'Wednesday',
            field: 'wed',
            type: 'boolean'
        }, {
            name: 'Thursday',
            field: 'thu',
            type: 'boolean'
        }, {
            name: 'Friday',
            field: 'fri',
            type: 'boolean'
        }, {
            name: 'Saturday',
            field: 'sat',
            type: 'boolean'
        }, {
            name: 'Sunday',
            field: 'sun',
            type: 'boolean'
        }, {
            name: 'From',
            field: 'startDate',
            type: 'date',
            cellFilter: 'date:"yyyy-MM-dd"'
        }, {
            name: 'To',
            field: 'endDate',
            type: 'date',
            cellFilter: 'date:"yyyy-MM-dd"'
        }],
        onRegisterApi: function(gridApi) {
            //set gridApi on scope
            $scope.gridCalendarApi = gridApi;
            gridApi.rowEdit.on.saveRow($scope, $scope.saveCalendar);
        }
    };

    //CALENDAR REGION ENDS
    $scope.addStopToRoute = function(stop) {
        if ($scope.routeDetail.routeId >= 0) {
            $scope.routeDetail.isDirty = true;

            //If this stop's peer is already an onward stop, add this stop as the return stop
            if (stop.peerStopId > 0) {
                var routestop = $scope.findRouteStop(function(rs) {
                    return rs.onwardStop.id == stop.peerStopId;
                });
                if (routestop) {
                    stop.icon = ROUTE_STOP_ICON;
                    routestop.returnStop = stop;
                    return;
                }
            }


            if ($scope.routeDetail.stages.length == 0) {
                $scope.addNewStage();
                //$scope.routeDetail.stages[$scope.routeDetail.stages.length -1].title = stop.name ; //TODO capture the village name
            }

            var lastStage = $scope.routeDetail.stages[$scope.routeDetail.stages.length - 1];
            $scope.addStopToStage(stop, lastStage);

        }
    };
    $scope.delStopFromRoute = function(stop) {
        if ($scope.routeDetail.routeId >= 0) {
            var stg = _.find($scope.routeDetail.stages, function(stage) {

                var rs = _.find(stage.stops, function(rs) {
                    return rs.onwardStop.id == stop.id || rs.returnStop.id == stop.id;
                });
                if (rs != undefined) {
                    $scope.delStopFromScheduleGrid(0, rs.onwardStop);
                    rs.onwardStop.icon = STOP_ICON;

                    $scope.delStopFromScheduleGrid(1, rs.returnStop);
                    rs.returnStop.icon = STOP_ICON;

                    stage.stops.splice(_.indexOf(stage.stops, rs), 1);
                    return true;
                }
                return false;
            });

            $scope.routeDetail.isDirty = true;
        }
    };



    $scope.stopEvents = {
        click: function(marker, eventName, stop) {
            var stg = _.find($scope.routeDetail.stages, function(stage) {
                //TODO need to rework for onward and return Stop
                var rs = _.find(stage.stops, function(rs) {
                    return rs.onwardStop.id == stop.id || rs.returnStop.id == stop.id;
                });
                return (rs != undefined);
                //return _.contains(stage.stops, model);
            });
            if (stg == undefined) { //The stop does not already exist in the route
                $scope.addStopToRoute(stop);
            } else {
                $scope.delStopFromRoute(stop);
            }
        },
        rightclick: function(marker, eventName, stop) {
            console.log("Event:" + eventName + " Marker:" + marker, stop.id);
            $scope.stopContextMenu.showOnMarker(marker.position, stop);

        },
        dragend: function(marker, eventName, stop) {
            $scope.saveStop(stop);
        }


    };
    $scope.configMap = function() {
        //$scope.gmap = $scope.map.control.getGMap() ;
        //		console.log("Map is ", $scope.map.control.getGMap());

        $scope.stageTreeOptions = {
            accept: function(sourceNode, destNodes, destIndex) {
                var srcType = sourceNode.$element.attr('data-type');
                var destType = destNodes.$element.attr('data-type');
				console.log("Source " + srcType + " Dest " + destType);
				
                return (srcType == "stop" && destType == "stage") || (srcType == "stage" && destType == "group")
				; // only accept stop in stage 
            },
            dropped: function(event) {
                console.log(event);
                $scope.routeDetail.isDirty = true;
            }
        };
        $scope.fleetChosen = function(fleet) {
            $log.debug('FleetChosen');
            getthereAdminService.setCurrentFleet(fleet, function(fleet) {
                $log.debug("Setting fleet ", fleet);
                $scope.getFleetDetail(fleet.fleetId);
            });

        };
        $scope.addNewStage = function() {
            var newObject = jQuery.extend({}, $scope.newStage);
            newObject.stops = [];
            if (newObject.title == "") {
                newObject.title = "New Stage";
            }
            var latestStage = _.min($scope.routeDetail.stages, function(stage) {
                return stage.stageId;
            });
            var stageId = -1;
            if (latestStage.stageId < 0) {
                stageId = latestStage.stageId - 1;
            }
            newObject.stageId = stageId;
            var stages = {};

            newObject.stages = stages;

/*
            //Add the new stage to all existing stages
            $scope.routeDetail.stages.forEach(function(stage) {
                stage.stages['' + newObject.stageId] = 0;
            });
*/
            //Add the new stage to the route
            $scope.routeDetail.stages.push(newObject);
			/*
            $scope.routeDetail.stages.forEach(function(stage) {
                stages['' + stage.stageId] = 0;
            });*/
			
            $scope.routeDetail.isDirty = true;
            $scope.newStage.title = "";

            var stageCol = {
                name: '' + newObject.stageId,
                displayName: newObject.title,
                field: 'stages.' + newObject.stageId
            };
            $scope.fareGridOptions.columnDefs.push(stageCol);



        };

		$scope.deleteStage = function() {
		};

    }; //end configMap
	
	

	$scope.fleetDetail.calendars = [];
	$scope.calendarOptions.data = $scope.fleetDetail.calendars;
    $scope.addCalendar = function() {
        $scope.fleetDetail.calendars.push({
            serviceId: 0,
            serviceName: '',
            mon: true,
            tue: true,
            wed: true,
            thu: true,
            fri: true,
            sat: true,
            sun: true,
            startDate: '2014-10-1',
            endDate: '2100-10-1'
        });	
    };
    $scope.saveCalendars = function() {};
    $scope.placeMarkers = [];

    $scope.map = {
        control: {},
        infoWindow: {
            /*coords: {
          latitude: 36.270850,
          longitude: -44.296875
        },*/
            options: {
                disableAutoPan: true
            },
            show: false
        }
    };

/*
    $scope.$watch('map.infoWindow.show', function(newValue, oldValue) {
        if ((newValue !== oldValue) && (newValue == true)) {
            //$( "input[name='stopName']" ).focus();
            document.stop_form.stopName.focus();
        }
    });
	*/

    /*var stopOptions = {
		draggable: true
	};
		*/
    var stpPtr = 0;

    function stopFromPM(pm) {

        var stop = {
            id: parseInt(pm.id),
            peerStopId: pm.vars.val.peer,
            name: pm.name,
            icon: STOP_ICON,
            latitude: pm.latlng.lat(),
            longitude: pm.latlng.lng()
        };

        return stop;


    }

    function useTheData(docs) {
        markerclusterer.addMarkers(markers);
        stpPtr = 0;
    }

    var mcOptions = {
        gridSize: 50,
        maxZoom: 15,
		imagePath: "//google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/images/m"
    };
    var markerclusterer;
    var markers = [];

    pushToStops = function(stop) {
        if (stop.marker) {
            stop.marker.map = null;
            markerclusterer.removeMarker(stop.marker);
        }
        stop.marker = undefined;
        var sidx = _.sortedIndex($scope.fleetDetail.stops, stop, 'id');
        $scope.fleetDetail.stops.splice(sidx, 0, stop);
    };
    removeFromStops = function(stop) {
        var sidx = _.sortedIndex($scope.fleetDetail.stops, stop, 'id');
        $scope.fleetDetail.stops.splice(sidx, 1);
    };
	editOneStop = function(stop){
		var sidx = _.sortedIndex($scope.fleetDetail.stops, stop, 'id');
        $scope.fleetDetail.stops.splice(sidx, 1, stop);
	};
    pushStop = function(stop) {
        var stp = binarySearch($scope.fleetDetail.stops, stop.id);
        if (!stp) {
            pushToStops(stop);
        }

        if (stop.peerStopId) {
            var peerStop = binarySearch($scope.fleetDetail.stops, stop.peerStopId);
            if (!peerStop) { //Peer is not already activated
                peerStop = binarySearch($scope.fleetDetail.allstops, stop.peerStopId); //Find in the all stops
                if (peerStop) { //If there exists a peer stop					
                    pushToStops(peerStop);
                }
            }
        }
    };
    getActiveStopById = function(id) {
        var stop;
        if (!(stop = binarySearch($scope.fleetDetail.stops, id))) {
            stop = binarySearch($scope.fleetDetail.allstops, id);
            pushToStops(stop);
        }
        return stop;
    };

    replaceMarker = function(marker, stop) {};

    //Just add the marker. It will be added to clusterer later
    addMarker = function(markerOptions) {
        //console.log("Adding marker ", cnt++);
        //markerOptions.map = $scope.gmap;
        var marker = new google.maps.Marker(markerOptions);
        markers.push(marker);
        //markerclusterer.addMarker(marker);

        google.maps.event.addListener(marker, 'dragend', function(event) {
            this.model.latitude = marker.position.lat();
            this.model.longitude = marker.position.lng();
        });

        //When the user 'works' on any KML marker, remove the marker and put the stop in the fleetDetail.stops array.
        Object.keys($scope.stopEvents).forEach(function(key) {
            google.maps.event.addListener(marker, key, function(event) {

                pushStop(this.model); //Put the stop and its peer if exists
                $scope.stopEvents[key](this, key, this.model);
            });
        });
        return marker;
    };

    var stpPtr = 0;
    createMarker = function(placemark) {
        //console.log(placemark);
        //Constructing marker for each Placemark node, and then add it to the markclustere
        var point = new google.maps.LatLng(placemark.Point.coordinates[0].lat, placemark.Point.coordinates[0].lng);
        //var stop = stopFromPM(placemark);
        var stop = $scope.fleetDetail.allstops[stpPtr++];
        /*stop.options = {
            draggable: true,
            title: stop.name
            //zIndex: 1000
        };*/
        var markerOptions = {
            position: point,
            model: stop,
            icon: stop.icon,
            draggable: true,
			title: stop.name
        };
        var marker = addMarker(markerOptions);
        stop.marker = marker;
    };

    //Region:Business Logic: This is the region that binds UI data to server data. This invokes business logic at the server to get things done at the server.
    //Get the details of the selected fleet
    $scope.getFleetDetail = function(fleetId) {
        getthereAdminService.getFleetDetail(fleetId, function(fleetDetail) {
            //This array is absolutely needed, even with KML. The PushStop function uses it to find a peer
            fleetDetail.allstops.forEach(function(stop) {

                stop.icon = stop.peerStopId > 0 ? PEER_STOP_ICON : STOP_ICON;
                //stop.options = stopOptions; 

                stop.options = {
                    draggable: true,
                    title: stop.name
                    //zIndex: 1000
                };

            });
            fleetDetail.stops = [];
            
            $scope.fleetDetail = fleetDetail;
			
			$scope.closeRoute();

			$log.debug("Fleet", $scope.fleetDetail);
            $scope.showStops();
            $scope.calendarOptions.data = $scope.fleetDetail.calendars;
            [0, 1].forEach(function(dir) {
                var svcCol = _.find($scope.scheduleOptions[dir].columnDefs, function(col) {
                    return col.name == "Service";
                });
                svcCol.editDropdownOptionsArray = $scope.fleetDetail.calendars;
            });
            calendars = $scope.fleetDetail.calendars;
            $scope.routeListOptions.data = $scope.fleetDetail.routes;
        });
    };

    $scope.loadFleets = function() {
        getthereAdminService.loadFleets(function(fleets) {
            $scope.fleets = fleets;
            $scope.fleet.selected = _.find(fleets, function(fleet) {
                return fleet.level == 0;
            });
            //console.log("LOADFLEETS");
            //$scope.getFleetDetail($scope.fleet.selected.fleetId);
        });
    };

    $scope.saveStop = function(stopDetail) {
        getthereAdminService.saveStop(stopDetail, function(stop) {
            //flash("Stop " + stopDetail.name + " has been saved.");
            //messageCenterService.add('success', 'Stop added successfully');
            var icon = STOP_ICON;
            var message = 'Stop saved successfully. Create the peer stop';
            if (stopDetail.peerStopId > 0) {
                icon = PEER_STOP_ICON;
                message = 'Peer stop saved successfully';
            }

            flash.success = message;
            if (stopDetail.id <= 0) { //New stop				
                var newStop = {
                    id: stop.id,
                    name: stopDetail.name,
                    latitude: stopDetail.latitude,
                    longitude: stopDetail.longitude,
                    peerStopId: stopDetail.peerStopId,
                    icon: icon,
                    options: {
                        draggable: true,
                        title: stopDetail.name
                    }
                };
                if (!(stopDetail.peerStopId > 0)) { //If this is a fresh non-peer stop, it has to be added to stops with which we can work
                    pushToStops(newStop);
                    //$scope.fleetDetail.stops.push(newStop);
                } else { //The one that has been saved is a peer stop. Update the original stop with the id of the peer stop
                    var origStop = binarySearch($scope.fleetDetail.stops, newStop.peerStopId);
                    origStop.peerStopId = newStop.id;

                    removeFromStops(stopDetail); //Remove the old peer which has -ve id
                    pushToStops(newStop);

                }

                if ($scope.routeDetail.routeId >= 0) {
                    $scope.addStopToRoute(newStop);
                }
            } else {
				stopDetail.options.title = stopDetail.name;
			}
			$scope.map.infoWindow.show = false;
            $scope.stopDetail = null; //The infowindow vanishes only when the model of the coords property is set to null	
        }, function(error) {
            flash.error = 'Stop could not be saved';
            var idx = _.findIndex($scope.fleetDetail.stops, {
                id: stopDetail.id
            });
            $scope.fleetDetail.stops.splice(idx, 1);
        });
    };


    //Region ends

    //TODO Do this based on the user's fleet
    $scope.loadFleets();
    GoogleMapApi.then(function(maps) {
        //$scope.getFleetDetail(2);
        $scope.configMap();
    });

    $log.debug("RouteController created");
};


function RouteHelpController($scope, routeHelpChannel, flash) {
    //$scope.directionsDisplay = new google.maps.DirectionsRenderer();
    //$scope.directionsService = new google.maps.DirectionsService();
	$scope.searchRoute = function(){
		routeHelpChannel.searchRoute();
	};
	
}

function GeoCoderService($log) {
	this.geocoder = new google.maps.Geocoder();
	this.geocode = function(stop, cb){
		var loc = new google.maps.LatLng(stop.latitude, stop.longitude);
		this.geocoder.geocode({
            'latLng': loc
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                $log.debug(results);
                cb(results[0].formatted_address);
            }
        });
	};
	return this;
}

//This controller starts with a lat-lng and gets the user to define the name of the stop. It also performs reverse geocoding
//TODO: CBM to do rev geocoding
function StopController($scope, $log, stopChannel, locationChannel, geocoder) {
    //var geocoder = new google.maps.Geocoder();
    $log.debug("Creating SC");

$scope.stopDetail = locationChannel.stopDetail;
geocoder.geocode($scope.stopDetail, function(formatted_address){
	$scope.stopDetail.address =  formatted_address;
});
  this.getStopDetail = function(){
    return locationChannel.stopDetail;
  };
  
  /*
    locationChannel.add(function(latLng) {
        var loc = new google.maps.LatLng(latLng.latitude, latLng.longitude);
        $scope.stopDetail = {
            latitude: latLng.latitude,
            longitude: latLng.longitude,
            name: "TEST",
            address: "Rev addr"
        };
        geocoder.geocode({
            'latLng': loc
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                $log.debug(results);
                $scope.stopDetail.address = results[0].formatted_address;
            }
        });

        $log.debug("Stop detail is %j", $scope.stopDetail);
    });
	*/

    $scope.saveStop = function() {
        stopChannel.publishStop($scope.stopDetail);
    };
}


//Service that communicates with the server. All communication with server should happen through functions defined in this service.
//TODO: Most of this looks repetitive. Simplify it.
GetThereAdminService = function($http, $log) {
    var services = [{
        name: 'saveRoute',
        path: '/api/route/',
        method: 'post'
    }, {
        name: 'setCurrentFleet',
        path: '/api/currentFleet/',
        method: 'post'
    }, {
        name: 'saveStop',
        path: '/api/stop/',
        method: 'post'
    }, {
        name: 'deleteStop',
        path: '/api/stop/:id',
        method: 'delete'
    }, {
        name: 'saveCalendar',
        path: '/api/calendar/',
        method: 'post'
    }, {
        name: 'getRoute',
        path: '/api/route/:routeId',
        method: 'get'
    }, {
        name: 'loadFleets',
        path: '/api/fleets/',
        method: 'get'
    }, {
        name: 'getFleetDetail',
        path: '/api/fleet/:fleetId',
        method: 'get'
    }];

    var service = {};


    var getSuccess = function(callback) {
        return (function(data) {
            //console.log(JSON.stringify(data));
            callback(data);
        });
    };
    var getError = function(callback) {
        return function(data) {
            $log.error(JSON.stringify(data));
            if (_.isFunction(callback)) {
                callback(data);
            }
        };
    };
    services.forEach(function(svc) {
        switch (svc.method) {
            case "post":
                service[svc.name] = function(data, callback, errorCallback) {
                    $log.debug("Hitting URL %j", svc.path);
                    return $http.post(svc.path, data)
                        .success(getSuccess(callback))
                        .error(getError(errorCallback));
                };
                break;
			case "delete":
				service[svc.name] = (function() {
                    var invoke = function(path, args, callback, errorCallback) {
                        var url = path;
                        args.forEach(function(arg) {
                            url = url.replace(/:\w+/, arg);
                        });
                        $log.debug("Hitting URL %j", url);
                        return $http.delete(url)
                            .success(getSuccess(callback))
                            .error(getError(errorCallback));
                    };
                    var f;
                    switch ((svc.path.match(/:/g) || []).length) {
                        case 1:
                            f = function(a1, callback, errorCallback) {
                                return invoke(svc.path, [a1], callback, errorCallback);
                            };
                            break;
                        default:
                            f = function(callback, errorCallback) {
                                return invoke(svc.path, [], callback, errorCallback);
                            };
                            break;
                    }
                    return f;
                })();
				break;
            case "get":
                service[svc.name] = (function() {
                    var invoke = function(path, args, callback, errorCallback) {
                        var url = path;
                        args.forEach(function(arg) {
                            url = url.replace(/:\w+/, arg);
                        });
                        $log.debug("Hitting URL %j", url);
                        return $http.get(url)
                            .success(getSuccess(callback))
                            .error(getError(errorCallback));
                    };
                    var f;
                    switch ((svc.path.match(/:/g) || []).length) {
                        case 1:
                            f = function(a1, callback, errorCallback) {
                                return invoke(svc.path, [a1], callback, errorCallback);
                            };
                            break;
                        default:
                            f = function(callback, errorCallback) {
                                return invoke(svc.path, [], callback, errorCallback);
                            };
                            break;
                    }
                    return f;
                })();
            default:
                break;
        }
    });
    return service;
};
StopChannelService = function() {

    var callbacks = [];
    this.add = function(cb) {
        callbacks.push(cb);
    };
    this.publishStop = function() {
        var args = arguments;
        callbacks.forEach(function(cb) {
            cb.apply(this, args);
        });
    };
    console.log("Created Stop Channel");
    return this;
};

RouteHelpChannelService = function() {
    this['From'] = undefined;
    this['To'] = undefined;
	
	var polyLineOpts = {
		clickable : false
		,strokeColor : "#41CC56"
		,strokeOpacity: 1.0
		,strokeWeight: 5
	};
	this.directionsDisplay = new google.maps.DirectionsRenderer({
		draggable: false
		,hideRouteList: true
		,polylineOptions: polyLineOpts
	});
    this.directionsService = new google.maps.DirectionsService();
    this.searchRoute = function() {
		this.resetDisplay();

        var request = {
            origin: this.From,
            destination: this.To,
            travelMode: google.maps.TravelMode.DRIVING
        };

		this.showDisplay(request);

    };
	this.resetDisplay = function(){
		//this.directionsDisplay.setMap(null);
		this.directionsDisplay.setDirections({ routes: [] }); 
        this.directionsDisplay.setMap(this.gmap);
	};
	this.showDisplay = function(request){
		this.directionsService.route(request, 
			function(display){
			return function(result, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					display.setDirections(result);                
				}
			}
			}(this.directionsDisplay)
		);
	};
	this.showRoute = function(fromStop, toStop, intermedStops) {
		this.resetDisplay();
		
		var request = {
		origin: new google.maps.LatLng(fromStop.latitude, fromStop.longitude), //place.geometry.location
		destination: new google.maps.LatLng(toStop.latitude, toStop.longitude),
		travelMode: google.maps.TravelMode.DRIVING,
		optimizeWaypoints: true,
		durationInTraffic: false,
		provideRouteAlternatives: false,
		waypoints: intermedStops.map(function(stop){ 
			return {
				location: new google.maps.LatLng(stop.latitude, stop.longitude)
				, stopover: true 
			}; 
			})
		};
		
		this.showDisplay(request);
		
	};
};

//This service is used for conveying to other components that a location on the map has been chosen
LocationChannelService = function() {
    var callbacks = [];
    this.add = function(cb) {
        callbacks[0] = cb;
    };
    this.publishLocation = function(latLng) {
        //var args = arguments;
        callbacks.forEach(function(cb) {
            cb.call(this, latLng);
        });
    };
    return this;
};


NYUIGmapControlDirective = function() {
    return {
        restrict: 'E',
        replace: false,
        scope: {
            gmap: '=',
            bounds: '='
        },
        controller: function($scope, $element, $attrs, $transclude, routeHelpChannel) {
            RouteSearchOptions = function(key) {

                this.resetBounds = function() {
					if($scope.bounds){
						this.bounds = new google.maps.LatLngBounds(
                        new google.maps.LatLng($scope.bounds.southwest.latitude, $scope.bounds.southwest.longitude)
						, new google.maps.LatLng($scope.bounds.northeast.latitude, $scope.bounds.northeast.longitude));
					}
                };

                this.resetBounds();
                this.markers = [];

                this.location = undefined;
                this.events = {
                    places_changed: function(searchBox) {
                        var places = searchBox.getPlaces();
                        this.location = undefined;
                        routeHelpChannel[key] = undefined;

                        //remove previous place markers. Not stop markers
                        _.each(this.markers, function(marker) {
                            marker.setMap(null);
                        });

                        // For each place, get the icon, place name, and location.
                        this.markers = [];

                        var bounds = $scope.gmap.getBounds();
                        for (var i = 0, place; place = places[i]; i++) {
                            // Create a marker for each place.
                            var marker = new google.maps.Marker({
                                map: $scope.gmap,
                                title: place.name,
                                position: place.geometry.location
                            });

                            this.markers.push(marker);

                            if (!(bounds.contains(place.geometry.location))) {
                                bounds.extend(place.geometry.location);
                                $scope.gmap.fitBounds(bounds);
                            }
                            this.location = place.geometry.location;
                            routeHelpChannel[key] = place.geometry.location;

                        }




                    }
                };
            };


            $scope.placeFromOptions = new RouteSearchOptions('From');
            $scope.placeToOptions = new RouteSearchOptions('To');

            //this.resetBounds();
            $scope.$watch('bounds', function(bounds) {
                if (!(bounds == undefined)) {
                    $scope.placeFromOptions.resetBounds();
                    $scope.placeToOptions.resetBounds();
                }
            });



        } //end controller

        ,
        templateUrl: 'ny-gmap-search.html'
    }
};

NYFleetChoiceDirective = function() {
    return {
        restrict: 'E',
        replace: false,
        scope: {
            nyFleets: '=',
            nyFleet: '='
        },
        templateUrl: 'ny-fleet-choice.html'
    };
};

autofocus = function($timeout) {
    return {
        restrict: 'A',
        link: function($scope, element) {
            $timeout(function() {
                element[0].focus();
            }, 500);
        }
    };
};

dateMask = function($timeout) {
    return {
        restrict: 'A',
        link: function($scope, element) {            
            var patt = new RegExp("^([0-9]|([0-1][0-2])|0[0-9]):([0-9]|[0-5][0-9]) (am|pm)$");

            $(element[0]).blur(function() {
                var val = $(element[0]).val();

                if (!patt.test(val)) {                    
                    $(element[0]).val('');
                    $scope.$apply();
                }
            });

            $scope.validate = function() {

                var val = $(element[0]).val();
                console.log(val);
                if (!val || val == '')
                    return;
                var testVal = null;
                var dummy = '11:11 am';
                testVal = val + dummy.substring(val.length);
                console.log(testVal);

                if (!patt.test(testVal)) {
                    console.log(false);
                    $(element[0]).val(val.substring(0, val.length - 1));
                    $scope.validate();
                } else {
                    console.log(true);
                    if (val.length == 2)
                        $(element[0]).val(val + ":");
                    else if (val.length == 5)
                        $(element[0]).val(val + " ");
                    else if (val.length == 7)
                        $(element[0]).val(val + "m");
                }
            };
            $(element[0]).keyup(function(event) {
                $scope.validate();
            });
        }
    };
};

var calendars = [];

function ServiceFilter() {

    return function(input) {
        if (!input) {
            return '';
        } else {
            var svc = _.find(calendars, function(calendar) {
                return calendar.serviceId == input;
            });
            return svc.serviceName;
        }
    };
}

function ReverseFilter() {
    return function(items) {
        if (!angular.isArray(items)) return false;
        return items ? items.slice().reverse() : [];
    };
}

function UnpairedStopsFilter() {
    return function(stops) {
        if (!angular.isArray(stops)) return false;
        var x = _.countBy(stops, function(stop) {
            return stop.peerStopId > 0 ? 'paired' : 'unpaired';
        });
        return x.unpaired;
    };
}

(function() {
    var adminApp = angular.module('adminApp', ['ngSanitize', 'ui.bootstrap', "google-maps".ns(), "ui.tree", "ui.select", 'ngAnimate', 'ui.grid', 'ui.grid.expandable', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav', 'ui.grid.autoResize', 'ui.grid.selection'
	//, 'ui.grid.pinning'
        //, 'MessageCenterModule'
        , 'ui.layout', 'ui.grid.resizeColumns', 'angular-flash.service', 'angular-flash.flash-alert-directive', 'cgBusy'
		, 'DecoratedLogWithLineNumber'
    ]);
    adminApp.config(['GoogleMapApiProvider'.ns(),
        function(GoogleMapApi) {
            GoogleMapApi.configure({
                //    key: 'your api key',
                v: '3.16',
                libraries: 'weather,geometry,visualization,places'
            });
        }
    ]);
    adminApp.run(initializeApp);
    adminApp.controller('RouteController', ['$scope', '$log', 'getthereAdminService', 'stopChannel', 'locationChannel', 'routeHelpChannel'
        //, messageCenterService
        , 'flash', 'GoogleMapApi'.ns(), 'uiGmapIsReady', 'uiGridConstants', RouteController
    ]);

    adminApp.filter('service', ServiceFilter);
    adminApp.controller('RouteHelpController', RouteHelpController);
    adminApp.controller('StopController', StopController);
    adminApp.service('stopChannel', StopChannelService);
    adminApp.service('locationChannel', LocationChannelService);
    adminApp.service('routeHelpChannel', RouteHelpChannelService);
	adminApp.service('geocoder', GeoCoderService);
    adminApp.directive('nyFleetChoice', NYFleetChoiceDirective);
    adminApp.directive('nyUiGmapControl', NYUIGmapControlDirective);
    adminApp.factory('getthereAdminService', GetThereAdminService);
    adminApp.filter('reverse', ReverseFilter);
    adminApp.filter('unpaired', UnpairedStopsFilter);
    adminApp.directive('autofocus', autofocus);
    adminApp.directive('dateMask', dateMask);
}());
