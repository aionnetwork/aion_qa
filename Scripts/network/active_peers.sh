#!/bin/bash

cd ../../..

echo 'Active Peers:'

./aion.sh | egrep -o -a 'active\[.{0,3}\]'

# Check the 'active' connected peers from the kernel
# P2P status "active[  #]"
