#!/bin/bash

echo "// $(date)"
echo "// $(git rev-parse HEAD)"

case $1 in
	prod) cat ./bin/first.min.js ./bin/modules/*.js ./bin/last.min.js;;
	dev) cat ./src/first.js ./src/modules/*.js ./src/last.js;;
esac
