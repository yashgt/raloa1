function initializeApp($rootScope) {
    //Initialize the app
}

tempId = 2; //temporary
var STOP_ICON = "/images/bus_stop.png";
var PEER_STOP_ICON = "/images/busred.png";
var ROUTE_STOP_ICON = "/images/busred.png";
var ROUTE_STOP_REV_ICON = "/images/busred.png";
var ACTIVE_STOP_ICON = "/images/bus_stop.png";
var LINKABLE_STOP_ICON = "/images/bus_stop.png";

function RouteController($scope, getthereAdminService, stopChannel, locationChannel, routeHelpChannel
    //, messageCenterService
    , flash, GoogleMapApi) {

    $scope.fleet = {
    };

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
        stops: [{
            id: 1,
            latitude: 0,
            longitude: 0
        }],
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
		peerStop.id = -peerStop.id;
		peerStop.icon = PEER_STOP_ICON ;
		peerStop.peerStopId = peerStop.id;
		
		console.log("Peer stop %j", peerStop);
		$scope.fleetDetail.stops.push( peerStop	);
		//});
        //Let the stop show a different icon
        //Allow user to click another stop. Once done, the two stops are brothers of each other.
    };
    replaceStop = function(stop) {
        //In the current route, replace the stop with its sibling
    };

    
    $scope.clearRoute = function(){
    	if($scope.routeDetail !=undefined){
        	if ($scope.routeDetail.stages !=undefined ){
        		$scope.routeDetail.stages.forEach( function(stage){
        			if(stage.stops != undefined){
        			stage.stops.forEach(function(stop) {					
        				stop.icon = STOP_ICON ;
        			});
        			}    		
        		});
        	}	
        	}

    		$scope.routeDetail = { routeId:-1, stages:[] };
    };
    
    //Route creation region
    $scope.closeRoute = function(){

		$scope.clearRoute();
		$scope.gridRoutesApi.selection.clearSelectedRows();
		
    };
    $scope.newRoute = function(){
    	$scope.closeRoute();
		
    	$scope.routeDetail.routeId = 0 ; 
    };
    
    $scope.saveRoute = function(){
    	getthereAdminService.saveRoute($scope.routeDetail, function(route){
    		
    		
    		if($scope.routeDetail.routeId==0){
    			$scope.routeDetail.routeId = route.routeId ;
				$scope.routeDetail.isDirty = false ;
    			$scope.fleetDetail.routes.push(route);
    			$scope.gridRoutesApi.selection.selectRow(route);
    		}
    		
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
        }, {
            className: 'context_menu_item',
            eventName: 'replace_stop',
            label: 'Replace stop',
            handler: replaceStop,
            condition: $scope.routeDetail!=undefined && $scope.routeDetail.routeId >= 0
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
				routeHelpChannel.gmap = $scope.gmap ; 
            }
            console.log("Tiles loaded");
            $scope.setContextMenu();
            //$scope.setRouteHelperBounds();
        }
    };
    $scope.markerOptions = {
        draggable: true,
        title: 'Label1'
    };

    $scope.addStopToStage = function(fleetstop, routestage) {
    	if(fleetstop!=undefined){
			fleetstop.icon = ROUTE_STOP_ICON ;
			
			$scope.scheduleOptions.columnDefs.push({
        name: fleetstop.name
        , displayName: fleetstop.name
        , field: ""+ fleetstop.id + ""

		//,headerCellClass: 'stop_name'
    });
		}
		routestage.stops.push(fleetstop);
		
    	
    };

    //SCHEDULE REGION
    $scope.getRoute = function(routeId) {
        getthereAdminService.getRoute(routeId, function(routeDetail) {
        	$scope.routeDetail.routeId = routeId ;
        	
            $scope.scheduleOptions.columnDefs.splice(6, 100);
			
			
			routeDetail.stages.forEach( function(stage){
				var routestage = {title:stage.title, stageId: stage.stageId, stops: []} ;
					
				stage.stops.forEach(function(stop) {					
					var fleetstop = _.find($scope.fleetDetail.stops, function(fleetstop) { return fleetstop.id==stop.id ; });
					
					$scope.addStopToStage(fleetstop, routestage);
				});
				
				$scope.routeDetail.stages.push( routestage );
			});
			$scope.routeDetail.timings = routeDetail.timings;
			$scope.scheduleOptions.data = $scope.routeDetail.timings;

        });
    };
	
	$scope.scheduleActions = {
		deleteTrip : function(trip){
			console.log(trip);
			var idx = _.findIndex($scope.routeDetail.timings, {tripId: trip.tripId});
			$scope.routeDetail.timings.splice(idx,1);
			$scope.routeDetail.isDirty = true;
			
		}
	};

    $scope.scheduleOptions = {
        enableSorting: false,
        enableCellEdit: true,
        enableColumnMenus: false,
        columnDefs: [
			{
				name:'Delete'
				, displayName : ''
				, cellTemplate:'<button class="btn btn-danger" ng-click="getExternalScopes().deleteTrip(row.entity)">Delete</button>'
			},
			{
                name: 'ID',
                field: 'tripId'
				, enableCellEdit: false
            },
			{
				editableCellTemplate : 'ui-grid/dropdownEditor'
				, name: 'Service'
				, field: 'serviceId'				
				, cellFilter: 'service'
				, editDropdownIdLabel : 'serviceId'
				, editDropdownValueLabel : 'serviceName'
				, editDropdownOptionsArray : []
			}
            ,{
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
                field: 'frequency_end_time'	
				, pinnedLeft:true			
            }
        ]
    };

    //SCHEDULE REGION ENDS
	
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
        }, 
		{   
			name: 'From',
            field: 'st'
        },
		{   
			name: 'To',
            field: 'en'
        }
		],
		onRegisterApi: function(gridApi) {
			$scope.gridRoutesApi = gridApi;
			
			gridApi.selection.on.rowSelectionChanged($scope,function(row){
			console.log(row);
			$scope.clearRoute();
			if(row.isSelected){
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
        }]
        ,
        onRegisterApi: function(gridApi) {
            //set gridApi on scope
            $scope.gridCalendarApi = gridApi;
            gridApi.rowEdit.on.saveRow($scope, $scope.saveCalendar);
        }
    };

    //CALENDAR REGION ENDS
    $scope.addStopToRoute = function(stop){
    	if($scope.routeDetail.routeId>=0){
			if ( $scope.routeDetail.stages.length == 0 ){
				$scope.addNewStage();
				//$scope.routeDetail.stages[$scope.routeDetail.stages.length -1].title = stop.name ; //TODO capture the village name
			}
			
			var lastStage = $scope.routeDetail.stages[$scope.routeDetail.stages.length - 1] ;
			$scope.addStopToStage(stop, lastStage);
			$scope.routeDetail.isDirty = true;
    }
    };
    $scope.delStopFromRoute = function(stop){
    	if($scope.routeDetail.routeId>=0){
			var stg = _.find($scope.routeDetail.stages, function(stage){
				return _.contains(stage.stops, stop);
			});
			
			stg.stops.splice(_.indexOf(stg.stops,stop), 1); 
			
			stop.icon = STOP_ICON ;

			$scope.routeDetail.isDirty = true;
    	}
    };
    
    
    $scope.stopEvents = {
    		click: function(marker, eventName, model){
    				var stg = _.find($scope.routeDetail.stages, function(stage){
    					return _.contains(stage.stops, model);
    				});
    				if(stg==undefined){ //The stop does not already exist in the route
    					$scope.addStopToRoute(model);
    				}
    				else{
    					$scope.delStopFromRoute(model);
    				}
    		},
        rightclick: function(marker, eventName, model) {
            console.log("Event:" + eventName + " Marker:" + marker, model);
            $scope.stopContextMenu.showOnMarker(marker.position, model);
            console.log("Event:" + eventName + " Model:" + JSON.stringify(model));
        },
        dragend: function(marker, eventName, model) {
            console.log("Stop is now " + JSON.stringify(model));
			
            $scope.saveStop(model);
        }

    };
    $scope.configMap = function() {
        //$scope.gmap = $scope.map.control.getGMap() ;

        $scope.stageTreeOptions = {
            accept: function(sourceNode, destNodes, destIndex) {
                var srcType = sourceNode.$element.attr('data-type');
                var destType = destNodes.$element.attr('data-type');
                return srcType=="stop" && destType=="stage"; // only accept stop in stage 
            },
            dropped: function(event) {
                console.log(event);
				$scope.routeDetail.isDirty = true ;
            }
        };
        $scope.fleetChosen = function(fleet) {
            getthereAdminService.setCurrentFleet(fleet, function(fleet) {
                console.log("Setting fleet " + fleet);
                $scope.getFleetDetail(fleet.fleet_id);
            });

        };
        $scope.addNewStage = function() {        	
            var newObject = jQuery.extend({}, $scope.newStage);
            newObject.stops = [];
            if(newObject.title == ""){
            	newObject.title = "New Stage";
            }            
            
            $scope.routeDetail.stages.push(newObject);
            $scope.routeDetail.isDirty = true;
            $scope.newStage.title = "";
        };



    }; //end configMap


    $scope.addCalendar = function() {
        $scope.fleetDetail.calendars.push({
			serviceId : 0,
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


    //Region:Business Logic: This is the region that binds UI data to server data. This invokes business logic at the server to get things done at the server.
    //Get the details of the selected fleet
    $scope.getFleetDetail = function(fleetId) {
        getthereAdminService.getFleetDetail(fleetId, function(fleetDetail) {
            fleetDetail.stops.forEach(function(stop) {
                stop.icon = STOP_ICON;
                stop.options = {
                    draggable: true,
                    title: stop.name
                };
            });

            $scope.closeRoute();
            $scope.fleetDetail = fleetDetail;
            $scope.calendarOptions.data = $scope.fleetDetail.calendars;
			var svcCol = _.find($scope.scheduleOptions.columnDefs, function(col){ return col.name == "Service"; });
			svcCol.editDropdownOptionsArray = $scope.fleetDetail.calendars;
			calendars = $scope.fleetDetail.calendars ;
			$scope.routeListOptions.data = $scope.fleetDetail.routes;
        });
    };

    $scope.loadFleets = function() {
        getthereAdminService.loadFleets(function(fleets) {
            $scope.fleets = fleets;
        });
    };

    $scope.saveStop = function(stopDetail) {
        getthereAdminService.saveStop(stopDetail, function(id) {
            //flash("Stop " + stopDetail.name + " has been saved.");
            //messageCenterService.add('success', 'Stop added successfully');
            flash.success = 'Stop added successfully';
            if (stopDetail.id <= 0) {
            	var newStop = {
                        id: id,
                        name: stopDetail.name,
                        latitude: stopDetail.latitude,
                        longitude: stopDetail.longitude,
                        icon: STOP_ICON,
                        options: {
                            draggable: true,
                            title: stopDetail.name
                        }
                    };
				if(stopDetail.peerStopId != undefined)
				{
					stopDetail.icon = STOP_ICON ;
				}
				else{
					$scope.fleetDetail.stops.push(newStop);
				}
            }

            if ($scope.routeDetail.routeId >= 0) {
                $scope.addStopToRoute(newStop);
            }
			
            $scope.map.infoWindow.show = false;
			$scope.stopDetail = null; //The infowindow vanishes only when the model of the coords property is set to null
        });
    };

    
    //Region ends

    //TODO Do this based on the user's fleet
    $scope.loadFleets();
    GoogleMapApi.then(function(maps) {
        $scope.getFleetDetail(2);
        $scope.configMap();
    });
	
	console.log("RouteController created");
};


function RouteHelpController($scope, routeHelpChannel) {
	$scope.directionsDisplay = new google.maps.DirectionsRenderer();
	$scope.directionsService = new google.maps.DirectionsService();
    $scope.searchRoute = function() {		
		$scope.directionsDisplay.setMap(routeHelpChannel.gmap);
		
		var request = {
    origin:routeHelpChannel.From,
    destination:routeHelpChannel.To,
    travelMode: google.maps.TravelMode.DRIVING
  };
  

  $scope.directionsService.route(request, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      $scope.directionsDisplay.setDirections(result);
    }
  });
    };
}
//This controller starts with a lat-lng and gets the user to define the name of the stop. It also performs reverse geocoding
//TODO: CBM to do rev geocoding
function StopController($scope, stopChannel, locationChannel) {

    console.log("Creating SC");
    locationChannel.add(function(latLng) {
        $scope.stopDetail = {
            latitude: latLng.latitude,
            longitude: latLng.longitude,
            name: ""
        };
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
	var services = [
	                { name: 'saveRoute', path: '/api/route/', method: 'post' }
					, { name: 'setCurrentFleet', path: '/api/currentFleet/', method: 'post' }
					, { name: 'saveStop', path: '/api/stop/', method: 'post' }
					, { name: 'saveCalendar', path: '/api/calendar/', method: 'post' }
					, { name: 'getRoute', path: '/api/route/:routeId', method: 'get' }
					, { name: 'loadFleets', path: '/api/fleets/', method: 'get' }
					, { name: 'getFleetDetail', path: '/api/fleet/:fleetId', method: 'get' }
	                ];
	
    var service = {
	/*
        getRoute: function(routeId, callback) {
            //TODO fetch this from server
            $http.get('/api/route/' + routeId)
                .success(function(data) {
                    console.log("ROUTE %j", data);
                    callback(data);
                })
                .error(function(data) {
                    console.log("ROUTE ERROR %j", data);
                });

        },
        loadFleets: function(callback) {
            $http.get('/api/fleets')
                .success(function(data) {
                    callback(data);
                    //console.log(data);
                })
                .error(function(data) {
                    alert("ERROR" + data);
                });
        },
        getFleetDetail: function(fleetId, callback) {
            $http.get('/api/fleet/' + fleetId)
                .success(function(data) {
                    console.log(JSON.stringify(data));
                    callback(data);
                })
                .error(function(data) {
                    alert("ERROR" + data);
                });
        }
		*/

    };
    
    
    var getSuccess = function(callback){    	
    	return ( function(data){ 
    		console.log(JSON.stringify(data));
			callback(data);
    	} );
    };
    var getError = function(data){
    		console.log("ERROR " + JSON.stringify(data));
    };
    services.forEach( function(svc){
    	switch(svc.method){
    	case "post":
    		service[svc.name] = function(data, callback){
    			$http.post(svc.path, data)
    			.success(getSuccess( callback))
    			.error(getError);
    		};
    		break;
    	case "get":
			service[svc.name] = (function(){
				var invoke = function(path, args, callback){
					var url = path ;
					args.forEach(function(arg){
						console.log(url);
						url = url.replace(/:\w+/, arg);
					});
					console.log("Hitting URL %j", url);
					$http.get(url)
					.success(getSuccess(callback))
					.error(getError);
				};				
				var f;				
				switch((svc.path.match(/:/g) || []).length ){
					case 1:
						f = function(a1,callback){ invoke(svc.path, [a1], callback); }; break;
					default:
						f = function(callback){ invoke(svc.path, [], callback); }; break;
				}				
				return f;
			})();
    	default:
    		break;
    	}    	 
    });
    return service ;
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

RouteHelpChannelService = function(){
	this['From'] = undefined ;
	this['To'] = undefined;
};

//This service is used for conveying to other components that a location on the map has been chosen
LocationChannelService = function() {
    var callbacks = [];
    this.add = function(cb) {
        callbacks.push(cb);
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
		controller: function($scope, $element, $attrs, $transclude, routeHelpChannel){			
			RouteSearchOptions = function(key) {
			
			this.resetBounds = function(){
			        this.bounds = new google.maps.LatLngBounds(
					new google.maps.LatLng($scope.bounds.southwest.latitude, $scope.bounds.southwest.longitude), new google.maps.LatLng($scope.bounds.northeast.latitude, $scope.bounds.northeast.longitude));
			};

		this.resetBounds();
        this.markers = [];

		this.location = undefined ;
        this.events = {
            places_changed: function(searchBox) {
                var places = searchBox.getPlaces();
				this.location = undefined;
				routeHelpChannel[key] = undefined ; 

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

                    bounds.extend(place.geometry.location);
									this.location= place.geometry.location ;
					routeHelpChannel[key] = place.geometry.location ;				

				}

                $scope.gmap.fitBounds(bounds);
				

            }
        };
    };

			
			    $scope.placeFromOptions = new RouteSearchOptions('From');
    $scope.placeToOptions = new RouteSearchOptions('To');
			
			//this.resetBounds();
			$scope.$watch('bounds', function(bounds){
				if(!(bounds==undefined)){
					$scope.placeFromOptions.resetBounds();
					$scope.placeToOptions.resetBounds();
				}
			});
		
			
		
		}//end controller

        ,templateUrl: 'ny-gmap-search.html'
    }
};

NYFleetChoiceDirective = function() {
    return {
        restrict: 'E',
        replace: false,
        scope: {
            nyFleets: '=',
            nyFleet: '=',
            nyChanged: '='
        },		
        templateUrl: 'ny-fleet-choice.html'
    };
};

var calendars = [] ;
function ServiceFilter() {
  
  return function(input) {
    if (!input){
      return '';
    } else {
		var svc = _.find(calendars, function(calendar){ return calendar.serviceId==input; }); 
		return svc.serviceName ;
    }
  };
}

function ReverseFilter() {
  return function(items) {
	if (!angular.isArray(items)) return false;
    return items ? items.slice().reverse() : [];
  };
}

(function() {
    var adminApp = angular.module('adminApp', ['ngSanitize', 'ui.bootstrap', "google-maps".ns(), "ui.tree", "ui.select", 'ngAnimate', 'ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav', 'ui.grid.autoResize', 'ui.grid.selection'
        //, 'MessageCenterModule'
        , 'angular-flash.service', 'angular-flash.flash-alert-directive'
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
	adminApp.filter('reverse', ReverseFilter );
}());
