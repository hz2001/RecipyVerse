import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";

const config: HardhatUserConfig = {
    solidity: "0.8.28",
    paths:{
        artifacts:"../build/artifacts",
        cache:"../build/cache",
        sources:"contracts",
    },

    typechain:{
        outDir:"../build/types",
    },
    defaultNetwork:"localhost",
    networks:{
        localhost:{
            url:"http://127.0.0.1:8545",
            chainId:31337
        },
        sepolia:{
            url:"https://sepolia.infura.io/v3/TOBEADDED",
            chainId:11155111,
        },
        ganache:{
            url: "http://127.0.0.1:7545",
            chainId:1337,
            accounts: {
                mnemonic: "member citizen submit safe degree eagle south large fringe welcome device round\n",
            },
        }
    }
};

export default config;
