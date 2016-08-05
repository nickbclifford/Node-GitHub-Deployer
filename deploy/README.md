Place your custom deploy scripts here.

The syntax for writing deploy scripts is to put a folder in this `deploy` directory with the name of the repository's author, and then in that directory, have the `.sh` file named the repository name.

For example, if I was writing a deploy script for "username/cool-repository", the directory structure would be like this:

* `/Node-GitHub-Deployer`
  * `/deploy`
     * `/username`
     	* `cool-repository.sh`