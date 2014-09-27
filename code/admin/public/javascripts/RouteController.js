function initializeApp($rootScope){
	//Initialize the app
}

tempId = 2; //temporary

function RouteController
($scope, getthereAdminService, channel, locationChannel) {
	
	$scope.fleets = [ 'KTC', 'Private', 'River Navigation'];
	
	channel.add(function(stopDetail){ //Invoked by DI when a Stop is defined
		$scope.stopDetail.stopName = stopDetail.name;
		$scope.saveStop();		
	});	

				
				
				
	$scope.routeDetail = {
		//stops : [],
		stages : []
	};	
	$scope.routeDetail.stages.push({title: 'Stage1', stops: [{id:1, name:'S1'},{id:2, name:'S2'}]});
	$scope.routeDetail.stages.push({title: 'Stage2', stops: [{id:3, name:'S3'},{id:4, name:'S4'}]});
	
	$scope.stopDetail = {
		latitude:0,
		longitude:0,
		stopName:"",
		address:""
	};
	$scope.fleetDetail = {
		center : {latitude:0, longitude:0} ,
		zoom : 10,
		bounds : {northeast:{latitude:0, longitude:0} , southwest:{latitude:0, longitude:0}},
		stops : [{id:1, latitude:0, longitude:0}]
	};
	addStopWindow = function(latLng){
		
		//$scope.map.infoWindow.coords = {latitude:latLng.lat(), longitude:latLng.lng()};
		
		//TODO
		$scope.stopDetail = {
		latitude: latLng.lat(),
		longitude: latLng.lng(),
		stopName: "stopname",
		address: "Reverse geocoded address goes here"
		};
		locationChannel.publishLocation( {latitude: latLng.lat(),longitude: latLng.lng()});
		$scope.map.infoWindow.show = true ;

	};
	
	$scope.configMap = function(){
	$scope.gmap = $scope.map.control.getGMap() ;
		
	var contextMenuOptions={};
	contextMenuOptions.classNames={menu:'context_menu', menuSeparator:'context_menu_separator'};
	
	//	create an array of ContextMenuItem objects
	//	an 'id' is defined for each of the four directions related items
	var menuItems=[];
	menuItems.push({className:'context_menu_item', eventName:'add_stop', label:'Add stop', handler: addStopWindow	});
	contextMenuOptions.menuItems=menuItems;

	
	var contextMenu=new ContextMenu($scope.gmap, contextMenuOptions);
	//	listen for the ContextMenu 'menu_item_selected' event
	google.maps.event.addListener(contextMenu, 'menu_item_selected', function(latLng, eventName){
		var item = _.find(menuItems, function(item){ return item.eventName==eventName; });
		$scope.$apply(function() {
			item.handler(latLng);
		});
		});

	

	google.maps.event.addListener($scope.gmap, 'rightclick', function(mouseEvent){
		contextMenu.show(mouseEvent.latLng);
	});
	}
	$scope.map ={
		control: {}
		,infoWindow: {
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
	$scope.getRouteDetail = function(routeId){
		$scope.routeDetail = getthereAdminService.getRoute(routeId);
		//TODO get from web service
		//$scope.routeDetail.stops = [];
	};
	
	//Get the details of the selected fleet
	//TODO: CBM fit this function in the pattern that we have defined
	$scope.getFleetDetail = function(fleetId){
		//TODO get from web service(node.js)
		$scope.fleetDetail = {
		center : {latitude:15.4989, longitude:73.8278} ,
		zoom : 11,
		bounds : {northeast:{latitude:15.855126, longitude:74.421425} , southwest:{latitude:14.867264, longitude:73.622169}},
		stops : [{id:1, latitude:15.4989, longitude:73.8278, icon:'/images/bus_stop.png'}]
		};
	};	
	
	$scope.saveStop = function(){
		getthereAdminService.saveStop($scope.stopDetail, function(id){
			$scope.stopDetail.id= id;
			
			$scope.fleetDetail.stops.push({
				id:$scope.stopDetail.id
				, latitude:$scope.stopDetail.latitude
				, longitude:$scope.stopDetail.longitude
				, icon:  '/images/bus_stop.png'
				});
			$scope.map.infoWindow.show = false ;	
		});		
	};

	
	$scope.remove = function(){
		$scope.fleetDetail.stops = [];
	};
	//Region ends
	
	//TODO Do this based on the user's fleet
	$scope.getFleetDetail(1);
	//$scope.configMap();
};

//This controller starts with a lat-lng and gets the user to define the name of the stop. It also performs reverse geocoding
//TODO: CBM to do rev geocoding
function StopController($scope, channel, locationChannel){
	
	
	locationChannel.add( function(latLng){
		$scope.stopDetail = { latitude: latLng.latitude, longitude : latLng.longitude};
	});
	
	$scope.saveStop = function(){
		channel.publishStop({name: 'New Stop'});
	};
}

//Service that communicates with the server. All communication with server should happen through functions defined in this service.
GetThereAdminService = function($http){
	return {
		getRoute:function(routeId){
			//TODO fetch this from server
			return { routeId:1, stops:[]};
		},
		getRoutes: function(){
		},
		saveRoute: function(routeDetail){
		},
		saveStop: function(stopDetail, callback){
			//TODO Save to server, fetch the ID
			callback(tempId++);
		}
	};
};
StopChannelService = function(){

        var callbacks = [];
        this.add = function (cb) {
          callbacks.push(cb);
        };
        this.publishStop = function () {
          var args = arguments;
          callbacks.forEach(function (cb) {
            cb.apply(this,args);
          });
        };
        return this;
};
//This service is used for conveying to other components that a location on the map has been chosen
LocationChannelService = function(){
		var callbacks = [];
        this.add = function (cb) {
          callbacks.push(cb);
        };
        this.publishLocation = function (latLng) {
          //var args = arguments;
          callbacks.forEach(function (cb) {
            cb.call(this,latLng);
          });
        };
        return this;
};

(function () {
	var adminApp = angular.module('adminApp', [ 'ui.bootstrap', "google-maps", "ui.tree"]);
	adminApp.run(initializeApp);
	adminApp.controller('RouteController', RouteController);
	adminApp.controller('StopController', StopController);
	adminApp.service('channel', StopChannelService);
	adminApp.service('locationChannel', LocationChannelService);
	adminApp.factory('getthereAdminService', GetThereAdminService);
}());



