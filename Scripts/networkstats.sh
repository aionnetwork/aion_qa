#!/bin/bash

NODEID=$2

echo 'Greatest to Least Connected Peers'
egrep -Eo 'id:.{0,6}' "${1:-.}" | sort | uniq -c | sort -nr

