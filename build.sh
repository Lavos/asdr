#!/bin/bash

case $1 in
	prod) cat ./bin/first.min.js ./bin/modules/*.js ./bin/last.min.js;; 
	dev) cat ./bin/first.js ./src/modules/*.js ./bin/last.js;;
esac
