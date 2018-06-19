#!/bin/bash

cd ../../..

echo 'Peers Stats:'

echo '	     ip: port:	  conn:	     	    bv:'
# 13.92.155.115 30303 outbound   0.2.7.1bbeec1

./aion.sh | egrep -a -o ' *[0-9]{2,3}\.[0-9]{2,3}\.[0-9]{0,3}\.[0-9]{0,3}.*[0-9]{1}\.[0-9]{1}\.[0-9]{1}\.[a-z0-9]{0,10}'

# Check the detail of the connected peers
# p2p status: Hash / IP / Port / Connection / BV
