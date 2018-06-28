#!/bin/bash

#cd ../../..
#file=../../../log/aionCurrentLog.dat
file=../testfile

echo '1. Active Peers:'
active=$(egrep -o -a 'active\[.{0,3}\]' $file | tail -1)
echo $active
#./aion.sh | egrep -o -a 'active\[.{0,3}\]'

# Check the 'active' connected peers from the kernel
# P2P status "active[  #]"

echo
echo '2. Peer Latency:'
egrep -a -o 'average\-delay\=[0-9]{0,3}ms' $file | tail -1
#./aion.sh | egrep -a '[p2p-clear]: average-delay=[0-9]{0,3}ms'

# Check the 'average delay' connected peers from the kernel
# "[p2p-clear]: average-delay"

echo
echo '3. Peer Stats:'
echo '	     ip: port:	  conn:	     	    bv:'
# 13.92.155.115 30303 outbound   0.2.7.1bbeec1
peers=$(echo $active | cut -d"[" -f2 | cut -d"]" -f1)
egrep -a -o ' *[0-9]{2,3}\.[0-9]{2,3}\.[0-9]{0,3}\.[0-9]{0,3}.*[0-9]{1}\.[0-9]{1}\.[0-9]{1}\.[a-z0-9]{0,10}' $file | tail -n -"$peers"
#./aion.sh | egrep -a -o ' *[0-9]{2,3}\.[0-9]{2,3}\.[0-9]{0,3}\.[0-9]{0,3}.*[0-9]{1}\.[0-9]{1}\.[0-9]{1}\.[a-z0-9]{0,10}'

# Check the detail of the connected peers
# p2p status: Hash / IP / Port / Connection / BV
