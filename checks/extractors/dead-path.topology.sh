#!/bin/sh
# Purpose: dead-path census — task-to-queue routings and schedules joined to a declared process; this page declares neither.
set -eu
p=$(sed -n 's/^  processes: *\[\(.*\)\].*/\1/p' docker-compose.test.yml 2>/dev/null | tr ',' ' ')
q=$(grep -Eho "(new Worker|BroadcastChannel|setInterval)\(" app/*.js 2>/dev/null | sort -u || true)
if [ -z "$q" ]; then echo "inactive no routing or schedule declared"; exit 0; fi
for s in $q; do
  if [ -n "$p" ]; then echo "ok schedule:$s"; else echo "orphan schedule:$s no declared process consumes it"; fi
done
