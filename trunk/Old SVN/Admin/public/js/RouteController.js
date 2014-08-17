var adminApp = angular.module('adminApp', ['ui.bootstrap', 'ngTable', "ngModal", "ui.tree"]);

adminApp.config(function(ngModalDefaultsProvider) {
    return ngModalDefaultsProvider.set({
        closeButtonHtml: "<i class='fa fa-times'></i>"
    });
});
//.controller('RouteController',

function RouteController
//function
($scope, $http, $log, $parse, $filter, ngTableParams) {

    //This represents the route currently being worked upon
    $scope.routeDetail = {
        routeId: -1,
        stops: [],
        timings: {},
        segments: [], //duration between stops. If there are N stops, there are N segments, first segment is 0,
        onwardTrips: [],
        returnTrips: []
    }; //end routedeta

    /*
	$scope.onwardGridOptions = { data: 'routeDetail.onwardTrips', columnDefs: [] };
	*/
    $scope.pushStop = function(stop) {
        $scope.routeDetail.stops.push(stop);
        //$scope.onwardGridOptions.columnDefs.push
    };
    //alert('creating controller');
    //to create a $scope.stopDetail record instead of mydata
    $scope.stopDetail = {
        stopName: "",
        fullAddress: ""
    };

    $scope.myData = {
        //        link: "http://google.com",
        modalShown: false //,
        //        hello: 'world',
        //        foo: 'bar'
    };
    //This represents all the routes in the system
    $scope.routes = [];

    $scope.tableParams = new ngTableParams({
        page: 1, // show first page
        count: 10, // count per page
        filter: {
            from: '' // initial filter
            ,
            to: ''
        },
        sorting: {
            from: 'asc' // initial sorting
        }
    }, {
        //total: 15, // length of data
        getData: function($defer, params) {
            // use build-in angular filter
            var filteredData = params.filter() ?
                $filter('filter')($scope.routes, params.filter()) :
                $scope.routes;
            var orderedData = params.sorting() ?
                $filter('orderBy')(filteredData, params.orderBy()) :
                $scope.routes;

            params.total(orderedData.length); // set total for recalc pagination
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });

    $http.get('/api/routes')
        .success(function(data) {
            //alert(data);

            $scope.routes = data;
            $scope.tableParams.settings.total = data.length;
            $scope.tableParams.reload();

            //console.log(data);
        })
        .error(function(data) {
            alert('Error: $scope.routes has missing parameters in app.js' + data);
        });

    $scope.rearrangeStops = function() {
        var arrangedStops = $("#sortable").sortable("toArray");
        $scope.$apply(function() {
            $scope.routeDetail.stops = $scope.routeDetail.stops.sort(
                function(a, b) {
                    return arrangedStops.indexOf(a.stopId.toString()) - arrangedStops.indexOf(b.stopId.toString());
                });
        });
        $scope.routeDetail.stops.segments = [];
    }

    $scope.newRoute = function() {
        //		$scope.$apply(function(){
        //$scope.routeDetail = { state: 'new', stops : []}; //Initialize the route
        $scope.routemap.markers.forEach(function(marker) {
					var match = _.find($scope.routeDetail.stops,function(stop) { 
					return stop.stopId == marker['id'];});
                    if ( match != undefined) {
                        marker.setIcon("bus.png");
						}

                }); 
		$scope.routemap.cleanRoute();
		
        $scope.routeDetail.routeId = 0; //Initialize the route
        $scope.routeDetail.stops = [];
        $scope.routeDetail.timings = {};
		$scope.routeDetail.tempTripId = 0;

        //		});
    };
	
	$scope.extendRoute = function() {
		$scope.routeDetail.routeId = 0; //Initialize the route
		$scope.routeDetail.timings = {};
		$scope.routeDetail.tempTripId = 0;
	
	}
	
	$scope.deQueue = function() {
		var popped = $scope.routeDetail.stops.pop();
		console.log("Removed this element: %j ", popped);
		//TODO change deque stop from red to blue 
		};
	
    $scope.saveRoute = function() {
        $scope.rearrangeStops();
        $http.post('/api/routes', $scope.routeDetail)
            .success(function(data) {

                //$scope.formData = {}; // clear the form so our user is ready to enter another
                //$scope.$apply( function(){
                $scope.routes.push(data);
                $scope.tableParams.settings.total = $scope.tableParams.settings.total + 1;
                $scope.tableParams.reload();

                //});
            })
            .error(function(data) {
                console.log('Error: save route function error' + data);
            });
    };
	
    $scope.deleteRoute = function() {};



	$scope.drawRoute = function() {
		$scope.routemap.cleanRoute();
		var wayStops = _.sample(_.rest($scope.routeDetail.stops,0), 6) ;
		var wayPts = _.map(wayStops, function(stop){
				return {location: new google.maps.LatLng(stop.lat, stop.lng)};
			});
	    $scope.routemap.drawRoute({
            origin: [$scope.routeDetail.stops[0].lat, $scope.routeDetail.stops[0].lng],
            destination: [$scope.routeDetail.stops[$scope.routeDetail.stops.length-1].lat, $scope.routeDetail.stops[$scope.routeDetail.stops.length-1].lng],
            travelMode: 'driving',
            strokeColor: '#336699',
            strokeOpacity: 0.6,
            strokeWeight: 6
        });
	};
    $scope.getRoute = function(route_id) {
        $scope.routemap.markers.forEach(function(marker) {
            marker.setIcon("bus.png");
        });
		$scope.routemap.cleanRoute();
		$scope.routeDetail.stops = [];
		$scope.routeDetail.reversestops = [];
        $scope.routeDetail.timings = {};
        //CBM to make this
        //alert('Route ID of the selected route is : ' +route_id);
        $http.get('/api/routes/' + route_id)
            .success(function(data) {
                //$scope.$apply( function(){
                $scope.routeDetail = data;
                //console.log(data);

				$scope.routemap.markers.forEach(function(marker) {

					var match = _.find($scope.routeDetail.stops,function(stop) { return stop.stopId == marker['id'];}) ;
                    if ( match != undefined) {
                        marker.setIcon("busred.png");
						}

                }); 
				$scope.routeDetail.stages = [];
				$scope.routeDetail.stages.push({title: 'Stage1', stops: $scope.routeDetail.stops});
				
				$scope.drawRoute();
				

                var trips = Object.keys($scope.routeDetail.timings);
                $scope.routeDetail.onwardTrips = trips.filter(function(elt) {
                    return $scope.routeDetail.timings[elt].direction == 0;
                });
				
                $scope.routeDetail.returnTrips = trips.filter(function(elt) {
                    return $scope.routeDetail.timings[elt].direction == 1;
                });
				$scope.routeDetail.reversestops = $scope.routeDetail.stops;
				

            })
            .error(function(data) {
                console.log('Error: getroute function error' + data);
            });
    };

    $scope.showAllStops = function(routemap) {
        $scope.routemap = routemap;
        $http.get('/api/stops')
            .success(function(data) {
                $scope.stops = data;
                var icon = new google.maps.MarkerImage("bus.png");
                //alert(data.toSource());
                $scope.stops.forEach(function(stop) {
                    var marker = routemap.addMarker({
                        lat: stop.lat,
                        lng: stop.lng,
                        title: stop.name,
                        icon: icon,
                        clickable: true,
                        click: function(e) {
                            var flag = 0;
                            if (flag == 1) {
                                console.log('Deselect');
                            } else {
                                this.setIcon("busred.png");
                                console.log(stop.stopId);
                                $scope.$apply(function() {
                                $scope.pushStop({
                                        stopId: stop.stopId,
                                        name: stop.name,
                                        lat: stop.lat,
                                        lng: stop.lng
                                    });

                                    var flag = 1;
                                });
                            }
                        }
                    });
                    marker['id'] = stop.stopId;
                });
            })
            .error(function(data) {
                console.log(data);
            });

    };


    $scope.logClose = function() {
        console.log('close!');
    };

    $scope.saveStop = function() {

        $scope.myData.modalShown = false;
        var stop = {
            name: $scope.stopDetail.name,
            lat: $scope.stopDetail.lat,
            lng: $scope.stopDetail.lng,

        };
        $http.post('/api/stops', $scope.stopDetail)
            .success(function(data) { //Only if we succeed in adding to DB, we will add it to the map
                $scope.routemap.addMarker(stop);
                //If we are working on a route
                if ($scope.routeDetail.routeId != -1) {
                    //							$apply(function() {
                    $scope.routeDetail.pushStop(stop);
                    //							});
                }
                //markers.push(marker);
            })
            .error(function(data) {
                alert(data);
                console.log('Error: ' + data);
            });

    };
    $scope.addStop = function(routemap, lat, lng) {

        //$scope.$apply( function(){
        $scope.routemap = routemap;
        $scope.stopDetail.name = "";
        $scope.stopDetail.lat = lat;
        $scope.stopDetail.lng = lng;

        GMaps.geocode({
            lat: lat,
            lng: lng,
            callback: function(results, status) {
                $scope.$apply(function() {
                    console.log("Complete address: %j", results[0]);
                    var localities = results[0].address_components.filter(function(component) {
                        return component.types.indexOf("route") >= 0;
                    });

                    $scope.stopDetail.name = localities.map(function(loc) {
                        return loc.long_name;
                    }).join("-");
                    $scope.stopDetail.fullAddress = results[0].formatted_address;
                    $scope.myData.modalShown = true;
                });

            }

        });
    }; //addStop
	minimum = 0;
    $scope.addTrip = function() {
        var tempTripId = -1;
		tempTripId = minimum - 1;
		minimum = tempTripId;
			//if temptripid
        //var trips = Object.keys($scope.routeDetail.timings);
        var trip = {
            direction: 0
        };
        $scope.routeDetail.stops.forEach(function(stop) {
            trip[stop.stopId] = '00:00:00';
        });
		
        $scope.routeDetail.timings[tempTripId] = trip;
        $scope.routeDetail.onwardTrips.push(tempTripId);
		//console.log(tempTripId);
    }; //addTrip

    $scope.autoCompleteTrip = function(tripId) {
        if ($scope.routeDetail.stops.length == 0) { //If segments are not available, use default value
            var j = 0;
            $scope.routeDetail.stops.forEach(function(stop) {
                if (j == 0)
                    $scope.routeDetail.stops.seg[j++] = 0;
                else
                    $scope.routeDetail.stops.seg[j++] = 2; //temporary to 2 minutes
            });
		}

        var i = 0;
        var lastTime;
        $scope.routeDetail.stops.forEach(function(stop){
            if (i == 0) {
                lastTime = Date.parse($scope.routeDetail.timings[tripId][stop.stopId]);
			}
			else{
			$scope.routeDetail.timings[tripId][stop.stopId] = lastTime.addMinutes($scope.routeDetail.stops[i-1].seg).toString('HH:mm:ss');
			}
			i++;
        });
    };
	
	$scope.addreturnTrip = function() {
        var tempTripId = -1;
        tempTripId = minimum - 1;
		minimum = tempTripId;
        var trip = {
            direction: 1
        };
        $scope.routeDetail.stops.forEach(function(stop) {
            trip[stop.stopId] = '00:00:00';
        });
	
        $scope.routeDetail.timings[tempTripId] = trip;	
        $scope.routeDetail.returnTrips.push(tempTripId);
	}; //addReturnTrip
	
	$scope.autoCompletereturnTrip = function(tripId) {
        if ($scope.routeDetail.stops.length == 0) { //If segments are not available
            
            var j = 0;
            $scope.routeDetail.stops.forEach(function(stop) {
                if (j == 0)
                    $scope.routeDetail.stops.seg[j++] = 0;
                else
                    $scope.routeDetail.stops.seg[j++] = 2; //temporary to 2 min
            });

        }

        var i = $scope.routeDetail.stops.length;
		var totalTime = 0; //minutes
        var lastTime;
		for(var j =  $scope.routeDetail.stops.length-1; j>=0; j--){
		var stop = $scope.routeDetail.stops[j];
		if (j == $scope.routeDetail.stops.length-1) {
                lastTime = Date.parse($scope.routeDetail.timings[tripId][stop.stopId]);
			}
				//var stop = $scope.routeDetail.stops[j];
				console.log("%j", stop.stopId);
				$scope.routeDetail.timings[tripId][stop.stopId] = lastTime.addMinutes($scope.routeDetail.stops[j-1].seg).toString('HH:mm:ss');
		}
       /* $scope.routeDetail.stops.forEach(function(stop){
		console.log("%j", stop.stopId);
            if (i == $scope.routeDetail.stops.length) {
                lastTime = Date.parse($scope.routeDetail.timings[tripId][stop.stopId]);
				//console.log("lasttime %j",lastTime);
            }
			$scope.routeDetail.timings[tripId][stop.stopId] = lastTime.addMinutes($scope.routeDetail.stops[i-1].seg).toString('HH:mm:ss');
            i--;
		});*/
    };
}; //RouteController

adminApp.filter('reverse', function() {
    return function(items) {
        return items.slice().reverse();
    };
});
