#!/bin/bash

file=../../../log/aionCurrentLog.dat
#file=../testfile

#\[sync\-ib\]\:
#\[p2p\-worker\-[0-9]{1}\]\:

blck=($(egrep -o "number = [0-9]{0,10}.*result = IMPORTED_BEST" $file | cut -d" " -f3 | tail -$1 | cut -c -6))
time=($(egrep "number = [0-9]{0,10}.*result = IMPORTED_BEST" $file | cut -d" " -f2 | tail -$1))
date=($(egrep "number = [0-9]{0,10}.*result = IMPORTED_BEST" $file | cut -d" " -f1 | tail -$1))

for ((i=0; i<${#blck[@]}; ++i)); do
	echo "${date[i]} ${time[i]} ${blck[i]}"
done
