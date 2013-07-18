#!/bin/bash

# pushes to Akamai NetStorage
# assumes you have a private key set for the domain in ~/.ssh/config
# like:
#	Host spinmedia123.upload.akamai.com
#		Hostname spinmedia123.upload.akamai.com
#		IdentityFile [your key location]

ACTION=$1
CP_CODE=228070
URL="spinmedia123.upload.akamai.com"

case $ACTION in
	prod) rsync -i -v -av -e ssh "${@:2}" sshacs@$URL:/$CP_CODE/;;
	test) rsync -i -n -v -av -e ssh "${@:2}" sshacs@$URL:/$CP_CODE/;;
	*) echo "You must specify either 'prod' or 'test'.";;
esac
