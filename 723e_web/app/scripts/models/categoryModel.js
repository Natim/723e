define(["jquery", "backbone", "ws"], function($, Backbone, WebServices) {

	var category = Backbone.Model.extend({
		urlRoot: WebServices.v1.categories,
		defaults: {
			name: 'Nom',
			description: 'Description',
			color: '#ffffff',
			icon: 'fa-circle'
		},
		initialize: function() {
			//alert("Welcome to this world");
		},
        validation: {
            name: {
                required: true
            },
            color: {
              required: true
            },
            icon: {
              required: true
            }
        }
	});

	return category;
});
