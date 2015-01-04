function initializeApp($rootScope) {
    //Initialize the app
}

tempId = 2; //temporary
var STOP_ICON = "/images/bus_stop.png";
var PEER_STOP_ICON = "/images/peer_bus_stop.png";
var ROUTE_STOP_ICON = "/images/route_bus_stop.png";
var ROUTE_STOP_REV_ICON = "/images/route_bus_stop.png";
var ACTIVE_STOP_ICON = "/images/bus_stop.png";
var LINKABLE_STOP_ICON = "/images/bus_stop.png";

function RouteController($scope, getthereAdminService, stopChannel, locationChannel, routeHelpChannel
    //, messageCenterService
    , flash, GoogleMapApi) {

    $scope.fleet = {
        selected: undefined
    };

    $scope.$watch('fleet.selected', function(newValue, oldValue) {
        if ((newValue !== oldValue)) {
            //$( "input[name='stopName']" ).focus();
            $scope.fleetChosen(newValue);
        }
    });
	
	$scope.hangOn = {promise:null,message:"Please wait",backdrop:true,delay:0,minDuration:0}

    stopChannel.add(function(stopDetail) { //Invoked by DI when a Stop is defined
        //$scope.stopDetail.stopName = stopDetail.name;

        $scope.stopDetail.name = stopDetail.name;
        $scope.stopDetail.id = -1;
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
        stops: [],
        routes: [1]
    };
    addStopWindow = function(latLng) {

        //$scope.map.infoWindow.coords = {latitude:latLng.lat(), longitude:latLng.lng()};

        //TODO
        $scope.stopDetail = {
            id: 0,
            latitude: latLng.lat(),
            longitude: latLng.lng(),
            name: "stopname",
            address: "Reverse geocoded address goes here"
        };
        locationChannel.publishLocation({
            latitude: latLng.lat(),
            longitude: latLng.lng()
        });
        $scope.map.infoWindow.show = true;

    };
    deleteStop = function(stop) {
        console.log("Deleting stop " + JSON.stringify(stop));
    };
    linkStop = function(stop) {

        console.log("Linking stop %j", stop);

        //User to click on a stop on the opposite side of the road
        //$scope.$apply(function(){
        var peerStop = jQuery.extend({}, stop);
        peerStop.id = -stop.id;
        peerStop.icon = PEER_STOP_ICON;
        peerStop.peerStopId = stop.id;

        console.log("Peer stop %j", peerStop);
        $scope.fleetDetail.stops.push(peerStop);
        //});
        //Let the stop show a different icon
        //Allow user to click another stop. Once done, the two stops are brothers of each other.
    };

    $scope.clearRoute = function() {
        if ($scope.routeDetail != undefined) {
            if ($scope.routeDetail.stages != undefined) {
                $scope.routeDetail.stages.forEach(function(stage) {
                    if (stage.stops != undefined) {
                        stage.stops.forEach(function(routestop) {
							if(routestop.onwardStop) routestop.onwardStop.icon = STOP_ICON;
							if(routestop.returnStop) routestop.returnStop.icon = STOP_ICON;
                            //stop.icon = STOP_ICON;
                        });
                    }
                });
            }
        }

        $scope.routeDetail = {
            routeId: -1,
            stages: [],
			trips: [[],[]]
        };
		
		$scope.clearScheduleGrid();
    };

    var enableStopDragging = function() {
        $scope.fleetDetail.stops.forEach(function(stop) {
            stop.options.draggable = true;
        });
    };
    var disableStopDragging = function() {
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

    $scope.saveRoute = function() {
        $scope.hangOn.promise = getthereAdminService.saveRoute($scope.routeDetail, function(route) {

			flash.success = 'Route saved successully' ;
            if ($scope.routeDetail.routeId == 0) {
                $scope.routeDetail = route;
                $scope.routeDetail.isDirty = false;
				
                $scope.fleetDetail.routes.push(route);
                $scope.gridRoutesApi.selection.selectRow(route);
            }

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

        console.log("Created context menu");
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
        }]);

    };

    $scope.mapEvents = {
        rightclick: function(gMap, eventName, model) {
            if (model.$id) {
                model = model.coords; //use scope portion then
            }
            $scope.contextMenu.show(model["0"].latLng);
            //alert("Model: event:" + eventName + " " + JSON.stringify(model));
        },
		
        tilesloaded: function(gMap, eventName, model) {
            if ($scope.gmap == undefined) {
                $scope.gmap = $scope.map.control.getGMap();
                routeHelpChannel.gmap = $scope.gmap;				
            }

            console.log("Tiles loaded");

			$scope.stopLayer.setMap($scope.gmap);
            $scope.setContextMenu();

        }
    };
    $scope.markerOptions = {
        draggable: true,
        title: 'Label1'
    };

	function binarySearch(array, key) {
    var lo = 0,
        hi = array.length - 1,
        mid,
        element;
    while (lo <= hi) {
        mid = ((lo + hi) >> 1);
        element = array[mid];
        if (element < key) {
            lo = mid + 1;
        } else if (element > key) {
            hi = mid - 1;
        } else {
            return array[mid];
        }
    }
    return undefined;
}

    $scope.addStopToStage = function(fleetstop, routestage) {
		var returnstop ;
		
		if(fleetstop.peerStopId){
			
			
			//returnstop = _.find($scope.fleetDetail.stops, function(returnstop) { return returnstop.id == fleetstop.peerStopId; });
			returnStop = binarySearch($scope.fleetDetail.stops, fleetstop.peerStopId); 		
			if(returnstop==undefined){
				returnStop = fleetstop;
			}		
		}
		else
		{
			returnstop = fleetstop;
		}
		
		$scope.addStopsToStage(fleetstop, returnstop, routestage);
        
    };
	
	$scope.addStopsToStage = function(onwardStop, returnStop,stage){
		var routeStop = {};
		if (onwardStop != undefined) {
            onwardStop.icon = ROUTE_STOP_ICON;
			$scope.addStopToScheduleGrid(0,onwardStop);	
        }
		if (returnStop != undefined) {
            returnStop.icon = ROUTE_STOP_ICON;
			$scope.addStopToScheduleGrid(1,returnStop);	
        }
		
		routeStop.onwardStop = onwardStop;
		routeStop.returnStop = returnStop;
		console.log("Adding %j %j to stage %j", onwardStop, returnStop,stage);
		stage.stops.push(routeStop);
		return routeStop;
	};

    //SCHEDULE REGION
	$scope.clearScheduleGrid = function(){
		[0,1].forEach(function(dir){
			$scope.scheduleOptions[dir].columnDefs.splice($scope.scheduleOptions[dir].fixedCols, 100);
		});
		
	};
	$scope.addStopToScheduleGrid = function(dir,fleetstop){
		var def = {
                name: fleetstop.name,
                displayName: fleetstop.name,
                field: "stops." + fleetstop.id,
				enableCellEdit: true,
				editableCellTemplate: "<div><form name=\"inputForm\"><input date-mask maxlength=\"8\" type=\"text\" ng-class=\"'colt' + col.uid\" ui-grid-editor ng-model=\"MODEL_COL_FIELD\"></form></div>"
        };
		
		var idx = dir==0 ? $scope.scheduleOptions[dir].columnDefs.length : $scope.scheduleOptions[dir].fixedCols ;
		
	    $scope.scheduleOptions[dir].columnDefs.splice(idx, 0, def);
	};
	$scope.delStopFromScheduleGrid = function(dir,stop)
	{
		var idx = _.findIndex($scope.scheduleOptions[dir].columnDefs, {
                field: "stops." + stop.id
            });
        $scope.scheduleOptions[dir].columnDefs.splice(idx, 1);
	};
	
    $scope.getRoute = function(routeId) {
        getthereAdminService.getRoute(routeId, function(routeDetail) {
            $scope.routeDetail.routeId = routeId;

            $scope.clearScheduleGrid();


            routeDetail.stages.forEach(function(stage) {
			/*
                var routestage = {
                    title: stage.title,
                    stageId: stage.stageId,
                    stops: []
                };

                stage.stops.forEach(function(stop) {
                    var fleetstop = _.find($scope.fleetDetail.stops, function(fleetstop) {
                        return fleetstop.id == stop.id;
                    });
					
					if(fleetstop!=undefined) $scope.addStopToStage(fleetstop, routestage);
                });

                $scope.routeDetail.stages.push(routestage);
				*/
				var routestage = {
                    title: stage.title,
                    stageId: stage.stageId,
                    stops: []
                };
				$scope.routeDetail.stages.push(routestage);
				
				stage.stops.forEach(function(routestop) {
					var onwardStop = _.find($scope.fleetDetail.stops, function(fleetstop) {
							return fleetstop.id == routestop.onwardStop.id;
						});

					var returnStop = _.find($scope.fleetDetail.stops, function(fleetstop) {
							return fleetstop.id == routestop.returnStop.id;
						});

					
					var newroutestop = $scope.addStopsToStage(onwardStop, returnStop, routestage);
					newroutestop.segments = [routestop.onwardStop.distance, routestop.returnStop.distance];
				});
				
				
            });
            $scope.routeDetail.trips = routeDetail.trips;
			[0,1].forEach(function(dir){
				$scope.scheduleOptions[dir].data = $scope.routeDetail.trips[dir];
			});
            //$scope.scheduleOptions.data = $scope.routeDetail.trips;

        });
    };

	$scope.forAllStops = function(cb){
		$scope.routeDetail.stages.forEach(function(stage) {
                stage.stops.forEach(cb);
        });
	};
	
	$scope.findRouteStop = function(cb){
		var rs ;
		_.find($scope.routeDetail.stages, function(stage){
			var rst = _.find(stage.stops, cb);
			rs = rst ;
			return rst!=undefined;
		});
		return rs;
	};
	
	$scope.addTrip = function(dir){	
	console.log($scope);
	console.log(_);
		var latestTrip = _.min($scope.routeDetail.trips[dir], function(trip){ return trip.tripId;});
		
		var newTrip = {
            tripId: (latestTrip.tripId<0)? latestTrip.tripId-1 : -1,
            direction: dir,
            serviceId: $scope.fleetDetail.defaultServiceId,
            frequency_trip: false,
            frequency_start_time: '00:00',
            frequency_end_time: '00:00',
			stops: {}
        };
		
		$scope.forAllStops(function(routestop){
			newTrip.stops[''+((dir==0) ? routestop.onwardStop.id : routestop.returnStop.id)+''] = '';
		});

		/*
		$scope.routeDetail.stages.forEach(function(stage) {
                stage.stops.forEach(function(stop) {
					newTrip.stops[''+stop.id+''] = '08:00';
                });
        });
		*/
			
	
		$scope.routeDetail.trips[dir].push(newTrip);
		$scope.routeDetail.isDirty = true;
	};
	
    $scope.scheduleActions = {
        deleteTrip: function(trip) {
            console.log(trip);
            var idx = _.findIndex($scope.routeDetail.trips, {
                tripId: trip.tripId
            });
            $scope.routeDetail.trips.splice(idx, 1);
            $scope.routeDetail.isDirty = true;
        }
		, autocomplete: function(dir, trip) {
			var i = 0;
			var allstops = [];
			var allsegments = [];

			$scope.forAllStops(function(routestop){
				allstops.push((dir==0)? routestop.onwardStop : routestop.returnStop);
				allsegments.push(routestop.segments[dir]);
			});
			if(dir==1){
				allstops.reverse();
				allsegments.reverse();
			}
			
			for(i=0; i< allstops.length; i++){
				if(i!=0){
					//var prevtime = Date.parse(trip.stops[''+ allstops[i-1].id]) ;
					var prevtime = moment(trip.stops[''+ allstops[i-1].id], 'HH:mm') ;
					// 30*1000 m in 60 min
					// distance in X
					var inctime = allsegments[i] * 60 / 30000;
					trip.stops[''+ allstops[i].id] = prevtime.add(inctime,'m').format('HH:mm');
				}
			}
		}	
    };

	$scope.scheduleOptions = [];
	[0,1].forEach(function(dir){
		$scope.scheduleOptions.splice(dir,0, {
        enableSorting: false,
        enableCellEdit: true,
        enableColumnMenus: false,
        columnDefs: [{
            name: 'Delete',
            displayName: '',
            cellTemplate: '<button class="btn btn-danger btn-xs" ng-click="getExternalScopes().deleteTrip(row.entity)"><span class="glyphicon glyphicon-trash"></span> Delete</button>'
        }, 
		{
            name: 'Auto',
            displayName: '',
            cellTemplate: '<button class="btn btn-success btn-xs" ng-click="getExternalScopes().autocomplete(' + dir +',row.entity)"><span class="glyphicon glyphicon-arrow-right"></span>Autocomplete</button>'
        },
		{
            name: 'ID',
            field: 'tripId',
            enableCellEdit: false,
			cellTemplate: '<div>{{ (row.entity.tripId<0)? "NEW" : row.entity.tripId}}</div>'
        }, {
            editableCellTemplate: 'ui-grid/dropdownEditor',
            name: 'Service',
            field: 'serviceId',
            cellFilter: 'service',
            editDropdownIdLabel: 'serviceId',
            editDropdownValueLabel: 'serviceName',
            editDropdownOptionsArray: []
        }, {
            name: 'isFrequency',
            displayName: 'Frequency?',
            field: 'frequency_trip',
            type: 'boolean'
        }, {
            name: 'frequencyStart',
            displayName: 'Frequency St.',
            field: 'frequency_start_time'
        }, {
            name: 'frequencyEnd',
            displayName: 'Frequency En.',
            field: 'frequency_end_time',
            pinnedLeft: true
        }]
		});
	$scope.scheduleOptions[dir].fixedCols = $scope.scheduleOptions[dir].columnDefs.length ;
	});

    //SCHEDULE REGION ENDS
	
	//FARE REGION
	$scope.showFares = function(){
		$scope.fareGridOptions.columnDefs.splice(1, 100);
		$scope.routeDetail.stages.forEach(function(stage){
			var stageCol = {
				name: ''+stage.stageId,
				displayName: stage.title,
				field: 'stages.'+stage.stageId
			};
			$scope.fareGridOptions.columnDefs.push(stageCol);
		});
		$scope.fareGridOptions.data = $scope.routeDetail.stages;
	};
	$scope.fareGridOptions = {
        enableSorting: false,
        enableCellEdit: true,
        enableColumnMenus: false,
        columnDefs: [
			{
				name: 'title'
				, displayName: 'Source'
				, field: 'title'
			}
		]
	}	
	//FARE REGION ENDS
	
	$scope.stopLayer = new google.maps.KmlLayer({});
	google.maps.event.addListener($scope.stopLayer, 'status_changed', function () {
				console.log("Layer is now " + $scope.stopLayer.getStatus());
	});
				
	

    //ROUTELIST REGION
    $scope.routeListOptions = {
        enableSorting: true,
        enableCellEdit: false,
        enableColumnMenus: false,
        enableFiltering: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        columnDefs: [{
            name: 'No.',
            field: 'routeNum'
        }, {
            name: 'From',
            field: 'st'
        }, {
            name: 'To',
            field: 'en'
        }],
        onRegisterApi: function(gridApi) {
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
			if(stop.peerStopId>0) {
				var routestop = $scope.findRouteStop( function(rs){ return rs.onwardStop.id==stop.peerStopId ;});
				if(routestop){
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
				
				var rs = _.find(stage.stops, function(rs){ return rs.onwardStop.id==stop.id || rs.returnStop.id==stop.id; });
				if(rs!=undefined){
					$scope.delStopFromScheduleGrid(0, rs.onwardStop);
					rs.onwardStop.icon = STOP_ICON;
					
					$scope.delStopFromScheduleGrid(1, rs.returnStop);
					rs.returnStop.icon = STOP_ICON;
					
					stage.stops.splice(_.indexOf(stage.stops, rs),1);
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
				var rs = _.find(stage.stops, function(rs){ return rs.onwardStop.id==stop.id || rs.returnStop.id==stop.id; });
				return (rs!=undefined) ;
                //return _.contains(stage.stops, model);
            });
            if (stg == undefined) { //The stop does not already exist in the route
                $scope.addStopToRoute(stop);
            } else {
                $scope.delStopFromRoute(stop);
            }
        },
        rightclick: function(marker, eventName, stop) {
            console.log("Event:" + eventName + " Marker:" + marker, stop);
            $scope.stopContextMenu.showOnMarker(marker.position, stop);
            console.log("Event:" + eventName + " Model:" + JSON.stringify(stop));
        },
        dragend: function(marker, eventName, stop) {
            console.log("Stop is now " + JSON.stringify(stop));

            $scope.saveStop(stop);
        }
        /*,mouseover: function(marker, eventName, model) {
            console.log("Hover on stop" + JSON.stringify(model));
			$scope.currentStop = model;	
        }
		,mouseout: function(marker, eventName, model) {
            console.log("Out of stop" + JSON.stringify(model));
			$scope.currentStop = null;
        }
		*/

    };
    $scope.configMap = function() {
        //$scope.gmap = $scope.map.control.getGMap() ;

        $scope.stageTreeOptions = {
            accept: function(sourceNode, destNodes, destIndex) {
                var srcType = sourceNode.$element.attr('data-type');
                var destType = destNodes.$element.attr('data-type');
                return srcType == "stop" && destType == "stage"; // only accept stop in stage 
            },
            dropped: function(event) {
                console.log(event);
                $scope.routeDetail.isDirty = true;
            }
        };
        $scope.fleetChosen = function(fleet) {
            console.log('FleetChosen');
            getthereAdminService.setCurrentFleet(fleet, function(fleet) {
                console.log("Setting fleet ", fleet);
                $scope.getFleetDetail(fleet.fleetId);
            });

        };
        $scope.addNewStage = function() {
            var newObject = jQuery.extend({}, $scope.newStage);
            newObject.stops = [];
            if (newObject.title == "") {
                newObject.title = "New Stage";
            }
			var latestStage = _.min($scope.routeDetail.stages, function(stage){ return stage.stageId;});
			var stageId = -1;
			if(latestStage.stageId < 0){
				stageId = latestStage.stageId - 1;
			}
			newObject.stageId = stageId;
			var stages = {};

			newObject.stages = stages;
			
			//Add the new stage to all existing stages
			$scope.routeDetail.stages.forEach(function(stage){
				stage.stages[''+newObject.stageId] = 0;
			});
			
			//Add the new stage to the route
            $scope.routeDetail.stages.push(newObject);
			$scope.routeDetail.stages.forEach(function(stage){
				stages[''+stage.stageId] = 0;
			});
            $scope.routeDetail.isDirty = true;
            $scope.newStage.title = "";
			
			var stageCol = {
				name: ''+newObject.stageId,
				displayName: newObject.title,
				field: 'stages.'+newObject.stageId
			};
			$scope.fareGridOptions.columnDefs.push(stageCol);
			
			
			
        };



    }; //end configMap


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

    $scope.$watch('map.infoWindow.show', function(newValue, oldValue) {
        if ((newValue !== oldValue) && (newValue == true)) {
            //$( "input[name='stopName']" ).focus();
            document.stop_form.stopName.focus();
        }
    });

    /*var stopOptions = {
		draggable: true
	};
	*/

    //Region:Business Logic: This is the region that binds UI data to server data. This invokes business logic at the server to get things done at the server.
    //Get the details of the selected fleet
    $scope.getFleetDetail = function(fleetId) {
        getthereAdminService.getFleetDetail(fleetId, function(fleetDetail) {
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
			
			$scope.stopLayer.setUrl('http://14.97.97.173:3000/api/kml/' + fleetId) ;
			//$scope.stopLayer.setMap($scope.gmap);
			
            $scope.closeRoute();
            $scope.fleetDetail = fleetDetail;
            $scope.calendarOptions.data = $scope.fleetDetail.calendars;
			[0,1].forEach(function(dir){
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
			$scope.fleet.selected = _.find(fleets, function(fleet){ return fleet.level==0; });
			$scope.getFleetDetail($scope.fleet.selected.fleetId);
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
				if(!(stopDetail.peerStopId>0)) { //If this is a fresh non-peer stop, it has to be added to stops with which we can work
					$scope.fleetDetail.stops.push(newStop);
				}

                    if ($scope.routeDetail.routeId >= 0) {
                        $scope.addStopToRoute(newStop);
                    }

                    $scope.map.infoWindow.show = false;
                    $scope.stopDetail = null; //The infowindow vanishes only when the model of the coords property is set to null	
            }
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

    console.log("RouteController created");
};


function RouteHelpController($scope, routeHelpChannel, flash) {
    $scope.directionsDisplay = new google.maps.DirectionsRenderer();
    $scope.directionsService = new google.maps.DirectionsService();
    $scope.searchRoute = function() {
        $scope.directionsDisplay.setMap(routeHelpChannel.gmap);

        var request = {
            origin: routeHelpChannel.From,
            destination: routeHelpChannel.To,
            travelMode: google.maps.TravelMode.DRIVING
        };


        $scope.directionsService.route(request, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                $scope.directionsDisplay.setDirections(result);
                flash.success = "Mark the stops of the onward trip along the plotted path";
            }
        });
    };
}
//This controller starts with a lat-lng and gets the user to define the name of the stop. It also performs reverse geocoding
//TODO: CBM to do rev geocoding
function StopController($scope, stopChannel, locationChannel) {
    var geocoder = new google.maps.Geocoder();
    console.log("Creating SC");

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
                console.log(results);
                $scope.stopDetail.address = results[0].formatted_address;
            }
        });

        console.log("Stop detail is %j", $scope.stopDetail);
    });

    $scope.saveStop = function() {
        //TODO Suprisingly only the new name remains. lat and long have vanished 
        stopChannel.publishStop($scope.stopDetail);
    };
}


