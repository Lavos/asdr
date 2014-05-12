#!/bin/bash

TEMPLATE=$(cat)
TYPE=$1
NAMESPACE=$2
NAME=$3

escape_singlequotes="s|'|\\\'|g"

CLEAN_TEMPLATE=$(echo "$TEMPLATE" | sed -e "$escape_singlequotes" | tr -d '\t\n\r')

case $TYPE in
	template)
		FUNCTION_NAME="template"
	;;

	style)
		FUNCTION_NAME="addStyle"
	;;

	*)
		echo "You must specify both the type and name of the element being embeded." >&2
		echo "USAGE: ./embed.sh [type] [name] < [element_file] > [processed file]" >&2
		exit
	;;
esac

echo "$NAMESPACE.provide('$NAME',['embed'],function(a){return a.$FUNCTION_NAME('$CLEAN_TEMPLATE')});"
