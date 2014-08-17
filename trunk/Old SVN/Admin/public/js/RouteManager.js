/* This is the RouteManager class that is used for doing everything to be done with Routes */
function RouteManager() {}
/**
 * Find a Route by id
 * Param: id of the Route to find
 * Returns: the Route corresponding to the specified id. This contains all details of the Route including the Stops and Trips.
 */
RouteManager.prototype.find = function (id) {};

RouteManager.prototype.findByName = function(name) {};

RouteManager.prototype.createOrUpdate = function(Route) {};

RouteManager.prototype.listAllRoutes = function() {
	/* TODO get this from the DB using RouteManager*/ 
	$http.get('/api/todos')
	.success(function(data) {
		$scope.todos = data;
		console.log(data);
	})
	.error(function(data) {
		console.log('Error: ' + data);
	});
	return [
  {'from': 'Panaji Bus stand', 'to' : 'Ponda bus stand', 'via' : 'Old Goa'}
  
];
};


