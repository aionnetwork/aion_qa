# Network Tests

This repository contains the network tests to monitor network health.

## Environment Setup

**Others**
  * need to have active aion kernel running - for realtime data
  * need to ammend file path in test files - for archived log data
  * `aion_qa` repository needs to be in `aion` folder

## Executing Tests

* Start a new terminal
* Navigate to the `aion_qa/Scripts/network` folder
* Run the command: 
```
./<testname>.sh
```

## Test Details

1. `node_stats_time.sh` - checks kernel for peer syncing behaviour

2. `peer_info.sh` - checks kernel for current peer details

3. `sync_block.sh` - checks kernel for peer blocks synced
