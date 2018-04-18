#!/bin/bash

echo 'Greatest to Least Connected Peers'
egrep -Eo 'id:.{0,6}' "${1:-.}" | sort | uniq -c | sort -nr

echo 'Unexpected Errors'
egrep -i 'Broken pipe|close-socket|decode' "${1:-.}"

