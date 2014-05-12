#!/bin/bash

SCRIPT=$(cat)
red=$(tput setaf 1)
yellow=$(tput setaf 3)
cl=$(tput sgr0)

blob=$(echo "$SCRIPT" | curl \
	--data-urlencode "js_code@-" \
	-d compilation_level=SIMPLE_OPTIMIZATIONS \
	-d output_info=compiled_code \
	-d output_format=text \
	http://closure-compiler.appspot.com/compile)

if [[ $blob =~ ^Error ]]; then
	echo "${red}[GCCS] $blob" >&2
	echo "[MINIFY] Aborting.${cl}" >&2
	exit
else
	echo "$blob"
fi
