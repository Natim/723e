define([
	'jquery',
	'underscore',
	'backbone',
	'mustache',
	'initView',
	'text!templates/transactions/changesForm.mustache',
	'changesModel',
	'storage',
	'bootstrap-datepicker'
], function(
	$,
	_,
	Backbone,
	Mustache,
	InitView,
	ChangesFormTemplate,
	ChangesModel,
	storage) {

	var arrayAbstract = [];
	var nbSource = 0;

	var DashboardView = Backbone.View.extend({
		el: $("#content"),

		displayForm: function(year, month, change){


			var template = Mustache.render(ChangesFormTemplate, {
				change: change,
				currencies: storage.currencies.toJSON()
			});
			$("#content").html(template);

			$('#content input.datepicker').datepicker({
				format: 'yyyy-mm-dd',
				autoclose: true
			});

			// Put select markup as selected
			if (change) {
				$("#changes_form select[name='currency']").find('option[value="' + change.currency + '"]').attr('selected', true);
				$("#changes_form select[name='new_currency']").find('option[value="' + change.new_currency + '"]').attr('selected', true);
			}else{
				var currency = storage.user.get('accounts')[0].currency;
				$("#changes_form select[name='currency']").find('option[value="' + currency + '"]').attr('selected', true);
			}

			var view = this;
			// User cancel form. We go back to view page.
			$("button.changes_form_cancel").on("click", function() {
				Backbone.history.navigate("#/transactions/"+year+"/"+month, {
					trigger: true
				});
			});

			$("#changes_form").on("submit", function() {

				var array = $("#changes_form").serializeArray();
				var dict = {};

				for (var i = 0; i < array.length; i++) {
					dict[array[i]['name']] = array[i]['value']
				}
				if (!dict['amount']) {
					dict['amount'] = 0;
				} else {
					dict['amount'] = dict['amount'].replace(',', '.');
				}
				if (!dict['new_amount']) {
					dict['new_amount'] = 0;
				} else {
					dict['new_amount'] = dict['new_amount'].replace(',', '.');
				}

				dict['user'] = storage.user.url();
				dict['account'] = storage.user.get('accounts')[0].id;
				
				if(dict['currency'] === undefined || dict['currency'] === null){
					dict['currency'] = storage.user.get('accounts')[0].currency;
				}
				var change;
				if(dict['id'] !== undefined){
					change = storage.changes.get(dict['id']).set(dict);
				}else{
					change = new ChangesModel(dict);
				}

				Backbone.Validation.bind(this, {
			      model: change,
			      valid: function(view, attr) {

					// Check if all are required
				    $(view).find('input[name=' + attr + '], select[name=' + attr + ']')
				    	.parent()
				    	.removeClass('has-error')
				    	.addClass('has-success')
				    	.prev().html('');
					
			      },
			      invalid: function(view, attr, error) {

				    $(view).find('input[name=' + attr + '], select[name=' + attr + ']')
				    	.parent()
				    	.addClass('has-error')
				    	.removeClass('has-success')
				    	.prev().html(error);

			      }
			    });

			    change.validate();

			    if (change.isValid()) {
					change.save(dict, {
						wait: true,
						success: function(model, response) {
							storage.changes.add(model);
							console.log('Successfully saved!');
							Backbone.history.navigate("#/transactions/"+year+"/"+month, {
								trigger: true
							});
						},
						error: function(model, error) {
							console.log(model.toJSON());
							console.log('error.responseText');
						}
					});
				}
				return false;
			});
		},

		render: function(year, month, change_id) {
			var initView = new InitView();
			if (initView.isLoaded() === false) {
				initView.render();
			}

			initView.changeSelectedItem("nav_transactions");

			var view = this;

			if(change_id){
			    view.displayForm(year, month, storage.changes.get(change_id).toJSON());
			}else{
				view.displayForm(year, month);
			}
		}
	});

	return DashboardView;

});
