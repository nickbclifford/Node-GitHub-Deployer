/*
 * Please copy this template into a config.js
 * Create a config.js on every machine you run this code on.
 */

module.exports = {
	port: 42069,

	repositories: {
		"user/repo": {"master": "/home/user/dev/repo"},
		"other/repo-v2": {
			"master": "/home/user/dev/repo-v2/master",
			"supercool-branch": "/home/user/dev/repo-v2/supercool"
		}
	}
};
