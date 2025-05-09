import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-deploy'
import { vars } from "hardhat/config";

const PROVIDER_URL = vars.get("PROVIDER_URL");
const PRIVATE_KEY = vars.get("PRIVATE_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.28",
   networks: {
    nero_testnet: {
      url: PROVIDER_URL || 'https://rpc-testnet.nerochain.io',
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
    },
    hardhat: {
      chainId: 31337,
    }
  },
   namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    }
  }
};

export default config;
