# Leasehold Core
Engine for running vertically scalable Leasehold-based nodes and DEX markets. Built using [LDEM](https://github.com/jondubois/ldem).

## Features

- Runs each module in a separate process to make use of all available CPU cores for best performance.
- Can be used to easily create and launch custom Leasehold-based blockchains using only config changes.
- Custom `capitalisk-dex` markets can be launched between any two running blockchains using only config changes - This allows any sidechain to be instantly tradable.
- The network module can also be duplicated using only config changes for maximum node resilience.
- Module crashes are isolated from each other.


## Installation (Ubuntu 16.x & Ubuntu 18.x)


- `sudo adduser leasehold`
- `sudo usermod -aG sudo leasehold`
- `sudo su - leasehold`
- `bash <(wget -q -O- https://raw.githubusercontent.com/Leasehold/Downloads/master/install_lsh_core.sh) -n mainnet/testnet`

OR for a DEX node:

- `bash <(wget -q -O- https://raw.githubusercontent.com/Leasehold/Downloads/master/install_lsh_core.sh) -n mainnet/testnet -t dex`
