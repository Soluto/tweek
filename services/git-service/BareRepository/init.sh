#!/bin/sh

# If there is some public key in keys folder
# then it copies its contain in authorized_keys file
cd /home/git
if [ -n "$PUBLIC_KEY_INLINE" ]; then 
  echo "$PUBLIC_KEY_INLINE" | base64 -d > .ssh/authorized_keys
fi

if [ -n "$PUBLIC_KEY_PATH" ]; then 
  cat $PUBLIC_KEY_PATH > .ssh/authorized_keys
fi

chown -R git:git .ssh
chmod 700 .ssh
chmod -R 600 .ssh/*

# Checking permissions and fixing SGID bit in repos folder
# More info: https://github.com/jkarlosb/git-server-docker/issues/1
cd /tweek/repo
chown -R git:git .
chmod -R ug+rwX .
chmod g+s .
chmod -R a+x hooks

cd /tweek/tests
chown -R git:git .
chmod -R ug+rwX .
chmod g+s .
chmod -R a+x hooks

echo export TWEEK_MANAGEMENT_URL=$TWEEK_MANAGEMENT_URL >> /home/git/.bashrc

# -D flag avoids executing sshd as a daemon
/usr/sbin/sshd -D