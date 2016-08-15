Place your custom deploy scripts here.

The syntax for writing deploy scripts is to put a folder in this `deploy` directory with the name of the repository's author, and then in that directory, a folder with the name of the repository, and then in that directory, have the `.sh` file named the branch name.

For example, if I was writing a deploy script for "username/cool-repository" on branch "master", the directory structure would be like this:

* `/Node-GitHub-Deployer`
  * `/deploy`
     * `/username`
     	* `/cool-repository`
     		* `master.sh`

The deploy scripts will be executed in the directory of the repository.
