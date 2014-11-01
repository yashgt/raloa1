function initializeApp($rootScope) {
    //Initialize the app
}

tempId = 2; //temporary
var STOP_ICON = "/images/bus_stop.png";
var ACTIVE_STOP_ICON = "/images/bus_stop.png";
var LINKABLE_STOP_ICON = "/images/bus_stop.png";

function RouteController($scope, getthereAdminService, stopChannel, locationChannel, routeHelpChannel
    //, messageCenterService
    , flash, GoogleMapApi) {

    $scope.fleets = [{
        fleet_name: 'KTC',
        fleet_id: 3,
        level: 2
    }];
    $scope.fleet = {
        selected: undefined
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

    $scope.routeDetail = {
        //stops : [],
        stages: []
    };
    $scope.routeDetail.stages.push({
        title: 'Stage1',
        editing: false,
        stops: [{
            id: 1,
            name: 'S1'
        }, {
            id: 2,
            name: 'S2'
        }]
    });
    $scope.routeDetail.stages.push({
        title: 'Stage2',
        editing: false,
        stops: [{
            id: 3,
            name: 'S3'
        }, {
            id: 4,
            name: 'S4'
        }]
    });
    $scope.routeSegments = [];
    $scope.routeSegments.push({
        distFromStart: 0
    });
    $scope.routeSegments.push({
        distFromStart: 1
    });
    $scope.routeSegments.push({
        distFromStart: 2
    });
    $scope.routeSegments.push({
        distFromStart: 3
    });

    /*
	$scope.stopDetail = {
		latitude:0,
		longitude:0,
		stopName:"",
		address:""
	};*/

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
        //All user to click on a stop on the opposite side of the road

        //Let the stop show a different icon
        //Allow user to click another stop. Once done, the two stops are brothers of each other.
    };
    replaceStop = function(stop) {
        //In the current route, replace the stop with its sibling
    };


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
            condition: $scope.routeDetail.routeId >= 0
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

    //ROUTE SEARCH REGION
	



    function RouteSearchOptions(key) {
        //$scope.placeFromOptions = {
        this.bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng($scope.fleetDetail.bounds.southwest.latitude, $scope.fleetDetail.bounds.southwest.longitude), new google.maps.LatLng($scope.fleetDetail.bounds.northeast.latitude, $scope.fleetDetail.bounds.northeast.longitude));
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
				
                //_.each(places, function(place) {
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
                //});
				}

                $scope.gmap.fitBounds(bounds);
				

            }
        };
    }
    $scope.placeFromOptions = new RouteSearchOptions('From');
    $scope.placeToOptions = new RouteSearchOptions('To');
    //ROUTE SEARCH REGION ENDS

    //SCHEDULE REGION
    $scope.getRoute = function(routeId) {
        getthereAdminService.getRoute(routeId, function(routeDetail) {
            $scope.scheduleOptions.columnDefs.splice(4, 10);
            routeDetail.stops.forEach(function(stop) {
                $scope.scheduleOptions.columnDefs.push({
                    name: stop.name,
                    displayName: stop.name,
                    field: "" + stop.id + ""
                });
            });
            $scope.scheduleOptions.data = routeDetail.timings;

        });
    };

    $scope.scheduleOptions = {
        enableSorting: false,
        enableCellEdit: true,
        enableColumnMenus: false,
        columnDefs: [{
                name: 'ID',
                field: 'tripId'
            },

            {
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
            }
        ]
    };

    //SCHEDULE REGION ENDS
	
	//ROUTELIST REGION
	
	//ROUTELIST REGION ENDS

    //CALENDAR REGION
    $scope.saveCalendar = function(rowEntity) {

        $scope.gridApi.rowEdit.setSavePromise($scope.gridApi.grid, rowEntity, getthereAdminService.saveCalendar(rowEntity));

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
            $scope.gridApi = gridApi;
            gridApi.rowEdit.on.saveRow($scope, $scope.saveCalendar);
        }
    };

    //CALENDAR REGION ENDS

    $scope.stopEvents = {
        rightclick: function(marker, eventName, model) {
            console.log("Event:" + eventName + " Marker:" + marker);
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
                var srcType = sourceNode.$element;
                var destType = destNodes.$element.attr('data-type');
                //console.log("Source %j Dest %j", srcType, destType);
                return true; // only accept the same type
            },
            dropped: function(event) {
                console.log(event);
                /* The data model has already been changed
        var sourceNode = event.source.nodeScope;
        var destNodes = event.dest.nodesScope;
        // update changes to server
        if (destNodes.isParent(sourceNode)
          && destNodes.$element.attr('data-type') == 'category') { // If it moves in the same group, then only update group
          var group = destNodes.$nodeScope.$modelValue;
          //group.save();
        } else { // save all
          $scope.saveGroups();
        }
		*/
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
            $scope.routeDetail.stages.push(newObject);
            $scope.newStage.title = "New Stage";
        };



    }; //end configMap
    $scope.searchRoute = function() {};
    $scope.clearRoute = function() {};

    $scope.addCalendar = function() {
        $scope.fleetDetail.calendars.push({
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
    $scope.getRouteDetail = function(routeId) {
        $scope.routeDetail = getthereAdminService.getRoute(routeId);
        //TODO get from web service
        //$scope.routeDetail.stops = [];
    };

    //Get the details of the selected fleet
    //TODO: CBM fit this function in the pattern that we have defined
    $scope.getFleetDetail = function(fleetId) {
        //TODO get from web service(node.js)

        getthereAdminService.getFleetDetail(fleetId, function(fleetDetail) {
            fleetDetail.stops.forEach(function(stop) {
                stop.icon = STOP_ICON;
                stop.options = {
                    draggable: true,
                    title: stop.name
                };
            });


            //alert(JSON.stringify(fleetDetail));
            $scope.fleetDetail = fleetDetail;
            $scope.calendarOptions.data = $scope.fleetDetail.calendars;

            //$scope.setRouteHelperBounds();
        });

        /*
		$scope.fleetDetail = {
		center : {latitude:15.4989, longitude:73.8278} ,
		zoom : 11,
		bounds : {northeast:{latitude:15.855126, longitude:74.421425} , southwest:{latitude:14.867264, longitude:73.622169}},
		stops : [{id:1, latitude:15.4989, longitude:73.8278, icon:'/images/bus_stop.png'}],
		routes : []		
		};
		*/
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
                $scope.fleetDetail.stops.push({
                    id: id,
                    latitude: $scope.stopDetail.latitude,
                    longitude: $scope.stopDetail.longitude,
                    icon: STOP_ICON,
                    options: {
                        draggable: true,
                        title: $scope.stopDetail.name
                    }
                });
            }

            if ($scope.routeDetail <= 0) {
                $scope.addStopToRoute();
            }
            $scope.map.infoWindow.show = false;
        });
    };

    $scope.addStopToRoute = function() {};

    $scope.remove = function() {
        $scope.fleetDetail.stops = [];
    };
    //Region ends

    //TODO Do this based on the user's fleet
    $scope.loadFleets();
    GoogleMapApi.then(function(maps) {
        $scope.getFleetDetail(2);
        $scope.configMap();
    });
};


