# Data Integrity Tests

This repository contains the data-integrity tests to assure data consistency on dashboard.

## Environment Setup

**Libraries**
* VirtualEnv
  * pip install -r requirements.txt
  * pycharm environment setup

**Drivers**
* Firefox Geckodriver (add to $PATH)
  * tar -xvzf geckodriver-v0.21.0-linux64.tar.gz 
  * chmod +x geckodriver
  * sudo mv geckodriver /usr/local/bin/

**Others**
  * `aion_qa` repository needs to be in `aion` folder

## Executing Tests

* Start a new terminal
* Navigate to the `aion_qa/Scripts/data_integrity` folder
* Run the command: 
```
Python3 <testname>.py
```

## Test Details

1. `block_latency.py` - checks kernel (sync) against database (mined)

2. `block_size_time.py` - checks database against dashboard statistics

3. `tx_validation.py` - checks nonce against transaction count
