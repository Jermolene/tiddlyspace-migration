(function() {

"use strict";

var fs = require("fs"),
	path = require("path");

/*
Check if a path identifies a directory
*/
function isDirectory(dirPath) {
	return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

/*
Recursively create a directory
*/
function createDirectory(dirPath) {
	if(dirPath.substr(dirPath.length-1,1) !== path.sep) {
		dirPath = dirPath + path.sep;
	}
	var pos = 1;
	pos = dirPath.indexOf(path.sep,pos);
	while(pos !== -1) {
		var subDirPath = dirPath.substr(0,pos);
		if(!isDirectory(subDirPath)) {
			try {
				fs.mkdirSync(subDirPath);
			} catch(e) {
				return "Error creating directory '" + subDirPath + "'";
			}
		}
		pos = dirPath.indexOf(path.sep,pos + 1);
	}
	return null;
}

/*
Recursively create directories needed to contain a specified file
*/
function createFileDirectories(filePath) {
	return createDirectory(path.dirname(filePath));
}

// Write a file, creating any necessary parent folders
function writeFileSyncCreatingDirectories(filePath,data,encoding) {
	createFileDirectories(filePath);
	fs.writeFileSync(filePath,data,encoding);	
}

exports.isDirectory = isDirectory;
exports.createDirectory = createDirectory;
exports.createFileDirectories = createFileDirectories;
exports.writeFileSyncCreatingDirectories = writeFileSyncCreatingDirectories;

})();