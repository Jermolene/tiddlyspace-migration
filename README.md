# tiddlyspace-migration

Tools for migrating data from http://tiddlyspace.com/

## Installation

1. Download or clone this repository
2. Open a terminal window and change to the repo directory
3. Type `npm install`

## Usage

First, put the names of the spaces to be migrated in the file **spaces.multids**, with one entry per line of the format **spacename:optional comment**. Lines starting with **#** are ignored.

The batch script `run.sh` demonstrates the simplest way to use these tools:

    node ./index.js download-spaces ./spaces.multids ./downloads/
    node ./index.js bake-wikis ./spaces.multids ./downloads/ ./wikis/

The first command downloads each of the spaces listed in **spaces.multids** to the **downloads** subfolder:

* **./downloads/spaces/<space-name>/status.json** contains information about each space, including the recipe that makes up the space
* **./downloads/spaces/<space-name>/response.json** contains the metadata obtained when reading the space data. This information is used during subsequent downloads to avoid re-downloading unchanged content
* **./downloads/recipes/<recipe-name>/recipe.json** contains the recipe metadata for a recipe
* **./downloads/recipes/<recipe-name>/response.json** contains the metadata obtained when reading the recipe. This information is used during subsequent downloads to avoid re-downloading unchanged content
* **./downloads/bags/<bag-name>/tiddlers.json** contains the public tiddlers from the specified bag
* **./downloads/bags/<bag-name>/response.json** contains the metadata obtained when reading the bag. This information is used during subsequent downloads to avoid re-downloading unchanged content

The second command "bakes" each of the spaces listed in **spaces.multids** into a TiddlyWiki Classic v2.8.1 HTML file:

* **./wikis/<space-name>/index.html** contains the wiki HTML file
* **./wikis/<space-name>/<attachment>** contains all the raw tiddlers that are of the type **image/png**,**image/jpeg**,**image/gif**,**application/pdf** or **image/x-icon**

## Command Reference

The main **index.js** file contains a simple command interpreter that supports the following command line options.

* **<spacesFilepath>**: filepath of the **.multids** file containing the space names
* **<destPath>**: path of the folder in which to create the output
* **<spaceName>**: name of a space
* **<sourceFilesPath>**: path of the **downloads** folder containing the downloaded JSON files
* **<loginUsername>/<loginPassword>**: optional username/password. Private content will be saved if these credentials are provided

### **download-spaces**

Download each space listed in a **.multids** file

	node index.js download-spaces <spacesFilepath> <destPath> <loginUsername> <loginPassword>

### **download-space**

Download a specified space

	node index.js download-space <spaceName> <destPath> <loginUsername> <loginPassword>

### **bake-wikis**

Bake each wiki listed in a **.multids** file

	node index.js bake-wikis <spacesFilepath> <sourceFilesPath> <destPath>

### **bake-wiki**

Bake a specified wiki

	node index.js bake-wiki <spaceName> <sourceFilesPath> <destPath>


