#!/bin/bash

while read oldrev newrev refname
do
	echo "Validating: " $newrev
	rm repo-dump.zip
	git archive $newrev --format zip --output repo-dump.zip
	curl -i -f -X POST -F revision=$newrev -F "dump=@repo-dump.zip" "https://tweek-management.azurewebsites.net/on-repo-change"
done

###################################################################
# copy & paste this as the pre-receive git hook in the rules repo #
###################################################################
