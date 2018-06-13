#!/bin/bash

cd ..

echo 'Active Peers:'

# Check the 'active' connected peers from the kernel
# P2P status "active[  #]"

./aion.sh | egrep -o -a 'active\[.{0,3}\]'


