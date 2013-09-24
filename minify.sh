#!/bin/bash

NAME=$1
SRC_BASE="./src/"
BIN_BASE="./bin/"
DIRS="library/ modules/"
SED_COMMANDS="s|%%LIBRARY_NAME%%|$1|g"

for dir in $DIRS
do
	echo "processing directory: $dir"
	rm $BIN_BASE$dir*.js

	for script in $SRC_BASE$dir*.js
	do
		echo "processing script: $script"
		filename=$(basename "$script")
		extension="${filename##*.}"
		filename="${filename%.*}"

		blob=$(curl \
			--data-urlencode "js_code@$script" \
			-d compilation_level=SIMPLE_OPTIMIZATIONS \
			-d output_info=compiled_code \
			-d output_format=text \
			http://closure-compiler.appspot.com/compile)

		echo "$blob" | sed "$SED_COMMANDS" > $BIN_BASE$dir$filename.min.$extension
	done
done
