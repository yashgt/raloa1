function StopCtrl ($scope, $http, $modal, $log) {
	$scope.open = function (map, lat, lng) {
	  
	//Here we invoke a modal dialog to obtain the name to be given to the stop
	var modalInstance = $modal.open({
      templateUrl: 'myModalContent.html',
      controller: StopModalInstanceCtrl,
      resolve: {
		lat : function () {	return lat; },
  	  	lng : function () {	return lng; },
		name : function () { return title;}
      }
    });
//	var markers = [];
    modalInstance.result.then(
		function (stopName) { //Called when OK is hit
			//Now we have lat, lon, and name
			//Add the stop to the database

			$http.post('/api/stops', {name: stopName, lat: lat, lng: lng})
				.success(function(data) {	//Only if we succeed in adding to DB, we will add it to the map
						map.addMarker({ lat: lat, lng: lng, title: stopName});
						markers.push(marker);
					})
					.error(function(data) {
						alert(data);
						console.log('Error: ' + data);
					});
    }, 
	function () { //Called when Cancel is hit
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
}

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

var StopModalInstanceCtrl = function ($scope, $modalInstance, lat, lng) {

  //$scope.items = items;
	$scope.stopName = "" ;
	GMaps.geocode( 
			{ lat : lat
			, lng : lng
			, callback : function( results, status) 
				{ 
					$scope.$apply( function() {
					$scope.stopName = results[0].address_components[0].long_name;
					$scope.fullAddress = results[0].formatted_address;
					});

				} 
			});

  $scope.ok = function () {
    $modalInstance.close($scope.stopName);
	//
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};



