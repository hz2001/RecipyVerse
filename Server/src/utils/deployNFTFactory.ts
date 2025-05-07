import {artifacts, run} from "hardhat";
import {ethers} from "ethers";
import path from "node:path";
import * as fs from "node:fs";
import {updateEnv} from "./utils";
import dotenv from "dotenv";
import env from "../global/variable"

dotenv.config();

export async function deployContract() {
    await run("compile");
    await exportAllAbis();
    let factoryAddress = env.FACTORY_ADDRESS;
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
    let swapAddress = env.SWAP_ADDRESS;

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);

    if (factoryAddress !== "") {
        const code = await provider.getCode(factoryAddress);
        if (code && code === "0x") {
            factoryAddress = "";
        } else {
            console.log("Found Deployed Factory Contract:", factoryAddress);
        }
    }

    if (!factoryAddress) {
        const nftFactoryArtifactPath = path.resolve(__dirname, "../../../build/artifacts/contracts/NFTFactory.sol/NFTFactory.json");
        const artifact = JSON.parse(fs.readFileSync(nftFactoryArtifactPath, "utf8"));
        const abi = artifact.abi;
        const bytecode = artifact.bytecode;

        const factory = new ethers.ContractFactory(abi, bytecode, wallet);
        const contract = await factory.deploy();
        await contract.waitForDeployment();

        const address = await contract.getAddress();
        updateEnv("FACTORY_ADDRESS", address);
        env.FACTORY_ADDRESS = address;
        factoryAddress = address;
        console.log("Factory Contract Address:", address);
    }

    if (swapAddress !== "") {
        const code = await provider.getCode(swapAddress);
        if (code && code === "0x") {
            swapAddress = "";
        } else {
            console.log("Found Deployed Swap Contract:", swapAddress);
        }
    }

    if (!swapAddress) {
        const nftSwapArtifactPath = path.resolve(__dirname, "../../../build/artifacts/contracts/NewConditionalSwap.sol/NewConditionalSwap.json");
        const swapArtifact = JSON.parse(fs.readFileSync(nftSwapArtifactPath, "utf8"));
        const swapAbi = swapArtifact.abi;
        const swapBytecode = swapArtifact.bytecode;

        const swap = new ethers.ContractFactory(swapAbi, swapBytecode, wallet);
        const swapContract = await swap.deploy(factoryAddress);
        await swapContract.waitForDeployment();

        const address = await swapContract.getAddress();
        updateEnv("SWAP_ADDRESS", address);
        env.SWAP_ADDRESS = address;
        console.log("Swap Contract Address:", address);
    }
}

async function exportAllAbis() {
    const contractsDir = path.resolve(__dirname, "../../contracts/");
    const outputDir = path.resolve(__dirname, "../../../build/abis");

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {recursive: true});
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