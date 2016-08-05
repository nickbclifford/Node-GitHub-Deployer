'use strict';

/*
 * Make sure you create a config.js!
 */

try {
	var config = require(__dirname + '/config.js');
} catch(e) {
	throw new Error('***PLEASE CREATE A CONFIG.JS ON YOUR LOCAL SYSTEM. REFER TO CONFIG.EXAMPLE.JS***');
}
var port = process.env.PORT || config.port;

/*
 * Require modules
 */

var express = require('express');
var app = express();

/*
 * Middleware
 */

// Read POST Request Variables
app.use(bodyParser.json());

/*
 * Routes
 */

app.post('/', function(req, res) {
	console.log(req.body);
	// gets the repository name from the webhook
	var activeRepo = req.body.repository.full_name;
	// grabs the path from the config.js
	var workingPath = config.repositories[activeRepo];
	require('simple-git')(workingPath)
		.pull(function(err) {
			if(err) {
				console.log("Error when pulling from repository %s!", activeRepo);
			}
		});
});

/*
 * Establish Server
 */

app.listen(port, function() {
	console.log('Server is listening on *:' + port);
});
