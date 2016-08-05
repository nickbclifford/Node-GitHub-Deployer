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

var allRepos = config.repositories;

/*
 * Require modules
 */

var express = require('express');
var bodyParser = require('body-parser');
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
	var workingPath = allRepos[activeRepo];
	require('simple-git')(workingPath)
		.pull(function(err) {
			if(err) {
				console.log("Error when pulling from repository " + activeRepo + ": " + err.message);
			} else {
				console.log("Successfully pulled from repository " + activeRepo + "!");
			}
		});
});

/*
 * Establish Server
 */

app.listen(port, function() {
	console.log('Server is listening on *:' + port + '.');
	var listOfRepos = "";
	var iterator = Object.keys(allRepos);
	iterator.forEach(function(key) {
		var value = allRepos[key];
		// if list is only one element long
		if(iterator.length == 1) {
			listOfRepos += key + ".";
 		// if last element of list (evil hack because objects are technically unordered)
		} else if(value === allRepos[iterator[iterator.length - 1]]) {
			listOfRepos += "and " + key + ".";
		} else {
			// because English punctuation rules are inconsistent, we have to check for two
			if(iterator.length == 2) {
				listOfRepos += key + " ";
			} else {
				listOfRepos += key + ", ";
			}
		}
	});
	console.log('Listening for commits on ' + listOfRepos);
});
