#!/bin/bash
echo `pwd` >> /tweek/repo.log
set -o pipefail
cat | ruby /tweek/hooks/pre-receive.rb | tee -a /tweek/repo.log
# echo "finished hook" >> /tweek/repo.log

# function printDependencies ()
# {
# 	 local DEPS=$(git show $1:$2 | jq -r .dependencies[])
# 	 if [ -z $DEPS ]; then 
# 	  echo "no deps"
# 	 	return
# 	 fi
# 	 while read -r line; do
# 	  local file=manifests/$line.json
#    echo $file
# 		git show $1:$file | cat
# 		printDependencies $1 $file
# 	done <<< $DEPS
# }

# source ~/.env >> /tweek/repo.log 2>&1
# echo "got new commits" >> /tweek/repo.log
# while read oldrev newrev refname
# do
# 	echo "Validating: " $newrev >> /tweek/repo.log
# 	rm -f repo-dump.zip
# 	echo $(git diff --name-only $oldrev $newrev | while read file; do
# 	 echo $file
# 	 echo $newrev:$file
#   git show $newrev:$file | cat
# 	 echo "checking if manifest"
# 	 if [[ $file == manifests* ]]
# 	 then 
# 	 	printDependencies $newrev $file
# 	 	echo "manifest file"
# 	 fi
#  done
# 	) >> /tweek/repo.log
# 	git archive $newrev --format zip --output repo-dump.zip
# 	echo curl -i -f -X POST -F revision=$newrev -F "dump=@repo-dump.zip" "$TWEEK_MANAGEMENT_URL/on-repo-change" >> /tweek/repo.log
# 	curl -i -f -X POST -F revision=$newrev -F "dump=@repo-dump.zip" "$TWEEK_MANAGEMENT_URL/on-repo-change" >> /tweek/repo.log 2>&1
# done