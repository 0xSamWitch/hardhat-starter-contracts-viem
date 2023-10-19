import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import "hardhat-storage-layout";
import "solidity-coverage";
import "dotenv/config";

import {SolcUserConfig} from "hardhat/types";

const defaultConfig: SolcUserConfig = {
  version: "0.8.21",
  settings: {
    evmVersion: "paris",
    optimizer: {
      enabled: true,
      runs: 9999999,
      details: {
        yul: true,
      },
    },
    viaIR: true, // Change to false when running coverage
    outputSelection: {
      "*": {
        "*": ["storageLayout"],
      },
    },
  },
};

const highRunsConfig: SolcUserConfig = {
  ...defaultConfig,
  settings: {
    ...defaultConfig.settings,
    optimizer: {
      ...defaultConfig.settings.optimizer,
      runs: 20000,
    },
  },
};

const mediumRunsConfig: SolcUserConfig = {
  ...defaultConfig,
  settings: {
    ...defaultConfig.settings,
    optimizer: {
      ...defaultConfig.settings.optimizer,
      runs: 5000,
    },
  },
};

const lowRunsConfig: SolcUserConfig = {
  ...defaultConfig,
  settings: {
    ...defaultConfig.settings,
    optimizer: {
      ...defaultConfig.settings.optimizer,
      runs: 800,
    },
  },
};

const config: HardhatUserConfig = {
  solidity: {
    compilers: [defaultConfig, lowRunsConfig, mediumRunsConfig, highRunsConfig],
    overrides: {
      "contracts/token/OFTERC20.sol": highRunsConfig,
    },
  },
  gasReporter: {
    enabled: true,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  networks: {
    hardhat: {
      gasPrice: 0,
      initialBaseFeePerGas: 0,
      allowUnlimitedContractSize: true,
    },
    ethereum: {
      url: process.env.MAINNET_RPC,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    goerli: {
      url: process.env.GOERLI_RPC,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    fantom: {
      url: process.env.FTM_RPC,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    fantom_testnet: {
      url: process.env.FTM_TESTNET_RPC,
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  abiExporter: {
    path: "./data/abi",
    clear: true,
    flat: false,
  },
};

export default config;
