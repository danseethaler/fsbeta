var express = require('express'),
	path = require('path'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	FamilySearch = require('familysearch-javascript-sdk'),
	request = require('request'),
	q = require('q'),
	fs = require('fs');

var routes = require('./routes/index');
users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// Listen for a POST request to the URL/loggedin URL
app.post('/loggedin', function (req, res) {

	// Create a new FamilySearch object (instance) in node
	var client = new FamilySearch({
		// Hard coded client_id
		client_id: 'a02j0000007rShWAAU',
		environment: 'beta',
		// Access token is received from the client
		access_token: req.body.accessToken,
		http_function: request,
		deferred_function: q.defer
	});

	// Call the getCurrentUser method on the client
	// to get information about the user
	// TODO: This is already being done in the Angular app
	// TODO: should be removed at some point
	client.getCurrentUser().then(function (response) {

		// get the user data and set it to the user variable.
		var user = response.getUser();

		// Create a new user object
		var thisUser = {
			contactName: user.contactName,
			helperAccessPin: user.helperAccessPin,
			givenName: user.givenName,
			familyName: user.familyName,
			email: user.email,
			country: user.country,
			gender: user.gender,
			birthDate: user.birthDate,
			preferredLanguage: user.preferredLanguage,
			displayName: user.displayName,
			personId: user.personId,
			treeUserId: user.treeUserId
		};

		//
		fs.writeFile('users/' + thisUser.personId + '.json', JSON.stringify(thisUser, null, 4), function (err) {
			if (!err) {
				console.log('File successfully written.');
				res.send('Success.')
			} else {
				console.log(err);
				res.send("File could not be created.");
			}
		})

	});
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
