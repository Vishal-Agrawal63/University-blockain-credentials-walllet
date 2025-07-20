
require('dotenv').config();


const HDWalletProvider = require('@truffle/hdwallet-provider');

const mnemonic = process.env.MNEMONIC;
const alchemyKey = process.env.ALCHEMY_KEY;



module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    sepolia: {
      provider: () => new HDWalletProvider(mnemonic, `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`),
      network_id: 11155111,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },
  compilers: {
    solc: {
      version: "0.8.21",
    }
  }
};