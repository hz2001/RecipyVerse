import { Request, Response } from 'express'
import env from "../global/variable";










export function getContractAbi(req:Request, res:Response){
    const abi = require('../../../build/abis/NFTFactory.json');
    const address = env.FACTORY_ADDRESS;

    res.status(200).json({
        abi,
        address
    });

}


export default {
    getContractAbi
}