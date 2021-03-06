define("storage",
	   ["jquery",
		"categoryCollection",
		"currenciesCollection",
		"changesCollection",
		"userModel"],
	function(
		$,
		CategoriesCollection,
		CurrenciesCollection,
		ChangesCollection,
		UserModel) {

	// Properties
	var user       = new UserModel();
	var categories = new CategoriesCollection();
	var currencies = new CurrenciesCollection();
	var changes    = new ChangesCollection();

	// This function intialise storage object.
	var init = function(userid, callback){

		// Number of collection to fetch asynchronously
		var fetchNb = 4;
		// Number of collection already fetched
		var fetchCounter = 0;

		// Get User model
		user.set('id', userid);
		user.fetch({
	        success: function (u) {
	        	fetchCounter++;
	        	if(fetchCounter === fetchNb){
	        		callback();
	        	}
	        }
	    });

		// Get list of all categories
		categories.fetch({
			success: function() {
	        	fetchCounter++;
	        	if(fetchCounter === fetchNb){
	        		callback();
	        	}
			}
		});

		// Get list of all currencies
		currencies.fetch({
			success: function() {
	        	fetchCounter++;
	        	if(fetchCounter === fetchNb){
	        		callback();
	        	}
			}
		});

		// Get list of all change
		changes.fetch({
			success: function() {
	        	fetchCounter++;
	        	if(fetchCounter === fetchNb){
	        		callback();
	        	}
			}
		});


	};

	return {
		init       : init,
		user       : user,
		categories : categories,
		currencies : currencies,
		changes    : changes
	}
});
