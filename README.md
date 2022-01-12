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

```yaml
- uses: web3actions/tx@d3833db41e58cb4e7f329027ad30211a22e1c5e5
  with:
    rpc-node: ${{ secrets.RPC_NODE }}
    wallet-key: ${{ secrets.WALLET_KEY }}
    to: "0x..."
    value: "0.01"
    message: "Hey!"
```

### Send ETH to GitHub user/repository

This works only for users/repositories who have configured a receiving address to use with Web3 Actions.

```yaml
- uses: web3actions/tx@d3833db41e58cb4e7f329027ad30211a22e1c5e5
  with:
    rpc-node: ${{ secrets.RPC_NODE }}
    wallet-key: ${{ secrets.WALLET_KEY }}
    to: "mktcode" # or user/repo
    value: "0.01"
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