const core = require("@actions/core");
const { ethers } = require("ethers");
const { getConfig } = require("@web3actions/sdk");
const Web3 = require("web3");

async function run() {
  try {
    // inputs
    let rpcNode = core.getInput("rpc-node");
    const network = core.getInput("network");
    const infuraKey = core.getInput("infura-key");
    if (network && infuraKey) {
      rpcNode = `https://${network}.infura.io/v3/${infuraKey}`;
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcNode);
    const walletKey = core.getInput("wallet-key");
    const to = core.getInput("to");
    // const desiredUsdValue = core.getInput("value", { required: true }); //TODO: this should now be USD and we should call chainlink to do the conversion
    const message = core.getInput("message");
    const gasLimit = core.getInput("gas-limit");
    const labels = core.getInput("labels");
    const ethUsdContractAddress = core.getInput("contract-address", {
      required: true,
    });
    const ethUsdContractDecimals = core.getInput("contract-decimals", {
      required: true,
    });

    const bountyLabel = getBountyLabel(labels.split(','));
    const desiredUsdValue = getDollarAmountFromBountyLabel(bountyLabel);

    // prepare tx
    core.debug("USD value from input: " + desiredUsdValue);

    let result = null;
    let txData = {
      to,
      value: await convertDesiredUsdToEthAmount(desiredUsdValue, ethUsdContractAddress, ethUsdContractDecimals, rpcNode),
      data: message
        ? ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message))
        : null,
    };

    if (gasLimit) {
      txData.gasLimit = gasLimit;
    }

    // convert github user/repo to address
    // matches "user" or "user/repo" according to github's naming restrictions
    if (
      !ethers.utils.isAddress(txData.to) &&
      /^([a-z\d]+-)*[a-z\d]+(\/[\w\d-_]+)?$/i.test(txData.to)
    ) {
      const web3Config = await getConfig(to);
      if (
        web3Config &&
        web3Config.ethereum &&
        ethers.utils.isAddress(web3Config.ethereum.address)
      ) {
        txData.to = web3Config.ethereum.address;
      } else {
        throw new Error(`Could not resolve "${to}" to an Ethereum address.`);
      }
    }

    if (walletKey) {
      // sign tx
      const wallet = new ethers.Wallet(walletKey, provider);
      txData = await wallet.populateTransaction(txData);
      txData = await wallet.signTransaction(txData);
      const tx = await provider.sendTransaction(txData);
      result = await tx.wait();
    }

    core.info(JSON.stringify(result));
    core.setOutput("result", JSON.stringify(result));
  } catch (e) {
    console.log(e);
    core.setFailed(e.message);
  }
}

const convertDesiredUsdToEthAmount = async (
  startingUsdDenomination,
  ethUsdContractAddress,
  ethUsdContractDecimals,
  rpcNode
) => {
  const ethUsdPricing = await getPrice(
    rpcNode,
    ethUsdContractAddress,
    ethUsdContractDecimals
  ); //=> returns two props { int, price } - price will have two decimal places

  return getEthValueFromCurrentPairPrice(ethUsdPricing.price, startingUsdDenomination);
};

const getEthValueFromCurrentPairPrice = (ethUsdPrice, usdValue) => {
  const ethPerUsd = 1 / ethUsdPrice;
  const totalEth = ethPerUsd * usdValue;
  let stringifiedTotalEth = totalEth.toFixed(18);
  return ethers.utils.parseEther(stringifiedTotalEth);
};

const getPrice = async function (rpcNode, aggregatorAddress, decimals) {
  const web3 = new Web3(rpcNode);
  const aggregatorV3InterfaceABI = [
    {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "description",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
      name: "getRoundData",
      outputs: [
        { internalType: "uint80", name: "roundId", type: "uint80" },
        { internalType: "int256", name: "answer", type: "int256" },
        { internalType: "uint256", name: "startedAt", type: "uint256" },
        { internalType: "uint256", name: "updatedAt", type: "uint256" },
        { internalType: "uint80", name: "answeredInRound", type: "uint80" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "latestRoundData",
      outputs: [
        { internalType: "uint80", name: "roundId", type: "uint80" },
        { internalType: "int256", name: "answer", type: "int256" },
        { internalType: "uint256", name: "startedAt", type: "uint256" },
        { internalType: "uint256", name: "updatedAt", type: "uint256" },
        { internalType: "uint80", name: "answeredInRound", type: "uint80" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "version",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  const priceFeed = new web3.eth.Contract(
    aggregatorV3InterfaceABI,
    aggregatorAddress
  );

  return priceFeed.methods
    .latestRoundData()
    .call()
    .then((roundData) => {
      roundData.int = Number(roundData.answer);
      roundData.price = Number(roundData.answer) / Math.pow(10, decimals);
      return roundData;
    });
};

const getBountyLabel = (labels) => {
  for (let index = 0; index < labels.length; index++) {
    const label = labels[index];
    if (label.toUpperCase().indexOf("BOUNTY") > -1) {
      return label;
    }
  }
};

const getDollarAmountFromBountyLabel = (bountyLabel) => {
  const index = bountyLabel.indexOf("$") + 1;
  const amount = bountyLabel.substring(index);
  return amount;
};

run();
