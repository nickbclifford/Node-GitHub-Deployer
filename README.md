# Node-GitHub-Deployer
Automagically detects any commits in a GitHub Repo and deploys it on a server.

## Installing
Clone this repository, and then run `npm install`. Very simple!

## Webhooks
In order for this deployer to work, you must set up a GitHub webhook for your repositories and point that webhook to this server. More info is available [here.](https://developer.github.com/webhooks/)

## Configuring
Make sure that you use `config.example.js` when creating the required `config.js`. You just have to configure the port you will be using, the repositories that you are tracking, and the local paths of those repositories.

## Starting
This project uses PM2, which is a program that daemonizes your apps. To start Node-GitHub-Deployer, run `npm start`. To view the console, run `npm run console`.

## Behavior/Deploying
By default, when Node-GitHub-Deployer recieves a POST request from a GitHub webhook, it will run `git pull` on the local copy of the repository. If you have a separate script to use when deploying, put that `.sh` file in the `deploy` folder. There are further instructions on how to name the file in `deploy/README.md`.

## When Creating Branches
When creating a new branch that needs its own directory, be sure to configure Node-GitHub-Deployer beforehand to avoid any errors.