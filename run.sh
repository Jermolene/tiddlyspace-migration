#!/bin/bash

#node ./index.js download-space tiddlywiki ./downloads

#node ./index.js bake-wiki tiddlywiki ./downloads/ ./wikis/

node ./index.js download-spaces ./spaces.multids ./downloads/

node ./index.js bake-wikis ./spaces.multids ./downloads/ ./wikis/

