#!/bin/bash
cd /usr/local/nagios/libexec
returnCode=$(./alastBlockTimestamp.js)
##echo 'ReturnCode is: ' $returnCode
output="returnCode: $returnCode | lastBlockCreationDelta=$returnCode"
if [ $returnCode -ge 0 -a $returnCode -le 21 ]; then
    echo "OK- $output"
    exit 0
elif [ $returnCode -ge 21 -a $returnCode -le 70 ]; then
    echo "WARNING- $output"
    exit 1
elif [ $returnCode -ge 70 ]; then
    echo "CRITICAL- $output"
    exit 2
else
echo "UNKNOWN- $output"
exit 3
fi

