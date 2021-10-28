# Web3 Actions - TX Action

This action can be used to perform any kind of EVM transaction.

### Read from contract

```yaml
- uses: web3actions/tx@d3833db41e58cb4e7f329027ad30211a22e1c5e5
  with:
    rpc-node: ${{ secrets.RPC_NODE }}
    contract: "0x..."
    function: "getStatus(string,uint8) returns(bool)"
    inputs: '["${{ github.event.issue.node_id }}", 1]'
```

You can also specifiy a network name and an infura key. This way users can know which network is actually being targeted by the workflow.

```yaml
- uses: web3actions/tx@d3833db41e58cb4e7f329027ad30211a22e1c5e5
  with:
    network: kovan
    infura-key: ${{ secrets.INFURA_KEY }}
    # ...
```

The node is now: `https://${network}.infura.io/v3/${infuraKey}`.

### Write to contract

```yaml
- uses: web3actions/tx@d3833db41e58cb4e7f329027ad30211a22e1c5e5
  with:
    rpc-node: ${{ secrets.RPC_NODE }}
    wallet-key: ${{ secrets.WALLET_KEY }}
    contract: "0x..."
    function: "deposit(string)"
    inputs: '["${{ github.event.issue.node_id }}"]'
    value: "0.01"
```

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

## Signatures

To interact with a [GithubWorkflowClient](https://github.com/web3actions/contracts/blob/main/src/GithubWorkflowClient.sol) contract, you can request a signature from another repository's signer workflow. (The GitHub token is needed to post the request and read the response.)

```yaml
- uses: web3actions/tx@d3833db41e58cb4e7f329027ad30211a22e1c5e5
  with:
    rpc-node: ${{ secrets.RPC_NODE }}
    wallet-key: ${{ secrets.WALLET_KEY }}
    contract: "0x..."
    # uint256,bytes (representing the workflow run ID and the signature) must be the last two parameters
    function: "deposit(string,uint256,bytes)"
    # but you don't need to pass them to the function call manually. The tx action will do that automatically.
    inputs: '["${{ github.event.issue.node_id }}"]'
    value: "0.01"
    signer: web3actions/signer
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

The other repository, using the [web3actions/signer](https://github.com/web3actions/signer) action, will sign the current workflow run ID and the hash of the workflow file being run. The `GithubWorkflowClient` can verify this signature and implement a multi-sig mechanic for sensible functions. The repository of the `web3actions/signer` action actually runs such a workflow and you can use it to sign your own workflow runs.