//Service that communicates with the server. All communication with server should happen through functions defined in this service.
//TODO: Most of this looks repetitive. Simplify it.
GetThereAdminService = function($http) {
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
            console.log("ERROR " + JSON.stringify(data));
            if (_.isFunction(callback)) {
                callback(data);
            }
        };
    };
    services.forEach(function(svc) {
        switch (svc.method) {
            case "post":
                service[svc.name] = function(data, callback, errorCallback) {
                    console.log("Hitting URL %j", svc.path);
                    return $http.post(svc.path, data)
                        .success(getSuccess(callback))
                        .error(getError(errorCallback));
                };
                break;
            case "get":
                service[svc.name] = (function() {
                    var invoke = function(path, args, callback, errorCallback) {
                        var url = path;
                        args.forEach(function(arg) {
                            console.log(url);
                            url = url.replace(/:\w+/, arg);
                        });
                        console.log("Hitting URL %j", url);
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
                    this.bounds = new google.maps.LatLngBounds(
                        new google.maps.LatLng($scope.bounds.southwest.latitude, $scope.bounds.southwest.longitude), new google.maps.LatLng($scope.bounds.northeast.latitude, $scope.bounds.northeast.longitude));
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
        link : function($scope, element) {
            $timeout(function() {
            element[0].focus();
            },500);
        }
    };
};

dateMask = function($timeout) {
    return {
        restrict: 'A',
        link : function($scope, element) {
		console.log($(element[0]).val()=='');
		//if($(element[0]).val()=='')
			/*$(element[0]).focus(function() {
				if($(element[0]).val()=='')
					$(element[0]).val('__:__ am');
			});
			*/
			var patt = new RegExp("^([0-9]|([0-1][0-2])|0[0-9]):([0-9]|[0-5][0-9]) (am|pm)$");
			
			$(element[0]).blur(function() {
			var val = $(element[0]).val();
	
				if(!patt.test(val)) {
				alert('hello');
					$(element[0]).val('');
					$scope.$apply();
				}
			});
			
			$scope.validate = function() {
				
				var val = $(element[0]).val();
				console.log(val);
				if(!val || val == '')
					return;
				var testVal = null;
				var dummy = '11:11 am';
				testVal = val + dummy.substring(val.length);
				console.log(testVal);
				
				if(!patt.test(testVal)) {
					console.log(false);
					$(element[0]).val(val.substring(0, val.length-1));
					$scope.validate();
				} else {
					console.log(true);
					if(val.length==2)
						$(element[0]).val(val+":");
					else if(val.length==5)
						$(element[0]).val(val+" ");
					else if(val.length==7)
						$(element[0]).val(val+"m");
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
    var adminApp = angular.module('adminApp', ['ngSanitize', 'ui.bootstrap', "google-maps".ns(), "ui.tree", "ui.select", 'ngAnimate', 'ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav', 'ui.grid.autoResize', 'ui.grid.selection'
        //, 'MessageCenterModule'
		,'ui.layout'
        , 'angular-flash.service', 'angular-flash.flash-alert-directive'
		,'cgBusy'
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
    adminApp.controller('RouteController', ['$scope', 'getthereAdminService', 'stopChannel', 'locationChannel', 'routeHelpChannel'
        //, messageCenterService
        , 'flash', 'GoogleMapApi'.ns(), RouteController
    ]);

    adminApp.filter('service', ServiceFilter);
    adminApp.controller('RouteHelpController', RouteHelpController);
    adminApp.controller('StopController', StopController);
    adminApp.service('stopChannel', StopChannelService);
    adminApp.service('locationChannel', LocationChannelService);
    adminApp.service('routeHelpChannel', RouteHelpChannelService);
    adminApp.directive('nyFleetChoice', NYFleetChoiceDirective);
    adminApp.directive('nyUiGmapControl', NYUIGmapControlDirective);
    adminApp.factory('getthereAdminService', GetThereAdminService);
    adminApp.filter('reverse', ReverseFilter);
    adminApp.filter('unpaired', UnpairedStopsFilter);
    adminApp.directive('autofocus', autofocus); 
	adminApp.directive('dateMask', dateMask); 
}());
