# Web3 Tx Action

This action can be used to perform any kind of EVM transaction.


You can specifiy a network name and an infura key. This way users can know which network is actually being targeted by the workflow.

```yaml
- uses: web3actions/tx@d3833db41e58cb4e7f329027ad30211a22e1c5e5
  with:
    network: kovan
    infura-key: ${{ secrets.INFURA_KEY }}
    # ...
```

The node is now: `https://${network}.infura.io/v3/${infuraKey}`.
### Send ETH to another account

The `message` field will be hex encoded data included in the transaction.

The amount of ETH / USD is determined from a `Bounty` label (currently looking at Pull Request labels)

```yaml
- uses: web3actions/tx@d3833db41e58cb4e7f329027ad30211a22e1c5e5
  with:
    rpc-node: ${{ secrets.RPC_NODE }}
    wallet-key: ${{ secrets.WALLET_KEY }}
    to: "0x..."
    message: "Hey!"
    # contract-address represents the pairs address see -> https://docs.chain.link/docs/ethereum-addresses/
    contract-address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
    # contract-decimals represents the pairs decimal requirements for mathing see -> https://docs.chain.link/docs/ethereum-addresses/
    contract-decimals: "8"
    labels: "bug,bounty | $10, important"
```

### Send ETH to GitHub user/repository

This works only for users/repositories who have configured a receiving address to use with Web3 Actions.

The amount of ETH / USD is determined from a `Bounty` label (currently looking at Pull Request labels)

```yaml
- uses: web3actions/tx@d3833db41e58cb4e7f329027ad30211a22e1c5e5
  with:
    rpc-node: ${{ secrets.RPC_NODE }}
    wallet-key: ${{ secrets.WALLET_KEY }}
    to: "mktcode" # or user/repo
    # contract-address represents the pairs address see -> https://docs.chain.link/docs/ethereum-addresses/
    contract-address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
    # contract-decimals represents the pairs decimal requirements for mathing see -> https://docs.chain.link/docs/ethereum-addresses/
    contract-decimals: "8"
    labels: "bug,bounty | $10, important"
```

Repositories can configure an address (or other information) in a `web3.json` in the root directory or a `"web3"` section in a `package.json`.

```json
// web3.json
{
  "ethereum": {
    "address": "0x123..."
  }
}
```

```json
// package.json
"web3": {
  "ethereum": {
    "address": "0x123..."
  }
}
```

Users can use their profile repository, named after their username.