function RouteHelpController($scope, routeHelpChannel) {
	this.directionsDisplay = new google.maps.DirectionsRenderer();
	this.directionsService = new google.maps.DirectionsService();
    $scope.searchRoute = function() {		
		directionsDisplay.setMap(routeHelpChannel.gmap);
		
		var request = {
    origin:routeHelpChannel.From,
    destination:routeHelpChannel.To,
    travelMode: google.maps.TravelMode.DRIVING
  };
  

  directionsService.route(request, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(result);
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
    return {
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

        saveCalendar: function(calendar) {
            return $http.post('/api/calendar', calendar);
        },
        getRoutes: function() {},
        saveRoute: function(routeDetail) {},
        saveStop: function(stopDetail, callback) {
            console.log("Servicing %j", stopDetail);
            $http.post('/api/stop', stopDetail)
                .success(function(data) {
                    console.log("Received ID %j for the stop", data.id);
                    callback(data.id);
                })
                .error(function(data) {});
        },
        setCurrentFleet: function(fleet, callback) {
            $http.post('/api/currentFleet', fleet)
                .success(function(data) {
                    callback(fleet);
                })
                .error(function(data) {});
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

    };
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
    this.link = function(scope, element, attrs) {
        scope.markers = [];

        //TODO s(scope.map, element, scope.bounds, scope.markers);

        /*
			scope.$watch('bounds', function(bounds){
				console.log("Bounds %j", bounds);
				
				if(!(bounds==undefined)){
					s(scope.map, element, bounds, scope.markers);
				}
			});
			*/

        return {
            pre: function(tElement, tAttrs, transclude) {},
            post: function(scope, iElement, iAttrs, controller) {}
        };

    };
    return {
        restrict: 'E',
        replace: false,
        scope: {
            map: '=',
            bounds: '='
        },
        compile: function(tEle, tAttrs, transcludeFn) {
            console.log(tEle.html());
            return this.link;
        },
        //link: this.link ,
        /*
		controller: function($scope, $element, $attrs, $transclude){
			
			
			
			//this.resetBounds();
			$scope.$watch('bounds', function(bounds){
				console.log("Bounds %j", bounds);
				
				if(!(bounds==undefined)){
					this.resetBounds();
				}
			});
		
			
		
		},*/ //end controller

        template: '\
				<script type="text/ng-template" id="placefrom.tpl.html"><input id="from-place" class="controls" type="text" placeholder="Search start point"></input></script>\
				<script type="text/ng-template" id="placeto.tpl.html"><input id="to-place" class="controls" type="text" placeholder="Search end point"></input></script>\
				<script type="text/ng-template" id="routesrch.tpl.html"><button class="controls" ng-click="searchRoute()" >Search</button></script>\
				<ui-gmap-map-control template="placefrom.tpl.html" position="top-right" position="TOP_LEFT"></ui-gmap-map-control>\
				<ui-gmap-map-control template="placeto.tpl.html" position="top-right" position="TOP_LEFT"></ui-gmap-map-control>\
				<ui-gmap-map-control template="routesrch.tpl.html" position="top-right" position="TOP_LEFT"></ui-gmap-map-control>'
        /*		
		template: '\<input id="from-place" class="controls" type="text" placeholder="Search start point"></input>\
				<input id="to-place" class="controls" type="text" placeholder="Search end point"></input>\
				<button class="controls" ng-click="searchRoute()" >Search</button>'		
				*/
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
        template: '<select ng-model="nyFleet" ng-options="fleet.fleet_name for fleet in nyFleets" ng-change="nyChanged(nyFleet)"></select>'
        /*
		template: '<ui-select ng-model="nyFleet.selected" theme="selectize" ng-disabled="disabled" style="width: 300px;">\
    <ui-select-match placeholder="Select or search fleet">{{$select.selected.fleet_name}}</ui-select-match>\
    <ui-select-choices repeat="fleet in nyFleets | filter: $select.search" >\
      <span ng-bind-html="fleet.fleet_name | highlight: $select.search" ng-class="fleet.level"></span>\
    </ui-select-choices>\
</ui-select>'
*/
        //templateURL: 'ny-fleet-choice.html'
    };
};

(function() {
    var adminApp = angular.module('adminApp', ['ui.bootstrap', "google-maps".ns(), "ui.tree", "ui.select", 'ngAnimate', 'ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav', 'ui.grid.autoResize'
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
    adminApp.controller('RouteHelpController', RouteHelpController);
    adminApp.controller('StopController', StopController);
    adminApp.service('stopChannel', StopChannelService);
    adminApp.service('locationChannel', LocationChannelService);
	adminApp.service('routeHelpChannel', RouteHelpChannelService);
    adminApp.directive('nyFleetChoice', NYFleetChoiceDirective);
    adminApp.directive('nyUiGmapControl', NYUIGmapControlDirective);
    adminApp.factory('getthereAdminService', GetThereAdminService);
}());
