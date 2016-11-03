(function() {

"use strict";

var fs = require("fs"),
	path = require("path"),
	http = require("http"),
	async = require("async"),
	tiddlywiki = require("./tiddlywiki-utils"),
	fu = require("./file-utils");

exports.BINARY_ATTACHMENT_TYPES = ["image/png","image/jpeg","image/gif","application/pdf","image/x-icon"];

exports.ATTACHMENT_TYPES = ["image/svg+xml"].concat(exports.BINARY_ATTACHMENT_TYPES);

exports.WIKI_PREFIX = fs.readFileSync("./wiki-template/prefix.html","utf8");
exports.WIKI_SUFFIX = fs.readFileSync("./wiki-template/suffix.html","utf8");

exports.downloadSpaces = function(spacesFilepath,destPath,loginUsername,loginPassword) {
	var spacesFile = fs.readFileSync(spacesFilepath,"utf8"),
		spaces = tiddlywiki.deserializeMultidsFile(spacesFile);
	console.log("Number of spaces: ",spaces.length);
	var tasks = [];
	spaces.forEach(function(spaceTiddler) {
		var spaceName = spaceTiddler.title.substr("$:/_SpacesToMove/".length);
		tasks.push(function(callback) {
			console.log("Downloading: ",spaceName);
			exports.downloadSpace(spaceName,destPath,loginUsername,loginPassword);
			setTimeout(function() {
				callback(null);
			},1000)
		});
	});
	async.parallelLimit(tasks,1);
};

exports.downloadSpace = function(spaceName,destPath,loginUsername,loginPassword) {
	// Retrieve the status information for the space
	exports.retrieveJsonResource(
		"http://" + spaceName + ".tiddlyspace.com/status",
		path.resolve(destPath,"spaces/" + spaceName + "/status.json"),
		path.resolve(destPath,"spaces/" + spaceName + "/response.json"),
		loginUsername,loginPassword,
		function(err,data) {
			// Retrieve the recipe for the space
			var publicSpaceName = data.space.recipe;
			exports.retrieveJsonResource(
				"http://tiddlyspace.com/recipes/" + publicSpaceName + ".json",
				path.resolve(destPath,"recipes/" + publicSpaceName + "/recipe.json"),
				path.resolve(destPath,"recipes/" + publicSpaceName + "/response.json"),
				loginUsername,loginPassword,
				function(err,data) {
					// Retrieve each bag in turn
					data.recipe.forEach(function(bagInfo) {
						var bagName = bagInfo[0];
						exports.retrieveJsonResource(
							"http://tiddlyspace.com/bags/" + bagName + "/tiddlers.json?fat=1",
							path.resolve(destPath,"bags/" + bagName + "/tiddlers.json"),
							path.resolve(destPath,"bags/" + bagName + "/response.json"),
							loginUsername,loginPassword,
							function(err,data) {
							});
						});
				});
		});
};

exports.bakeWikis = function(spacesFilepath,sourceFilesPath,destPath) {
	var spacesFile = fs.readFileSync(spacesFilepath,"utf8"),
		spaces = tiddlywiki.deserializeMultidsFile(spacesFile),
		html = [];
	// Generate HTML index file
	html.push("<ul>");
	spaces.forEach(function(spaceTiddler) {
		var spaceName = spaceTiddler.title.substr("$:/_SpacesToMove/".length),
			spaceDescription = spaceTiddler.text;
		html.push("<li><a href='./" + spaceName + "/index.html' target='_blank'><strong>" + spaceName + "</strong>: " + spaceDescription + "</a></li>");
	});
	html.push("</ul>");
	fu.writeFileSyncCreatingDirectories(path.resolve(destPath,"./index.html"),html.join("\n"),"utf8");
	// Bake each wiki
	console.log("Number of spaces: ",spaces.length);
	spaces.forEach(function(spaceTiddler) {
		var spaceName = spaceTiddler.title.substr("$:/_SpacesToMove/".length);
		console.log("Baking: ",spaceName);
		exports.bakeWiki(spaceName,sourceFilesPath,destPath);
	});
};

exports.bakeWiki = function(spaceName,sourceFilesPath,destPath) {
	// Get the status
	var statusJson = JSON.parse(fs.readFileSync(path.resolve(sourceFilesPath,"./spaces/" + spaceName + "/status.json"),"utf8"));
	// Get the recipe
	var recipeName = statusJson.space.recipe,
		recipeJson = JSON.parse(fs.readFileSync(path.resolve(sourceFilesPath,"./recipes/" + recipeName + "/recipe.json"),"utf8")),
		bagEtags = {};
	// Accumulate the tiddlers from each bag in turn
	var tiddlers = {};
	for(var bagIndex = 0; bagIndex < recipeJson.recipe.length; bagIndex++) {
		var bagInfo = recipeJson.recipe[bagIndex],
			bagName = bagInfo[0],
			bagJson = JSON.parse(fs.readFileSync(path.resolve(sourceFilesPath,"./bags/" + bagName + "/tiddlers.json"),"utf8")),
			bagResponseJson = JSON.parse(fs.readFileSync(path.resolve(sourceFilesPath,"./bags/" + bagName + "/response.json"),"utf8"));
		bagEtags[bagName] = bagResponseJson.etag;
		bagJson.forEach(function(tiddler) {
			tiddlers[tiddler.title] = tiddler;
		});
	};
	// See if we already have bag etag data
	var buildFilepath = path.resolve(destPath,"./" + spaceName + "/build.json"),
		copyIncomingBagEtags = {}, existingBagEtags;
	if(fs.existsSync(buildFilepath)) {
		Object.assign(copyIncomingBagEtags,bagEtags);
		existingBagEtags = JSON.parse(fs.readFileSync(buildFilepath,"utf8"));
		Object.keys(copyIncomingBagEtags).forEach(function(bagName) {
			if(existingBagEtags[bagName] === copyIncomingBagEtags[bagName]) {
				delete existingBagEtags[bagName];
				delete copyIncomingBagEtags[bagName]
			}
		});
		if((Object.keys(existingBagEtags).length === 0) && (Object.keys(copyIncomingBagEtags).length === 0)) {
			console.log("Not bothering to build",spaceName);
			return;
		}
	}
	// Save the bag etag data
	fu.writeFileSyncCreatingDirectories(buildFilepath,JSON.stringify(bagEtags),"utf8");
	// Save the individual raw tiddler files
	Object.keys(tiddlers).sort().forEach(function(title) {
		var tiddler = tiddlers[title];
		if(exports.ATTACHMENT_TYPES.indexOf(tiddler.type || "") !== -1) {
			var encoding = "utf8";
			if(exports.BINARY_ATTACHMENT_TYPES.indexOf(tiddler.type || "") !== -1) {
				encoding = "base64";
			}
			fu.writeFileSyncCreatingDirectories(path.resolve(destPath,"./" + spaceName + "/" + title),tiddler.text,encoding);
		}
	});
	// Make the tiddler DIVs
	var tiddlerDivs = [];
	Object.keys(tiddlers).sort().forEach(function(title) {
		var tiddler = exports.convertTiddlyWebTiddlerToTiddlyWikiTiddler(tiddlers[title],spaceName,recipeName),
			div = [];
		div.push("<div");
		Object.keys(tiddler).forEach(function(fieldName) {
			if(fieldName !== "text") {
				div.push(" " + fieldName + "=\"" + tiddlywiki.htmlEncode(tiddler[fieldName]) + "\"");
			}
		});
		div.push(">\n<pre>");
		div.push(tiddlywiki.htmlEncode(tiddler.text));
		div.push("</pre>\n</div>");
		tiddlerDivs.push(div.join(""));
	});
	// Write the file
	var destFilePath = path.resolve(destPath,"./" + spaceName + "/index.html");
	fu.writeFileSyncCreatingDirectories(destFilePath,exports.WIKI_PREFIX + tiddlerDivs.join("\n") + exports.WIKI_SUFFIX,"utf8");
};

exports.convertTiddlyWebTiddlerToTiddlyWikiTiddler = function(tiddlyWebTiddler,spaceName,recipeName) {
	var fieldNames = Object.keys(tiddlyWebTiddler).concat(Object.keys(tiddlyWebTiddler.fields)),
		result = {};
	function getField(fieldName) {
		return tiddlyWebTiddler[fieldName] || tiddlyWebTiddler.fields[fieldName];
	}
	var type = tiddlyWebTiddler.type;
	if(type === "None") {
		type = "";
	}
	if(!type) {
		type = "text/x-tiddlywiki";
	}
	result["type"] = type;
	result["title"] = getField("title");
	result["text"] = getField("text");
	result["server.title"] = getField("title");
	result["server.page.revision"] = getField("revision");
	result["server.etag"] = "<none>";
	result["modifier"] = getField("modifier");
	result["creator"] = getField("creator");
	result["server.workspace"] = "bags/" + tiddlyWebTiddler.bag;
	result["server.type"] = "tiddlyweb";
	result["server.host"] = "http://" + spaceName + ".tiddlyspace.com";
	result["server.recipe"] = recipeName;
	result["server.bag"] = tiddlyWebTiddler.bag;
	result["server.permissions"] = getField("permissions");
	result["server.content-type"] = getField("type");
	result["modified"] = getField("modified");
	result["created"] = getField("created");
	result["tags"] = tiddlywiki.stringifyList(tiddlyWebTiddler.tags || []);
	result["_hash"] = getField("_hash");
	var exclusions = ["title","text","title","revision","modifier","creator","bag","type","modified","created","tags","_hash","uri","fields"];
	fieldNames.forEach(function(fieldName) {
		if(exclusions.indexOf(fieldName) === -1) {
			result[fieldName] = getField(fieldName);
		}
	});
	return result;
};

exports.retrieveJsonResource = function(url,destFilePath,destResponsePath,loginUsername,loginPassword,callback) {
console.log("Retrieving",url)
	var oldHeaders = {},
		urlParts = require("url").parse(url),
		deferredCallback = function(err,data) {
			setTimeout(function() {
				callback(err,data);
			},5000)
		};
	if(fs.existsSync(destResponsePath)) {
		oldHeaders = JSON.parse(fs.readFileSync(destResponsePath,"utf8"))
	}
	http.get({
		protocol: urlParts.protocol,
		host: urlParts.host,
		port: urlParts.port,
		path: urlParts.path,
		auth: loginUsername + ":" + loginPassword,
		headers: {
			"If-None-Match": oldHeaders.etag || ""
		}
	}).on("response",function(response) {
		var body = "";
		response.on("data",function(chunk) {
			body += chunk;
		});
		response.on("end",function() {
			if(response.statusCode === 200) { // OK
console.log("saving ",url)
				fu.writeFileSyncCreatingDirectories(destFilePath,body,"utf8");
				fu.writeFileSyncCreatingDirectories(destResponsePath,JSON.stringify(response.headers),"utf8");
				deferredCallback(null,JSON.parse(body));
			} else if(response.statusCode === 304) { // Not modified
console.log("unchanged ",url)
				deferredCallback(null,JSON.parse(fs.readFileSync(destFilePath,"utf8")));
			} else {
				console.log("Unknown status code",response.statusCode,url)
			}
		});
		response.on("error",function(e) {
			console.log("Error on GET request:",e);
			callback(e);
		});
	});
};

})();