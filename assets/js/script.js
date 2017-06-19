$(function(){

	var saveContainer = $('.save-container'),
		favouriteIcon = saveContainer.find('.glyphicon'),
		favouriteLocationsListGroup = $('.list-group');

	var hasFavouriteLocations = false;

	// Initialize a google maps using the gmaps library.

	var map = new GMaps({
		el: '#map',
		lat: '0',
		lng: '0',
		zoom: 1
	});

	// Initialize the favourite locations array which is kept in localStorage

	if(!localStorage.hasOwnProperty('favourite-locations')) {
		localStorage.setItem('favourite-locations', JSON.stringify([]));
	}

	hasFavouriteLocations = JSON.parse(localStorage.getItem('favourite-locations')).length ? true : false;

	// Form submit and Search icon handlers
	$('.glyphicon-search').click(showLocationByAddress);
	$('#geocoding_form').submit(showLocationByAddress);

	// Click handler on any of the favourite locations
	$(document).on('click','a.list-group-item', showLocationByCoordinates);

	// Click handler on the favourite(star) icon to become saved or removed
	$(document).on('click', '.glyphicon-star', removeFavouriteLocation);
	$(document).on('click', '.glyphicon-star-empty', saveFavouriteLocation);

	// If there are any favourite locations, append them to the favourite location list

	if(hasFavouriteLocations) {

		var array = JSON.parse(localStorage.getItem('favourite-locations'));

		favouriteLocationsListGroup.empty();
		favouriteLocationsListGroup.append('<span class="list-group-item active">Saved Locations</span>');

		array.forEach(function(item){
			favouriteLocationsListGroup.append('<a class="list-group-item" data-lat="'+item.lat+'" data-lng="'+item.lng+'" data-createdAt="'+item.createdAt+'">'+item.address+'<span class="createdAt">'+moment(item.createdAt).fromNow()+'</span><span class="glyphicon glyphicon-menu-right"></span></a>');
		});

		favouriteLocationsListGroup.show();

	}

	// This function presents the address which was entered in the text field in the map

	function showLocationByAddress(e) {

		e.preventDefault();

		// Getting the coordinates of the entered address

		GMaps.geocode({
			address: $('#address').val().trim(),
			callback: function(results, status) {

				if (status !== 'OK') return;


				var latlng = results[0].geometry.location,
					fullAddress = results[0].formatted_address,
					isLocationFavourite = false,
					locationsArray = JSON.parse(localStorage.getItem('favourite-locations')),
					saveLocation = $('#save-location');

				var map = new GMaps({
					el: '#map',
					lat: latlng.lat(),
					lng: latlng.lng()
				});

				// Adding a marker on the wanted location
				
				map.addMarker({
					lat: latlng.lat(),
					lng: latlng.lng()
				});

				// Checking if this address exists in the favourites array

				if(locationsArray.length) {
					locationsArray.forEach(function (item) {
						if (item.lat == latlng.lat() && item.lng == latlng.lng()) {
							isLocationFavourite = true;
						}
					});
				}

				// Adding the address to the html and setting data attributes with the coordinates
				saveLocation.text(fullAddress).attr({'data-lat': latlng.lat(), 'data-lng': latlng.lng()});

				// Removing the active class from all favourite locations
				favouriteLocationsListGroup.find('a.list-group-item').removeClass('active-location');

				// Changing the icon to become non-favourite
				
				if(!isLocationFavourite) {
					favouriteIcon.removeClass('glyphicon-star').addClass('glyphicon-star-empty');
				}
				else {
					
					// Adding the active class and add the favourite icon on the given favourite location
					favouriteIcon.removeClass('glyphicon-star-empty').addClass('glyphicon-star');

					// Find the entry in the favourite locations list that corresponds 
					// to the current location, and mark it as active.

					favouriteLocationsListGroup.find('a.list-group-item[data-lat="'+latlng.lat()+'"][data-lng="'+latlng.lng()+'"]').addClass('active-location');
				}

				// Show the html of the given location
				saveContainer.show();

			}

		});
	}

	// This functions is called when a favourite location is clicked.
	// It reads the coordinates and shows them in a map

	function showLocationByCoordinates(e) {

		e.preventDefault();

		var elem = $(this),
			location = elem.data();

		// Getting the address from the location's coordinates

		GMaps.geocode({
			location: {lat: location.lat, lng: location.lng},
			callback: function(results, status) {

				if (status !== 'OK') return;

				var fullAddress = results[0].formatted_address,
					saveLocation = $('#save-location');

				var map = new GMaps({
					el: '#map',
					lat: location.lat,
					lng: location.lng
				});

				map.addMarker({
					lat: location.lat,
					lng: location.lng
				});

				// Adding the address to the html and setting
				// data attributes with the location's coordinates

				saveLocation.text(fullAddress);
				saveLocation.attr({
					'data-lat': location.lat,
					'data-lng': location.lng
				});

				// Adding colored background to the active favourite location and
				// removing the old active location

				favouriteLocationsListGroup.find('a.list-group-item').removeClass('active-location');
				favouriteLocationsListGroup.find('a.list-group-item[data-lat="'+location.lat+'"][data-lng="'+location.lng+'"]').addClass('active-location');

				// Add the favourite icon on the given location
				favouriteIcon.removeClass('glyphicon-star-empty').addClass('glyphicon-star');

				// Show the html of the given location
				saveContainer.show();

				// Clear the search field
				$('#address').val('');

			}

		});

	}

	// This function saves a location to favourites and adds it to localStorage

	function saveFavouriteLocation(e){

		e.preventDefault();

		var saveLocation = $('#save-location'),
			locationAddress = saveLocation.text(),
			isLocationFavourite = false,
			locationsArray = JSON.parse(localStorage.getItem('favourite-locations'));

		var location = {
			lat: saveLocation.attr('data-lat'),
			lng: saveLocation.attr('data-lng'),
			createdAt: moment().format()
		};

		// Checking if this location is in the favourites array

		if(locationsArray.length) {
			locationsArray.forEach(function (item) {
				if (item.lat == location.lat && item.lng == location.lng) {
					isLocationFavourite = true;
				}
			});
		}

		// If the given location is not in favourites,
		// add it to the HTML and to localStorage's array

		if(!isLocationFavourite) {

			favouriteLocationsListGroup.append(
				'<a class="list-group-item active-location" data-lat="'+location.lat+'" data-lng="'+location.lng+'" data-createdAt="'+location.createdAt+'">'+
				locationAddress+'<span class="createdAt">'+moment(location.createdAt).fromNow()+'</span>' +
				'<span class="glyphicon glyphicon-menu-right"></span>' +
				'</span></a>');

			favouriteLocationsListGroup.show();

			// Adding the given location to the localStorage's array
			locationsArray.push({
				address: locationAddress,
				lat: location.lat,
				lng: location.lng,
				createdAt: moment().format()
			});

			localStorage.setItem('favourite-locations', JSON.stringify(locationsArray));

			// Make the star icon full, to signify that this location is now favourite
			favouriteIcon.removeClass('glyphicon-star-empty').addClass('glyphicon-star');

			// Now we have at least one favourite location
			hasFavouriteLocations = true;
		}

	}

	// This function removes a favourite location from the favourites list
	// and removes it from localStorage
	
	function removeFavouriteLocation(e){

		e.preventDefault();

		var saveLocation = $('#save-location'),
			isLocationDeleted = false,
			locationsArray = JSON.parse(localStorage.getItem('favourite-locations'));

		var location = {
			lat: saveLocation.attr('data-lat'),
			lng: saveLocation.attr('data-lng')
		};

		// Removing the given location from the localStorage's Array
		if(locationsArray.length) {
			locationsArray.forEach(function (item, index) {
				if (item.lat == location.lat && item.lng == location.lng) {
					locationsArray.splice(index,1);
					isLocationDeleted = true;
				}
			});
		}

		if(isLocationDeleted) {

			// Remove the given location from the favourites list

			favouriteLocationsListGroup.find('a.list-group-item[data-lat="'+location.lat+'"][data-lng="'+location.lng+'"]').remove();

			localStorage.setItem('favourite-locations', JSON.stringify(locationsArray));

			// Removing the favourite icon from the html
			favouriteIcon.removeClass('glyphicon-star').addClass('glyphicon-star-empty');

			if(!locationsArray.length) {
				
				// There are no more favourite locations

				hasFavouriteLocations = false;
				favouriteLocationsListGroup.hide();
			}
			else {
				hasFavouriteLocations = true;
			}

		}

	}

});