"use strict";

/*
 * Make sure you create a config.js!
 */

try {
	var config = require(__dirname + "/config.js");
} catch(e) {
	throw new Error("***PLEASE CREATE A CONFIG.JS ON YOUR LOCAL SYSTEM. REFER TO CONFIG.EXAMPLE.JS***");
}
var port = process.env.PORT || config.port;

var allRepos = config.repositories;

var ngdRoot = __dirname.slice(0, -4) //remove "/src" from the end of __dirname

/*
 * Require modules
 */

var fs 			= require("fs");
var exec 		= require("child_process").exec;
var express 	= require("express");
var bodyParser 	= require("body-parser");
var app 		= express();

/*
 * Middleware
 */

// Read POST Request Variables
app.use(bodyParser.json());

/*
 * Routes
 */

app.post("/", function(req, res) {
	// console.log(req.body);

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

	var workingPath = allRepos[activeRepo][activeBranch];

	var customScriptPath = __dirname + "/../deploy/" + owner + "/" + repoName + "/";
	var customScriptName = customScriptPath + activeBranch + ".sh";

	var logFileName = customScriptPath + activeBranch + "." + Date.now();

	// check if active repo is configured
	if(Object.keys(allRepos).includes(activeRepo)) {
		// check if active branch is configured
		if(Object.keys(allRepos[activeRepo]).includes(activeBranch)) {
			// if so, check for custom deploy script
			fs.stat(customScriptPath, function(statErr, stat) {
				if(statErr == null) {
					// there's a custom deploy script? fantastic. let's execute it. (with the webhook request as $WEBHOOK, and in the repo directory)
					exec("(WEBHOOK=" + JSON.stringify(req.body) + "; cd " + workingPath + "; " + customScriptPath + ")", function(execErr, stdout, stderr) {
						console.log("stdout: " + stdout);
						console.log("stderr: " + stderr);
						if(execErr) {
							console.log("Error when executing custom deploy script for repository " + activeRepo + " on branch " + activeBranch + "!");
							res.sendStatus(500);
							// write log files for stdout and stderr if there's an error executing
							fs.writeFile(logFileName + ".out", stdout, function(logErr) {
								if(logErr) {
									console.log("Error writing stdout log file for deploy script for repository " + activeRepo + " on branch " + activeBranch + "!");
								}
							});
							fs.writeFile(logFileName + ".err", stderr, function(logErr) {
								if(logErr) {
									console.log("Error writing stderr log file for deploy script for repository " + activeRepo + " on branch " + activeBranch + "!");
								}
							});
						} else {
							console.log("Successfully executed custom deploy script for repository " + activeRepo + " on branch " + activeBranch + "!");
							res.sendStatus(200);
						}
					});
				} else if(statErr.code == "ENOENT") {
					// custom deploy script doesn't exist? that's fine, just pull.

					// however, if this repository is being pulled on, announce it first
					if(ngdRoot === workingPath) {
						console.log("About to pull on Node-GitHub-Deployer's repository. (" + activeRepo + ")");
					}
					
					// grabs the path from the config.js
					require("simple-git")(workingPath).pull(function(pullErr) {
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
		} else {
			// if not, just say that we detected the commit
			console.log("Commit detected on repository " + activeRepo + " on branch " + activeBranch + ", but there is no local path for the branch.");
		}
	} else {
		// if not, just say that we detected the commit
		console.log("Commit detected on repository " + activeRepo + ", but there is no local path for the repository.");
	}
});

/*
 * Establish Server
 */

app.listen(port, function() {
	console.log("Server is listening on *:" + port + ".");
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
	console.log("Listening for commits on " + listOfRepos);
});
