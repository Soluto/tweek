#!/bin/sh
exec ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /tmp/ssh_server "$@"
