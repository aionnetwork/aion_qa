#!/bin/bash

cd ../../..

echo 'Peer Latency:'

# Check the 'average delay' connected peers from the kernel
# "[p2p-clear]: average-delay"

./aion.sh | egrep -a '[p2p-clear]: average-delay=[0-9]{0,3}ms' 

