#!/bin/bash

case $1 in
	prod) cat lucid.min.js ./bin/*.js;; 
	dev) cat lucid.js ./src/*.js;;
esac
