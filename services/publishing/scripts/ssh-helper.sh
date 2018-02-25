#!/bin/sh
exec ssh -o StrictHostKeyChecking=no -i /tmp/ssh_server "$@"