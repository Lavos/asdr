#!/bin/bash

rm ./bin/*.js

for script in $(ls ./src/*.js)
do
	filename=$(basename "$script")
	extension="${filename##*.}"
	filename="${filename%.*}"

	blob=`curl \
		--data-urlencode "js_code@$script" \
		-d compilation_level=SIMPLE_OPTIMIZATIONS \
		-d output_info=compiled_code \
		-d output_format=text \
		http://closure-compiler.appspot.com/compile`

	echo "$blob" > ./bin/$filename.min.$extension
done

for script in $(ls ./src/modules/*.js)
do
	filename=$(basename "$script")
	extension="${filename##*.}"
	filename="${filename%.*}"

	blob=`curl \
		--data-urlencode "js_code@$script" \
		-d compilation_level=SIMPLE_OPTIMIZATIONS \
		-d output_info=compiled_code \
		-d output_format=text \
		http://closure-compiler.appspot.com/compile`

	echo "$blob" > ./bin/modules/$filename.min.$extension
done
