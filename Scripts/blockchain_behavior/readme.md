# Blockchain Behavior Tests

This repository contains the blockchain behavior tests to assure correct blockchain responses for users.

## Environment Setup

**Libraries**
* VirtualEnv
  * pip install -r requirements.txt
  * pycharm environment setup

**Others**
  * `aion_qa` repository needs to be in `aion` folder

## Executing Tests

* Start a new terminal
* Navigate to the `aion_qa/Scripts/blockchain_behaviour` folder
* Run the command: 
```
Python3 <testname>.py
```

## Test Details

1. `block_rate.py` - checks block intervals for last # blocks

2. `nrg_usage.py` - checks block (nrg consumed) against tx (nrg consumed) 

3. `tx_latency.py` - checks tx sent time against tx seal time
