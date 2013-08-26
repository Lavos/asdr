#!/bin/bash

USAGE="USAGE: mash.sh min|src"
COMPRESSION=$1

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
cat ${BASE}library/first${EXT} ${BASE}modules/*${EXT} ${BASE}library/last${EXT}
