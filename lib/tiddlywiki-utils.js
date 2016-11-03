(function() {

"use strict";

// Convert & to "&amp;", < to "&lt;", > to "&gt;", " to "&quot;"
function htmlEncode(s) {
	if(s) {
		return s.toString().replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");
	} else {
		return "";
	}
}

// Stringify an array of tiddler titles into a list string
function stringifyList(value) {
	var result = [];
	for(var t=0; t<value.length; t++) {
		if(value[t].indexOf(" ") !== -1) {
			result.push("[[" + value[t] + "]]");
		} else {
			result.push(value[t]);
		}
	}
	return result.join(" ");
}

// Extract tiddlers from a .multids tiddler file
function deserializeMultidsFile(text,fields) {
	var titles = [],
		tiddlers = [],
		match = /\r?\n\r?\n/mg.exec(text);
	if(match) {
		fields = parseFields(text.substr(0,match.index),fields);
		var lines = text.substr(match.index + match[0].length).split(/\r?\n/mg);
		for(var t=0; t<lines.length; t++) {
			var line = lines[t];
			if(line.charAt(0) !== "#") {
				var colonPos= line.indexOf(":");
				if(colonPos !== -1) {
					var tiddler = Object.create(null);
					Object.assign(tiddler,fields);
					tiddler.title = (tiddler.title || "") + line.substr(0,colonPos).trim();
					if(titles.indexOf(tiddler.title) !== -1) {
						console.log("Warning: .multids file contains multiple definitions for " + tiddler.title);
					}
					titles.push(tiddler.title);
					tiddler.text = line.substr(colonPos + 2).trim();
					tiddlers.push(tiddler);
				}
			}
		}
	}
	return tiddlers;
}

// Parse a block of name:value fields. The `fields` object is used as the basis for the return value
function parseFields(text,fields) {
	fields = fields || Object.create(null);
	text.split(/\r?\n/mg).forEach(function(line) {
		if(line.charAt(0) !== "#") {
			var p = line.indexOf(":");
			if(p !== -1) {
				var field = line.substr(0, p).trim(),
					value = line.substr(p+1).trim();
				if(field) {
					fields[field] = value;
				}
			}
		}
	});
	return fields;
}

exports.htmlEncode = htmlEncode;
exports.stringifyList = stringifyList;
exports.deserializeMultidsFile = deserializeMultidsFile;
exports.parseFields = parseFields;

})();