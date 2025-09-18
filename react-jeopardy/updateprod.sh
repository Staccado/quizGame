#!/bin/bash
#
#


if [ ! $1 ] ; then

	echo "Please provide a directory"
	exit 1
fi



sudo cp -r ./build/* /var/www/html

if [ $? == 0 ]; 

then
	echo "done"
	exit 0
	


else
	echo "something went wrong"

	exit 1

fi



