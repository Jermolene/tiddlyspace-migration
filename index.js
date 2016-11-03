(function() {

"use strict";

var fs = require("fs"),
	tiddlyspace = require("./lib/tiddlyspace-utils.js"),
	tiddlywiki = require("./lib/tiddlywiki-utils");

switch(process.argv[2]) {
	case "download-spaces":
		(function() {
			var spacesFilepath = process.argv[3],
				destPath = process.argv[4],
				loginUsername = process.argv[5],
				loginPassword = process.argv[6];
			if(!spacesFilepath) {
				throw "Missing spaces file path";
			}
			if(!destPath) {
				throw "Missing destination path";
			}
			tiddlyspace.downloadSpaces(spacesFilepath,destPath,loginUsername,loginPassword);
		})();
		break;
	case "download-space":
		(function() {
			var spaceName = process.argv[3],
				destPath = process.argv[4],
				loginUsername = process.argv[5],
				loginPassword = process.argv[6];
			if(!spaceName) {
				throw "Missing space name";
			}
			if(!destPath) {
				throw "Missing destination path";
			}
			tiddlyspace.downloadSpace(spaceName,destPath,loginUsername,loginPassword);
		})();
		break;
	case "bake-wikis":
		(function() {
			var spacesFilepath = process.argv[3],
				sourceFilesPath = process.argv[4],
				destPath = process.argv[5];
			// Check parameters
			if(!spacesFilepath) {
				throw "Missing spaces file path";
			}
			if(!sourceFilesPath) {
				throw "Missing source files path";
			}
			if(!destPath) {
				throw "Missing destination file path";
			}
			tiddlyspace.bakeWikis(spacesFilepath,sourceFilesPath,destPath);
		})();
		break;
	case "bake-wiki":
		(function() {
			var spaceName = process.argv[3],
				sourceFilesPath = process.argv[4],
				destPath = process.argv[5];
			// Check parameters
			if(!spaceName) {
				throw "Missing space name";
			}
			if(!sourceFilesPath) {
				throw "Missing source files path";
			}
			if(!destPath) {
				throw "Missing destination file path";
			}
			tiddlyspace.bakeWiki(spaceName,sourceFilesPath,destPath);
		})();
		break;
	default:
		throw "Missing command";
		break;
}

})();