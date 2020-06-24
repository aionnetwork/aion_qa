# JMeter Tests

This repository contains tests that use JMeter to assess the performance of the API.

## System Requirements

* [**JMeter**](https://jmeter.apache.org/download_jmeter.cgi) should be in the `JMeterTests` folder


## Setup

* Ensure that kernel's config file has rpc-server set to true
* _(optional)_ Set the RPC thread number in the config file to desired value
* Start the kernel, connecting to mainnet

## Running Tests

* To run the test suite, navigate to the `JMeterTests` folder and run 
```
./testScript <RPC_IP_ADDRESS> <RPC_IP_PORT> <output folder>
```
The IP address and Port number can be found in the kernel's config file. 

As an example, to run the tests on a kernel that can be accessed at 127.0.0.1:8545, and save the results in a folder called TestResults, run

```
./testScript 127.0.0.1 8545 TestResults
```

* You can modify the number of threads per test and the number of times each test is run
by editing these values in the `TestHeader` file


