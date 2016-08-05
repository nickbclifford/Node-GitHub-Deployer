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
var simpleGit = require('simple-git');

/*require('simple-git')(__dirname + '/some-repo')
        .pull()
        .tags(function(err, tags) {
        	console.log("Latest available tag: %s", tags.latest);
		});*/

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
	res.json(req.body);
});

/*
 * Establish Server
 */

app.listen(port, function() {
	console.log('Server is listening on *:' + port);
});
