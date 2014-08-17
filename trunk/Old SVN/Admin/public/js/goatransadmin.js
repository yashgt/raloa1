getCenter = function(point1, point2) {
    var cenLat = (point1[0] + point2[0]) / 2.0;
    var cenLon = (point1[1] + point2[1]) / 2.0;

    return [cenLat, cenLon];
};

getBounds = function(point1, point2) {
    var swLat = Math.min(point1[0], point2[0]);
    var swLon = Math.min(point1[1], point2[1]);
    var neLat = Math.max(point1[0], point2[0]);
    var neLon = Math.max(point1[1], point2[1]);

    return [new google.maps.LatLng(swLat, swLon), new google.maps.LatLng(neLat, neLon)];
};

simulate_device = function(e) {
    // http://localhost:8888/act=ktc&dev=123&gprmc=$GPRMC,064046,A,1525.456,N,07358.9237
    var sellat = e.latLng.lat();
    var sellon = e.latLng.lng();
    var URL = "http://localhost:8888/act=ktc&dev=123&gprmc=$GPRMC,064046,A," + sellat.toString() + "," + sellon.toString();
    $.get(URL, function(data, status) {
        console.log("Sent location of %j %j", sellat, sellon);
    }, 'html');

};

rearrangeStops = function(e, ui) {
    var scope = angular.element($('#tabs')).scope();

    scope.rearrangeStops();

};

loadMap = function() {
    var markers = [];
    var routemap;
    routemap = new GMaps({
        div: '#routemap',
        lat: 15.347213,
        lng: 74.0149304,
        zoom: 10,
        click: simulate_device
    });

    routemap.setContextMenu({
        control: 'map',
        options: [{
            title: 'Add as New Stop',
            name: 'add_stop',
            action: function(e) {
                var scope = angular.element($('#tabs')).scope();
                var sellat = e.latLng.lat();
                var sellon = e.latLng.lng();

                scope.addStop(routemap, sellat, sellon);

            }
        }]
    });

    routemap.setContextMenu({
        control: 'marker',
        options: [{
                title: 'Add as Route Waypoint',
                name: 'add_waypoint',
                action: function(stop) {

                }
            },

            {
                title: 'Delete this Stop',
                name: 'delete_stop',
                action: function(e) {
                    var retVal = confirm("Do you want to DELETE this stop ?");
                    if (retVal == true) {
                        alert("Stop will be deleted!");
                        return true;
                    } else {

                        return false;
                    }
                }
            },
			
			{
                title: 'Move this Stop',
                name: 'move_stop',
                action: function(e) {
						var scope = angular.element($('#tabs')).scope();
						var sellat = e.latLng.lat();
						var sellon = e.latLng.lng();

						scope.addStop(routemap, sellat, sellon);

				}
            }
        ]
    })
    var $element = $('div[ng-controller="RouteController"]');
    //alert($element);
    var scope = angular.element($element).scope();
    scope.showAllStops(routemap);
	
    addSearchBox(routemap.map);
    routemap.refresh();

};

function addSearchBox(map) {
    var markers = [];

    var defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(15.327213, 73.01493049),
        new google.maps.LatLng(15.387213, 74.51493049));
    //routemap.map.fitBounds(defaultBounds);

    // Create the search box and link it to the UI element.
    var from_input = /** @type {HTMLInputElement} */ (
        document.getElementById('from-place'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(from_input);

    // Create the search box and link it to the UI element.
    var to_input = /** @type {HTMLInputElement} */ (
        document.getElementById('to-place'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(to_input);

    // Create the search box and link it to the UI element.
    var srch_input = /** @type {HTMLInputElement} */ (
        document.getElementById('srch-route'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(srch_input);

    var fromSearchBox = new google.maps.places.SearchBox(
        /** @type {HTMLInputElement} */
        (from_input));
    var toSearchBox = new google.maps.places.SearchBox(
        /** @type {HTMLInputElement} */
        (to_input));

    [fromSearchBox, toSearchBox].forEach(function(searchBox) {
        searchBox.setBounds(defaultBounds);



        // Listen for the event fired when the user selects an item from the
        // pick list. Retrieve the matching places for that item.
        google.maps.event.addListener(searchBox, 'places_changed', function() {
            var places = searchBox.getPlaces();

            //remove previous place markers. Not stop markers
            for (var i = 0, marker; marker = markers[i]; i++) {
                marker.setMap(null);
            }

            // For each place, get the icon, place name, and location.
            markers = [];
            //var bounds = new google.maps.LatLngBounds();
            var bounds = map.getBounds();
            for (var i = 0, place; place = places[i]; i++) {
                var image = 'bus.png';

                // Create a marker for each place.
                var marker = new google.maps.Marker({
                    map: map,
                    icon: image,
                    title: place.name,
                    position: place.geometry.location
                });

                markers.push(marker);

                bounds.extend(place.geometry.location);
            }

            map.fitBounds(bounds);
        });
    });




    /*
  // Bias the SearchBox results towards places that are within the bounds of the
  // current map's viewport.
  google.maps.event.addListener(routemap, 'bounds_changed', function() {
    var bounds = map.getBounds();
    searchBox.setBounds(bounds);
  });
  */

};
//function getAllMethods(object) {
//    return Object.getOwnPropertyNames(object).filter(function(property) {
//       return typeof object[property] == 'function';
//   });
//}

/*
geocode = function (lat, lng) {
	var address ;
	//return address ;
	
	
	GMaps.geocode( 
		{ lat : lat
		, lng : lng
		, callback : function( results, status) 
			{ 
			address = "Testing" ; 
			//alert(results.toSource());
			//address = results[0].address_components[2].toSource(); 
			} 
		});
		return address;
};
*/

/*
geoCoder = function codeLatLng() {
  var input = document.getElementById('latlng').value;
  var latlngStr = input.split(',', 2);
  var lat = parseFloat(latlngStr[0]);
  var lng = parseFloat(latlngStr[1]);
  var latlng = new google.maps.LatLng(lat, lng);
  geocoder.geocode({'latLng': latlng}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        map.setZoom(11);
        marker = new google.maps.Marker({
            position: latlng,
            map: map
        });
        infowindow.setContent(results[1].formatted_address);
        infowindow.open(map, marker);
      } else {
        alert('No results found');
      }
    } else {
      alert('Geocoder failed due to: ' + status);
    }
  });
}*/
