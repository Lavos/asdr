#!/bin/bash

FILE=$1
CP_CODE=228070
URL="spinmedia123.upload.akamai.com"

rsync -av -e "ssh -i ./kris.buzzmedia.private.key" "$FILE" sshacs@$URL:/$CP_CODE/
