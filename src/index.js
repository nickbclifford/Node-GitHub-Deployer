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

var fs 			= require('fs');
var exec 		= require('child_process').exec;
var express 	= require('express');
var bodyParser 	= require('body-parser');
var app 		= express();

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

	try {
		var splitRef = req.body.ref.split("/");
		var activeBranch = splitRef[splitRef.length - 1];
	} catch(e) {
		var activeBranch = "master";
	}

	var owner = req.body.repository.owner.name;
	var repoName = req.body.repository.name;


	var customScriptPath = __dirname + "/../deploy/" + owner + "/" + repoName + "/" + activeBranch + ".sh";

	fs.stat(customScriptPath, function(statErr, stat) {
		if(statErr == null) {
			// there's a custom deploy script? fantastic. let's execute it. (with the webhook request as $WEBHOOK)
			exec("WEBHOOK=" + JSON.stringify(req.body) + "; " + customScriptPath, function(execErr, stdout, stderr) {
				if(execErr) {
					console.log("Error when executing custom deploy script for repository " + activeRepo + " on branch " + activeBranch + "!");
					res.sendStatus(500);
				} else {
					console.log("stdout: " + stdout);
					console.log("stderr: " + stderr);
					console.log("Successfully executed custom deploy script for repository " + activeRepo + " on branch " + activeBranch + "!");
					res.sendStatus(200);
				}
			});
		} else if (statErr.code == 'ENOENT') {
			// custom deploy script doesn't exist? that's fine, just pull.
			
			// grabs the path from the config.js
			var workingPath = allRepos[activeRepo][activeBranch];
			require('simple-git')(workingPath).pull(function(pullErr) {
				if(pullErr) {
				    console.log("Error when pulling from repository " + activeRepo + " on branch " + activeBranch + "!");
				    res.sendStatus(500);
				} else {
				    console.log("Successfully pulled from repository " + activeRepo + " on branch " + activeBranch + "!");
				    res.sendStatus(200);
				}
			});
		} else {
			console.log("Error when checking for custom deploy script for repository " + activeRepo + " on branch " + activeBranch + "!");
			res.sendStatus(500);
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
