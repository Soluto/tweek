#!/bin/bash

source ~/.bashrc
while read oldrev newrev refname
do
	echo "Validating: " $newrev
	rm repo-dump.zip
	git archive $newrev --format zip --output repo-dump.zip
	curl -i -f -X POST -F revision=$newrev -F "dump=@repo-dump.zip" "$TWEEK_MANAGEMENT_URL/on-repo-change"
done