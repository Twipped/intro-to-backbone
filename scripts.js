var Movie = Backbone.Model.extend({
	idAttribute: 'imdbID',

	url: function () {
		//putting callback=? on the end tells jquery this is jsonp
		return 'http://www.omdbapi.com/?i='+this.id+'&callback=?';
	},

	getTitle: function () {
		return this.get('Title');
	},
	getYear: function () {
		return this.get('Year');
	},
	getRating: function () {
		return this.get('Rated');
	},
	getDirector: function () {
		return this.get('Director');
	},
	getCast: function () {
		return (this.get('Actors') || '').split(', ');
	},
	getDescription: function () {
		return this.get('Plot');
	},
	getImage: function () {
		return this.get('Poster');
	},
	isFullyLoaded: function () {
		return this.has('Response');
	}
});


var Movies = Backbone.Collection.extend({
	model: Movie,
	searchTerm: false,

	searchFor: function (term) {
		this.searchTerm = term;
		this.fetch();
		return this;
	},

	url: function () {
		return 'http://www.omdbapi.com/?s='+this.searchTerm+'&callback=?';
	},

	parse: function (response) {
		return response.Search;
	}
});


var MoviesList = Backbone.View.extend({

	//delegate events inside this view
	events: {
		'click .load-more': 'onClickedLoad'
	},

	initialize: function () {
		//listen for change events on the collection and redraw when they occur
		this.listenTo(this.collection, 'sync', this.render);
	},

	//define our handlebars template function
	template: Handlebars.compile($('#movie-results-template').html()),

	//main render function that draws the contents of the list
	render: function () {
		//generate the view data we need to pass to the template
		var templateData = {
			results: this.collection.map(this._generateRowData)
		};

		//execute our template to create the html we need
		var html = this.template(templateData);

		//replace the view's contents with the new html
		this.$el.html(html);

		return this;
	},

	//our event delegate for the load details link
	onClickedLoad: function (ev) {
		//get movie id from dom event element
		var id = $(ev.target).parents('li').attr('data-id');

		//get the model from the collection using that id
		var model = this.collection.get(id);

		//tell the model to fetch, grabbing missing details
		model.fetch();

		//model's change event will bubble up to the collection, triggering our render function
	},

	//internal function that gets the template details we need from a model.
	_generateRowData: function (model) {
		return {
			id:          model.id,
			title:       model.getTitle(),
			year:        model.getYear(),
			rating:      model.getRating(),
			description: model.getDescription(),
			cast:        model.getCast(),
			image:       model.getImage(),
			full:        model.isFullyLoaded()
		};
	}
});



var searchResults = new Movies();

var PageRouter = Backbone.Router.extend({
	routes: {
		'search/:query':  'search'
	},

	search: function (query) {
		searchResults.searchFor(query);
	}
});

var router = new PageRouter();

var SearchForm = Backbone.View.extend({
	events: {
		'submit': 'onSubmit'
	},

	onSubmit: function (ev) {
		ev.preventDefault();

		var term = this.$('input').val();
		
		router.navigate("search/"+term, {trigger:true});
	}
});


new SearchForm({el: '#search', collection: searchResults});
new MoviesList({el: '#results', collection: searchResults});

Backbone.history.start();
