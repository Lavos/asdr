#!/bin/bash

case $1 in
	prod) cat lucid.first.min.js ./bin/*.js lucid.last.min.js;; 
	dev) cat lucid.first.js ./src/*.js lucid.last.js;;
esac
