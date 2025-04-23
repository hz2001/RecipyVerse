import { artifacts } from "hardhat";
import { ethers } from "ethers";
import path from "node:path";
import * as fs from "node:fs";
import {updateEnv} from "./utils";
import dotenv from "dotenv";
import env from "../global/variable"

dotenv.config();
export async function deployContract() {
    await exportAllAbis();
    let factoryAddress = env.FACTORY_ADDRESS;
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");


    if (factoryAddress) {
        const code = await provider.getCode(factoryAddress);
        if (code && code !== "0x") {
            console.log("Found Deployed Contract:", factoryAddress);
            return factoryAddress;
        }
    }

    const artifactPath = path.resolve(__dirname, "../../../build/artifacts/contracts/NFTFactory.sol/NFTFactory.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;
    const bytecode = artifact.bytecode;

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    //TODO: Change this to update address on database
    updateEnv("FACTORY_ADDRESS", address);
    env.FACTORY_ADDRESS = address;

    return address;
}

async function exportAllAbis() {
    const contractsDir = path.resolve(__dirname, "../../contracts/");
    const outputDir = path.resolve(__dirname, "../../../build/abis");

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const files = fs.readdirSync(contractsDir).filter(file => file.endsWith(".sol"));

    for (const file of files) {
        const contractName = file.replace(".sol", "");

        try {
            const artifact = await artifacts.readArtifact(contractName);
            const outputPath = path.join(outputDir, `${contractName}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(artifact.abi, null, 2));
            console.log(`Exporting ABI file${contractName} -> ${outputPath}`);
        } catch (error) {
            // @ts-ignore
            console.warn(`Failed to export ABI for ${contractName}: ${error.message}`);
        }
    }
}

// deployContract()