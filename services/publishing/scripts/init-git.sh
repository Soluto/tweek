#!/bin/bash
if [ -d "/tweek/repo" ]; then
    cd /tweek/repo
    git fetch origin '+refs/heads/*:refs/heads/*'
    exit $?
fi

echo export GIT_UPSTREAM_URI=$GIT_UPSTREAM_URI >> /home/git/.env
echo export GIT_SSH=/tweek/ssh-helper.sh >> /home/git/.env

# copy the contents of given public key to authorized_keys file to allow it to access the repo
if [[ -f "$GIT_PUBLIC_KEY_PATH" ]]
then
    cat $GIT_PUBLIC_KEY_PATH > /home/git/.ssh/authorized_keys
else
    echo You must set GIT_PUBLIC_KEY_PATH environment variable
    exit 1
fi

# remove default/autogenerated sshd keys and copy the contents of server private key to where sshd expects to find it
if [[ -f "$GIT_SERVER_PRIVATE_KEY_PATH" ]]
then
    cat $GIT_SERVER_PRIVATE_KEY_PATH > /tmp/ssh_server
    chown git:git /tmp/ssh_server
    chmod 600 /tmp/ssh_server
else
    echo You must set GIT_SERVER_PRIVATE_KEY_PATH environment variable
    exit 1
fi

# clone the source repository and apply hooks
# set -e
git clone --bare $GIT_UPSTREAM_URI /tweek/repo
cp /tweek/hooks/* /tweek/repo/hooks/
# set +e

# Checking permissions and fixing SGID bit in repos folder
cd /tweek/repo
chown -R git:git .
chmod -R ug+rwX .
chmod g+s .
chmod -R ug+x hooks

chown git:git /home/git/.env