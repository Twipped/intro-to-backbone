// #Backbone.js Tutorial
//
// The following is an introduction to the various parts of Backbone.js by way of a very simple single page application.
//
// This guide is designed to be viewed using the [Docco](http://jashkenas.github.io/docco/) generated annotated view located
// at http://chipersoft.github.io/intro-to-backbone/
//
// You can view this application at work by visiting http://chipersoft.github.io/intro-to-backbone/demo.html
//
// It is recommended that you open the [demo.html](http://github.com/chipersoft/intro-to-backbone/demo.html) source in
// another tab or browser window while reading this guide, as this JavaScript code is only half of the total application.
//
// ---

// ##What Is Backbone?
//
// Backbone is a JavaScript library that provides various tools to assist in the organization of front-end programming code.
// It provides constructs for structuring your code into distinct data models, presentational views and execution controllers.
// This organizational pattern is referred to commonly as MVC.
//
// Backbone meets the [Wikipedia definition of a Software Framework](http://en.wikipedia.org/wiki/Software_framework):
//
// - It provides Inversion of Control by way of a mediator/observer system for inter-module communication
// - It provides default behavior which you may lean on or completely ignore
// - It is full extensible by way of overriding publicly exposed components
// - It need not be modified itself to perform its duties.
//
// Backbone does not, however, dictate how you organize your files, how those files are loaded onto the page, or what other
// libraries you wish to use in conjunction with Backbone.  Backbone does not require exclusivity and can be used alongside
// any other frameworks.  Backbone is un-opinionated about how much of its toolset you take advantage of.
//
// Backbone is a client-side front-end framework.  While some of its pieces can be used in Node.js, it is designed for use in the browser.
//

// ##Why Should I Use Backbone?
//
// Backbone is perfect for the type of developer who abhores magical code.  Backbone itself is so perfect in its simplicity
// that even an amateur JavaScript developer can read its source code and fully understand it in under an hour.  All interaction
// between Backbone modules must be explicitly defined.
//
// Backbone will also feel right at home for anyone who prefers a Classical Inheritence model, as all Backbone modules are
// created by extending existing classes.
//
// Finally, Backbone helps to promote componetized development by organizing presentation code around specific elements on a page.

// ##What does Backbone provide?
//
//	Backbone consists of seven distinct parts:
//
// 1. `extend()`: A system for extending JavaScript classes with classical inheritence
// 2. `Backbone.Sync`: An abstraction of `jQuery.ajax()` for handling server communications. If jQuery is absent it
//    will also search for Zepto or Ender.
// 3. `Backbone.Model`: A class for creating data models to interact with and encapsulate stored state.
// 4. `Backbone.Collection`: A class for organizing multiple models.
// 5. `Backbone.View`: A class for organizing all behavioral code for a given page element, from generating the
//    contents of the element to reacting to user interaction.
// 6. `Backbone.Router`: A page level controller for changing and reacting to changes in the page url.
// 7. `Backbone.Events`: A mediator/observer system for sending messages between Backbone subclasses.
//


// ##Backbone.Model
//
// We will begin by creating a model to handle the details of an individual movie.  This model will
// interface with the oMDB API to load the details for a specific item in their database and provide
// getter functions for fetching specific details about the movie (technically this class can be
// episodes and tv series as well, but for brevity we will call it a movie).
//
// An example of the data this model will be wrapping [can be found here](http://www.omdbapi.com/?i=tt0903624&tomatoes=true).

