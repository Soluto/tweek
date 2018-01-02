#!/bin/bash

SSHD=/usr/sbin/sshd

function execute_sshd() {
    eval $SSHD -D -e &
}

function sshd_not_running() {
    # read pid
    local pid=$(cat /run/sshd.pid 2>/dev/null)
    # read path to executable for this pid
    local sshd=$(readlink /proc/$pid/exe 2>/dev/null)
    # is it the same as the executable we expect?
    if [[ "$sshd" == "$SSHD" ]]
    then return 1
    else return 0
    fi
}

touch /tweek/repo.log
chown git:git /tweek/repo.log
tail -f /tweek/repo.log 2>&1 &

# polling loop
while true
do
    if sshd_not_running; then
        echo "sshd is not running - starting it"
        execute_sshd
    fi
    sleep 1
done