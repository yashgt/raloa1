var GoaTransApp = angular.module('GoaTransApp', []);
//Define Routing for the application
GoaTransApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/views/SearchTripForm', {
                templateUrl: 'views/SearchTripForm.html',
                
            }).
            when('/views/TripList', {
                templateUrl: 'views/TripList.html',
                controller: 'TripListController'
            }).
			when('/views/Map', {
                templateUrl: 'views/Map.html',
                controller: 'MapController'
            }).
            otherwise({
                redirectTo: '/views/SearchTripForm'
            });
}]);