// As with all of Backbone's classes, we create the new model by calling the `extend()` function on
// `Backbone.Model`.  The subclass details are defined by passing in an object as the only argument.
// This object will become the top level prototype of the new class.
//
var Movie = Backbone.Model.extend({

	// Backbone anticipates that every data object which a model interacts with will have a field
	// defining an identifier unique to that object.  By default it looks for an `id` field, but
	// if you use a different field name you can instruct Backbone of this via the idAttribute property.
	//
	// Backbone will automatically extract this value from the data object and apply it to the `id` property
	// on our model.  The `id` is also used by Backbone.Collection when selecting specific models in a collection.
	
	// In our case, oMDB uses a field named `imdbID`, so we must define this.
	idAttribute: 'imdbID',

	// Next we need to define our getters.  Code using this model could fetch the field contents
	// directly via the `.get()` function, but that requires that the other classes know how the
	// data in the json response is structured, and means that other classes are coupling themselves
	// to that external structure instead of the interface this model provides.  So, it is much
	// better practice to explicitly define gettings for each piece of data this model provides.
	//
	// This also makes it possible to manipulate the original data into saner formats, such as splitting
	// a comma separated list of actors, or returning a proper null value for a missing image.

	getType: function () {
		return this.get('Type');
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

	getCast: function () {
		return (this.get('Actors') || '').split(', ');
	},

	getDescription: function () {
		return this.get('Plot');
	},

	getImage: function () {
		var img = this.get('Poster');
		return img !== 'N/A' && img || '';
	},

	getScore: function () {
		return this.get('tomatoMeter');
	},

	// We need a way to detect if an object has been loaded with full details.  The oMDB API only
	// provides a `Response` property when an item is explicitly loaded, so we can use this as our
	// detection method.  Backbone models have a `has` function to test for the existance of a field.
	isFullyLoaded: function () {
		return this.has('Response');
	},

	// This model will be responsible for retreiving extra details from the API for individual movies.
	// Backbone provides an internal system on the Model class for handling this communication, and
	// leverages jQuery (if available) to perform the AJAX or JSONp calls.
	//
	// The `url` property of a Backbone Model identifies what uri to use for sending and receiving
	// the data for this model.  `url` can be either a fixed string, or a function that returns a string.
	// Backbone will invoke the function before making the call to Backbone.Sync to retreive the data.
	
	// In this case we are returning an oMDB API url with our model's ID mixed in.  We're also telling
	// oMDB that we want Rotten Tomatoes information.  By putting `&callback=?` on the end of the url,
	// this tells jQuery that we want to perform this request via JSONp, and that it should replace
	// the question mark with the JSONp callback name.
	url: function () {
		return 'http://www.omdbapi.com/?i='+this.id+'&tomatoes=true&callback=?';
	}

	// That's all we need for the Movie model.  We can use this code right now like so:
	//
	//      var Hobbit = new Movie({imdbID: 'tt0903624'});
	//      Hobbit.fetch({
    //          success: function () {
    //              console.log(Hobbit.getCast())
    //          }
    //      });
});

// ##Backbone.Collection
//
// Next we need to create a data model for fetching search results from oMDB.  oMDB returns its results
// as an array of movies ([see example]](http://www.omdbapi.com/?s=hobbit)) with reduced details (just a title, year, id and type).
// These individual records, tho having fewer properties, still have the same structure that our Movie model
// expects, so we can treat each result as a Movie.

// Lets create our Movies collection by extending `Backbone.Collection`.
var Movies = Backbone.Collection.extend({

	// Backbone.Collection will automatically wrap the individual objects in the response with data models.
	// By default it uses plain `Backbone.Model` classes for this wrapping, but you can define a specific model
	// for Backbone to use instead via the `model` property on a collection.

	// We want to wrap our results with Movie models, so we pass `Movie` as the model type.
	model: Movie,

	// Since this model represents search results, we need a property to contain the term being searched for
	searchTerm: false,

	// As with the `Movie` model, we need to tell the collection what url to use for fetching data. Our search term
	// can contain characters that aren't url safe, such as spaces, so we urlencode it.
	url: function () {
		return 'http://www.omdbapi.com/?s='+encodeURIComponent(this.searchTerm)+'&callback=?';
	},

	// By default, Backbone expects that the data it needs in the response will be at the root of the response.
	// For models this means it grabs all the properties of the base object to define the field and values of the
	// model. For collections, it expects the base of the response to be an array of objects to use for models.
	//
	// If you look at the search example linked above, you will see that oMDB returns the results as an array inside
	// a `Search` property, so we need to tell Backbone how to find that array.  This is done using a `parse` function
	// on the Model or Collection.  Backbone will call `parse` with the contents of the AJAX/JSONp response and use
	// whatever it returns as its contents.  This is also the function you would use if you need to pre-process the
	// data, or create nested models inside a model.
	
	// Here our `parse` function is returning with the Search array.
	parse: function (response) {
		return response.Search;
	},

	// Finally we need a function to kick off a request to oMDB to search for a new value.  This function sets the
	// `searchTerm` property that we created above, and then calls its `fetch` function. `fetch` is a convenience
	// function that tells Backbone.Sync that we need to perform a read request, overwriting the previous data.
	//
	// When the request completes, Backbone will update the contents of the collection and then trigger a 'sync'
	// event on the collection.
	searchFor: function (term) {
		this.searchTerm = term;
		this.fetch();
		return this;
	}

	// We can use this collection right now like so:
	//
	//       var Hobbits = new Movies();
	//       Hobbits.searchFor('Hobbit');
	//       Hobbits.once('sync', function () {
	//           console.log(Hobbits.toJSON())
	//       });
	//
	// The `toJSON()` function will output the contents of the collection as a plain JS object.
	
});

// ##Backbone.Events
//
// Before we continue with more code I need to take a moment to talk about `Backbone.Events`, because this example
// doesn't use `Backbone.Events` explicitly.  Events is a mixin object, a collection of functions designed to be
// applied to other objects in order to add pre-made functionality to that object via an extension function such
// as Underscore/Lodash's `_.extend` or `jQuery.extend`.  Mixins are a very common pattern in JavaScript for simulating
// multiple inheritence.
//
// Every base class in Backbone has the Events object mixed into it, and you can use it on custom objects like so:
//
//      var mediator = _.extend({}, Backbone.Events);
//
// I will let you look at the [Backbone docs](http://backbonejs.org/#Events) for the specifics of the seven functions
// that Events provides, but the gist of it is a basic publish/subscribe pattern.  Any object can publish an event using
// the `trigger` function, and any object can subscribe to events using the `on` or `once` functions.  Backbone also
// provides an Inversion of Control function called `listenTo`, where -- instead of ObjectA binding a callback to ObjectB --
// ObjectA binds the callback to itself and proxies the event from ObjectB.
//
// This is the intended mechanism for handling control flow within Backbone modules.  Modules only ever interface with
// each other by way of themselves, so you avoid tight coupling.  You will see this interaction in the next section.

// ##Backbone.View
//
// Now that we have our two data wranglers, its time to create a means of displaying the data. In the same way
// that `Backbone.Model` and `Backbone.Collection` wrap data objects and arrays, `Backbone.View` wraps a single HTML
// element in the page DOM.  It provides a structure for automatically binding delegated events for that element,
// and a structure for filling in the contents of that element.

// As always, we initialize our View class by calling `extend`.
var MoviesList = Backbone.View.extend({

	// Backbone views expect to be bound to a single DOMElement.  This element can be defined either directly using
	// the `el` property (this can be anything `jQuery()` will accept.  If the element is not provided, then the view
	// will create its own element and keep it detached from the page.  This element is available inside the class as
	// a jQuery container stored on `this.$el`.
	//
	// For the sake of versatility, it can be a good idea to define that element's structure in the view, even if you
	// plan to only every use the view with a pre-existing element.  This is done using the `tagName`, `id`, and
	// `className` properties.
	tagName: 'ul',

	id: 'results',

	className: 'list-group',

	// The contents of the view will be generated using a Handlebars template function.  The view doesn't know where
	// that template is, however, so to start we just create a noop.
	template: function () { return ''; },

	// All Backbone classes support having an `initialize` function which acts as the constructor function for the class.
	// In our model and collection we didn't have a need for this, but the view needs to do a few thing at creation time.
	initialize: function (options) {
		
		// This view will be displaying the contents of the search results collection.  We will be providing that
		// collection when we initialize the class, and Backbone will automatically attach that collection to the view,
		// but we still need to bind to the `sync` event on that collection so that we knew when the data has changed.
		this.listenTo(this.collection, 'sync', this.render);

		// Backbone does not have any built in logic for handling template functions, so we need to assign our template
		// function manually if one was provided during instantiation.
		if (options.template) {
			this.template = options.template;
		}
	},


	// The standard convention in Backbone development is to have the contents of the element filled in by a `render`
	// function.  Backbone will not ever call this function on its own, this is merely a standard that it establishes.
	// Some developers will also have functions for adding or removing elements to the view (Marionette, for example,
	// provides systems for generating composite views made up of smaller item views.)
	
	// In our case, the code for drawing our list is pretty basic and speedy, so we just do a basic overwrite.
	render: function () {

		// First we need to generate the data structure that our Handlebars template expects. This is a basic object with
		// a results array.  Our template doesn't know anything about Backbone models, so we need to process each model
		// in the collection into a data structure it can handle.  Backbone Collections provide a `map` function for
		// iterating over the contents of the collection and returning an array of new values
		// ([See the Backbone docs for details.](http://backbonejs.org/#Collection-Underscore-Methods)).  We pass in an
		// internal method called `_generateRowData` (defined below) to create those values.
		var templateData = {
			results: this.collection.map(this._generateRowData)
		};

		// Now we pass that data structure to our view's template in order to produce the HTML that will fill the view's element.
		var html = this.template(templateData);

		// And finally we pass that HTML into the view element directly.
		this.$el.html(html);

		// A standard convention is to return `this` from the `render` function so that other functions can be chained.
		return this;
	},

	// Now we define the internal method that will be used to convert the Movie models into the row data structure that
	// the template requires.  We prefix the function name with an underscore to denote that this is an internal function
	// and is not intended to be called externally (this is a standard convention in JavaScript, done in liu of private methods).
	_generateRowData: function (model) {
		return {
			id:          model.id,
			title:       model.getTitle(),
			year:        model.getYear(),
			rating:      model.getRating(),
			description: model.getDescription(),
			cast:        model.getCast(),
			image:       model.getImage(),
			full:        model.isFullyLoaded(),
			type:        model.getType(),
			score:       model.getScore()
		};
	},

	// Since the search results contain truncated records, we need a way for the user to request extra details about a
	// movie.  When the record is truncated, our Handlebars template outputs a link with a `load-more` css class.  We
	// need to watch for when that link is clicked in order to tell the model for that row to load the extra data.
	//
	// We could do this in the `render` function with a standard jQuery call, but that sort of event binding makes
	// for a bad anti-pattern, as it creates lots of extra handlers that then need to be cleaned up by the browser every
	// time the view reloads.
	//
	// The better practice is to use [event delegation](https://learn.jquery.com/events/event-delegation/), creating
	// our handlers on the view's main element.  Backbone provides an excellent mechanism for doing this automatically.
	//
	// The `events` property on a Backbone View defines a list of all delegated events that you want to react to
	// within your view.  The keys of the `events` property object define the event name and a css selector of the
	// element that should respond to the event.  The value for that key contains the name of the function on this
	// class that should be invoked when the event occurs.  The value may also be a function closure, which will be
	// called with the context (`this`) of the view.
	
	// Here we have defined a delegate for the `click` event on an element with the `load-more` class, and told it
	// to invoke the onClickedLoad function on our view.
	events: {
		'click .load-more': 'onClickedLoad'
	},

	// And here is our event handler.  The function will receive a single argument, the jQuery event object.
	onClickedLoad: function (ev) {
		
		// We identify the id of the movie by grabbing the row's data-id attribute (defined in the Handlebars template)...
		var id = $(ev.target).parents('li').attr('data-id');

		// ...and use that id to fetch the relevant model from the view's collection...
		var model = this.collection.get(id);

		// ...so that we can tell the collection to fetch the full details of the object.
		model.fetch();
	}

	// Now you're probably wonder, what causes the view to update once that model gets its new details?
	//
	// Backbone Collections automatically subscribe to all events emitted by the models they contain.  When the `fetch`
	// request completes, the model's `sync` event will be triggered. This will, in-turn, trigger the `sync` event on
	// the collection itself.  Because we subscribed to that `sync` event in the `initialize` method, the view redraws
	// with the new model data.  Quick and easy data binding with minimal effort.
});

// We've created the view for displaying the contents of the collection, but how do we tell the collection to
// perform a search?  We need to have a search form to take the user's input and kick off the process, and
// we need to create behavior for that form.
//
// You could just use jQuery to add an event binding to the submit event, but that's not very componentized, or even
// reusable, so lets create a view to handle the behavior of a search form.  Additionally, for this example we'll have
// the form already be present on the page, so that there is no need to rebuild the contents using a template.

// The form should always show the search term, so we'll set it up to accept the search collection and to update the
// input with the term after every sync.  As this is the only contents of the form that are changing, we'll have the
// render function handle this.
var SearchForm = Backbone.View.extend({
	initialize: function () {
		if (this.collection) {
			this.listenTo(this.collection, 'sync', this.render);
		}
	},

	// I mentioned above that the `$el` property is a reference to the element the view represents.  Likewise,
	// Backbone also provides `this.$()` as a shortcut to `this.$el.find()`, for selecting elements inside the view.
	render: function () {
		this.$('input[type="search"]').val(this.collection.searchTerm);
	},

	// Here we demonstrate using an anonymous function to handle the event, instead of defining it as a
	// method on the class.  Note that the function is still able to use `this`, despite it not being a member
	// of the view.
	events: {
		'submit': function (ev) {
			ev.preventDefault();

			var term = this.$('input[type="search"]').val();
			
			this.trigger('search', term);
		}
	}

	// With our search view defined, it's time to cover the final piece of the Backbone puzzle.
});

// ##Backbone.Router / Backbone.History
//
// `Backbone.History` is the C in the MVC paradigm that Backbone provides (Controller).  History is an abstraction
// of the browser history API for interacting with the page url.  In modern browsers it is possible to completely alter the
// URL without reloading the page.  It is also possible to capture changes in the url within the page, and react to them
// without trigger a fresh page load.  A server can send the exact same files for any urls that match a specific pattern,
// and the code on the page will react to the url and behave differently.
//
// A few years ago this became extremely popular using so-called "hashbang" URLS; urls containing the `#!` characters.
// The browser never sends anything to the right of the pound sign, leaving the JavaScript on the page to react to
// that portion of the url.  Hashbang URLs have since gone out of style, but making use of the history API is still
// very handy for using the URL to identify the state of the page.
//
// For our example, we will use `Backbone.History` to "deep link" to the results for the previous search.  History
// is a global object, however, and should not be interfaced with directly.  Instead, Backbone provides the `Router`
// class to serve as a feature-specific proxy.  You define the routes you want to react to on the Router, and when
// History sees that route, the Router will react to it.

// For our example we only need to react to a single route, `#search/<searchterm>`.  The keys on the routes property
// defines the pattern for the route, and the value identifies a name for the route.  The colon (`:`) prefix in the route
// pattern identifies that `term` is word that we want to capture as an argument, and not a literal part of the url.
var PageRouter = Backbone.Router.extend({
	routes: {
		'search/:term':  'search'
	}

	// If the router needed to perform an action itself, we could create a `search` function here to handle the event.
	// However, we need to react outside the scope of this class, so we leave it off.
});


// ##Tieing It All Together.
//
// Now that we have created all the distinct parts of our application, it is time to connect them all.

// First, initialize our search results collection.  Every piece of our application needs this.
var searchResults = new Movies();

// Next, we initialize the results view.  We pass in a css selector indentifying the element on the page to bind
// the view to, the collection object that the view represents, and the template that the view will use to render.
//
// The template for this view was defined in the HTML markup for the page, on a `<script>` tag with the
// `movie-results-template` id.  We use jQuery to fetch the contents of the tag and then pass that to Handlebars to
// compile into a template function.
var resultView = new MoviesList({
	el: '#results',
	collection: searchResults,
	template: Handlebars.compile($('#movie-results-template').html())
});

// Now we initialize the page router and bind an event handler to it for the search route.  When the URL changes,
// the handler will be triggered with the new search term.  Here is where we are actually telling our collection to
// perform a search.
var router = new PageRouter();
router.on('route:search', function (term) {
	searchResults.searchFor(term);
});

// Then we initialize the view for the search form, again passing in a selector for the form itself, and
// the collection that the form will take its term from.
var searchView = new SearchForm({
	el: '#search',
	collection: searchResults
});

// When the search form is submitted, it will trigger a search event.  Here we tell the router to change the url
// to match the new search term, specifying that it should trigger any events that this change would cause
// (By default, `router.navigate` will only update the url).
searchView.on('search', function (term) {
	router.navigate("search/"+encodeURIComponent(term), {trigger:true});
});

// Finally, the last thing we need to do is tell Backbone.History to start watching the page url for changes.
Backbone.history.start();

// That's it! Our application is now fully written.
//
// This tutorial is copyrighted &copy; Jarvis Badgley, 2013 and is released under an MIT license.
// If you have any questions, please feel free to [contact me on Twitter @ChiperSoft](http://twitter.com/ChiperSoft).
