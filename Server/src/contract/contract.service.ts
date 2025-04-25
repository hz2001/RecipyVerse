import { Request, Response } from 'express'
import env from "../global/variable";
import path from "node:path";
import fs from "node:fs";

export function getNFTFactoryContractAbi(req:Request, res:Response){
    const abi = require('../../../build/abis/NFTFactory.json');
    const address = env.FACTORY_ADDRESS;

    res.status(200).json({
        abi,
        address
    });
}

export function getNFTCouponContractAbi(req:Request, res:Response){
    const artifactPath = path.resolve(__dirname, "../../../build/artifacts/contracts/CouponNFT.sol/CouponNFT.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;
    const bytecode = artifact.bytecode;
    res.status(200).json({
        abi,
        bytecode
    });
}

export function getNFTSwapContractAbi(req:Request, res:Response){
    const artifactPath = path.resolve(__dirname, "../../../build/artifacts/contracts/ConditionalNFTSwap.sol/ConditionalNFTSwap.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;
    const bytecode = artifact.bytecode;
    res.status(200).json({
        abi,
        bytecode
    });
}


export default {
    getNFTFactoryContractAbi,
    getNFTCouponContractAbi,
    getNFTSwapContractAbi
}