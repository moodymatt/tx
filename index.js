const core = require('@actions/core')
const github = require('@actions/github')
const { ethers } = require('ethers')
const { getConfig } = require('@web3actions/sdk')

async function run() {
  try {
    // inputs
    const signer = core.getInput('signer')
    const githubToken = core.getInput('github-token')
    let rpcNode = core.getInput('rpc-node')
    const network = core.getInput('network')
    const infuraKey = core.getInput('infura-key')
    if (network && infuraKey) {
      rpcNode = `https://${network}.infura.io/v3/${infuraKey}`
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcNode)
    const walletKey = core.getInput('wallet-key')
    const to = core.getInput('to')
    const etherValue = core.getInput('value')
    const message = core.getInput('message')
    const gasLimit = core.getInput('gas-limit')

    // prepare tx
    let result = null
    let txData = {
      to,
      value: etherValue ? ethers.utils.parseEther(etherValue) : '0',
      data: message ? ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message)) : null
    }

    if (gasLimit) {
      txData.gasLimit = gasLimit
    }

    // convert github user/repo to address
    // matches "user" or "user/repo" according to github's naming restrictions
    if (!ethers.utils.isAddress(txData.to) && /^([a-z\d]+-)*[a-z\d]+(\/[\w\d-_]+)?$/i.test(txData.to)) {
      const web3Config = await getConfig(to)
      if (
        web3Config &&
        web3Config.ethereum &&
        ethers.utils.isAddress(web3Config.ethereum.address)
      ) {
        txData.to = web3Config.ethereum.address
      } else {
        throw new Error(`Could not resolve "${to}" to an Ethereum address.`)
      }
    }

    if (walletKey) {
      // sign tx
      const wallet = new ethers.Wallet(walletKey, provider)
      txData = await wallet.populateTransaction(txData)
      txData = await wallet.signTransaction(txData)
      const tx = await provider.sendTransaction(txData)
      result = await tx.wait()
    } else {
      // contract read (only option where there is no key required)
      result = await provider.call(txData)
      result = abiInterface.decodeFunctionResult(functionName, result)
    }

    core.info(JSON.stringify(result))
    core.setOutput('result', JSON.stringify(result))
  } catch (e) {
    console.log(e)
    core.setFailed(e.message)
  }
}

run()
