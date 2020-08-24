set -e
git config --local user.email "$(git log --format='%ae' HEAD^!)"
git config --local user.name "$(git log --format='%an' HEAD^!)"  
docker tag soluto/tweek-$1 soluto/tweek-api:gh-test-$2
docker push soluto/tweek-$1:gh-test-$2
git tag -m "Version created: $1-$2" gh-tests-tweek-$1-$2
git push --follow-tags