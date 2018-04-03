aion_qa
=====

This repository contains test scripts for the [Aion Kernel](https://github.com/aionnetwork/aion).


Contents of this repository
---------------------------

* Web3
* MultisigWallet
* TestBench

## System Requirements

* **Ubuntu 16.04** or a later version

## Aion Installation

1. Download the latest Aion kernel release from the [releases page](https://github.com/aionnetwork/aion/releases).

2. Unarchive the downloaded file by right clicking on it and selecting `Extract Here` from the drop-down menu.
The `aion` folder will be generated in the current folder.

Alternatively in a terminal run:

```
tar xvjf aion-{@version}.tar.bz2
```

3. In a terminal navigate to the `aion` folder and continuue by configuring the network:

```
cd aion
```

## Launch kernel

In a terminal, from the aion directory, run:

```
./aion.sh
```
