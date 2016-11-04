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

* **./downloads/spaces/&lt;space-name&gt;/status.json** contains information about each space, including the recipe that makes up the space
* **./downloads/spaces/&lt;space-name&gt;/response.json** contains the metadata obtained when reading the space data. This information is used during subsequent downloads to avoid re-downloading unchanged content
* **./downloads/recipes/&lt;recipe-name&gt;/recipe.json** contains the recipe metadata for a recipe
* **./downloads/recipes/&lt;recipe-name&gt;/response.json** contains the metadata obtained when reading the recipe. This information is used during subsequent downloads to avoid re-downloading unchanged content
* **./downloads/bags/&lt;bag-name&gt;/tiddlers.json** contains the public tiddlers from the specified bag
* **./downloads/bags/&lt;bag-name&gt;/response.json** contains the metadata obtained when reading the bag. This information is used during subsequent downloads to avoid re-downloading unchanged content

The second command "bakes" each of the spaces listed in **spaces.multids** into a TiddlyWiki Classic v2.8.1 HTML file:

* **./wikis/&lt;space-name&gt;/index.html** contains the wiki HTML file
* **./wikis/&lt;space-name&gt;/&lt;attachment&gt;** contains all the raw tiddlers that are of the type **image/png**,**image/jpeg**,**image/gif**,**application/pdf** or **image/x-icon**

## Command Reference

The main **index.js** file contains a simple command interpreter that supports the following command line options.

* **&lt;spacesFilepath&gt;**: filepath of the **.multids** file containing the space names
* **&lt;destPath&gt;**: path of the folder in which to create the output
* **&lt;spaceName&gt;**: name of a space
* **&lt;sourceFilesPath&gt;**: path of the **downloads** folder containing the downloaded JSON files
* **&lt;loginUsername&gt;/&lt;loginPassword&gt;**: optional username/password. Private content will be saved if these credentials are provided

### **download-spaces**

Download each space listed in a **.multids** file

	node index.js download-spaces &lt;spacesFilepath&gt; &lt;destPath&gt; &lt;loginUsername&gt; &lt;loginPassword&gt;

### **download-space**

Download a specified space

	node index.js download-space &lt;spaceName&gt; &lt;destPath&gt; &lt;loginUsername&gt; &lt;loginPassword&gt;

### **bake-wikis**

Bake each wiki listed in a **.multids** file

	node index.js bake-wikis &lt;spacesFilepath&gt; &lt;sourceFilesPath&gt; &lt;destPath&gt;

### **bake-wiki**

Bake a specified wiki

	node index.js bake-wiki &lt;spaceName&gt; &lt;sourceFilesPath&gt; &lt;destPath&gt;


