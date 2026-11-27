#!/bin/sh
# Purpose: the memory reader — the host's available memory in MB, for the observer's report.
set -eu
if [ -r /proc/meminfo ]; then awk '/^MemAvailable:/ { printf "free-mb %d\n", $2 / 1024; f = 1 } END { if (!f) print "inactive no MemAvailable in /proc/meminfo" }' /proc/meminfo
else echo "inactive /proc/meminfo is not readable"; fi
