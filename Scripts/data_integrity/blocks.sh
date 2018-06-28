#!/bin/bash

file=../../../log/aionCurrentLog.dat
#file=../network/testfile

#\[sync\-ib\]\:
#\[p2p\-worker\-[0-9]{1}\]\:

blck=($(egrep "INFO  SYNC \[sync\-ib\]\:" $file | cut -d" " -f20 | tail -$1 | cut -c -6))
time=($(egrep "INFO  SYNC \[sync\-ib\]\:" $file | cut -d" " -f2 | tail -$1))
date=($(egrep "INFO  SYNC \[sync\-ib\]\:" $file | cut -d" " -f1 | tail -$1))

for ((i=0; i<${#blck[@]}; ++i)); do
	echo "${date[i]} ${time[i]} ${blck[i]}"
done
