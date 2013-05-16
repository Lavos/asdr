#!/bin/bash

case $1 in
	prod) cat lucid.js ./bin/*.js;; 
	dev) cat lucid.js ./src/*.js;;
esac
