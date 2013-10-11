#!/bin/bash

USAGE="USAGE: mash.sh library_name min|src"
NAME=$1
COMPRESSION=$2
SED_COMMANDS="s|__LIBRARY_NAME__|$1|g"

case $COMPRESSION in
	min)
		BASE='./bin/'
		EXT='.min.js'
	;;
	src)
		BASE='./src/'
		EXT='.js'
	;;
	*)
		echo "You must specify a compression."
		echo $USAGE
		return
	;;
esac

echo "// $(date)"
echo "// $(git rev-parse HEAD)"
cat ${BASE}library/first${EXT} ${BASE}modules/*${EXT} ${BASE}library/last${EXT} | sed "$SED_COMMANDS"
