#!/bin/bash

function print_help() {
    echo ' '
    echo 'This script will record the procedure map difference every 10mins'
    echo ''
    echo 'Usage: ./mapsGraper.sh pid'
    echo ' '
}


if [ $# -eq 0 ]
then
        print_help
        exit 1
fi

PID=$1

MAPS="maps"

if [ ! -d $MAPS ]
then
    echo "Directory $MAPS DOES NOT exists. Create the directory."
    mkdir maps
fi

cat /proc/$PID/maps > ./$MAPS/map.0

count=0

echo "Start to record the procedure map diff."

while :
do
    cat /proc/$PID/maps > ./$MAPS/map.1
    diff ./$MAPS/map.0 ./$MAPS/map.1 > ./$MAPS/mapDiff.$count
    ((count++))
    sleep 10m
done
