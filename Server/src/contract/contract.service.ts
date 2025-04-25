import {Request, Response} from 'express'
import env from "../global/variable";

export function getNFTFactoryContractAbi(req: Request, res: Response) {
    const abi = require('../../../build/abis/NFTFactory.json');
    const address = env.FACTORY_ADDRESS;

    res.status(200).json({
        abi, address
    });
}

export function getNFTCouponContractAbi(req: Request, res: Response) {
    const abi = require('../../../build/abis/CouponNFT.json');

    res.status(200).json({
        abi
    });
}

export function getNFTSwapContractAbi(req: Request, res: Response) {
    const abi = require('../../../build/abis/ConditionalNFTSwap.json');
    const address = env.SWAP_ADDRESS;

    res.status(200).json({
        abi, address
    });
}


export default {
    getNFTFactoryContractAbi, getNFTCouponContractAbi, getNFTSwapContractAbi
}