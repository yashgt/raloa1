function initializeApp($rootScope){
	//Initialize the app
}

function RouteController
//function
($scope) {
	
	
	
	$scope.routeDetail = {
		stops : []
	};	
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
		
		$scope.map.infoWindow.coords = {latitude:latLng.lat(), longitude:latLng.lng()};
		$scope.map.infoWindow.show = true ;
		//TODO
		$scope.stopDetail = {
		latitude:latLng.lat(),
		longitude:latLng.lng(),
		stopName:"",
		address:"Reverse geocoded address goes here"
	};

	};
	$scope.saveStop = function(){
		$scope.fleetDetail.stops.push({id:2, latitude:$scope.stopDetail.latitude, longitude:$scope.stopDetail.longitude});
		$scope.map.infoWindow.show = false ;
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
        coords: {
          latitude: 36.270850,
          longitude: -44.296875
        },
        options: {
          disableAutoPan: true
        },
        show: false
      }
    };


	
	$scope.getRouteDetail = function(routeId){
		//TODO get from web service
		$scope.routeDetail.stops = [];
	};
	
	//Get the details of the selected fleet
	$scope.getFleetDetail = function(fleetId){
		//TODO get from web service(node.js)
		$scope.fleetDetail = {
		center : {latitude:15.855126, longitude:74.421425} ,
		zoom : 10,
		bounds : {northeast:{latitude:15.855126, longitude:74.421425} , southwest:{latitude:14.867264, longitude:73.622169}},
		stops : [{id:1, latitude:15.855126, longitude:74.421425}]
		};
	};	
	

	
	$scope.remove = function(){
		$scope.fleetDetail.stops = [];
	};
	
	//TODO Do this based on the user's fleet
	$scope.getFleetDetail(1);
	//$scope.configMap();
};

function StopController($scope){
	$scope.stopName = "";
	$scope.saveStop = function(){
		//alert('hi');
		$scope.fleetDetail.stops.push({id:2, latitude:$scope.stopDetail.latitude, longitude:$scope.stopDetail.longitude});
		$scope.map.infoWindow.show = false ;
	};
}

(function () {
	var adminApp = angular.module('adminApp', ["google-maps"]);
	adminApp.run(initializeApp);
	adminApp.controller('RouteController', RouteController);
	adminApp.controller('StopController', StopController);
}());



