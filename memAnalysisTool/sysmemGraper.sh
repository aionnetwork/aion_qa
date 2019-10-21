#!/bin/bash

function print_help() {
    echo ' '
    echo 'This script will grap the procedure system usage to system.log'
    echo ''
    echo 'Usage: ./sysmemGraper.sh pid'
    echo ' '
}


if [ $# -eq 0 ]
then
        print_help
        exit 1
fi

PID=$1

echo "PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND" >> sysmem.log

top -p $PID | grep "$PID" >> sysmem.log
