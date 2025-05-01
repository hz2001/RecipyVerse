import {Request, Response} from 'express'


export function getAllUsers(req: Request, res: Response){
    return res.status(200).send("OK");
}

export function getAllMerchants(req: Request, res: Response){
    return res.status(200).send("OK");
}

export function getAllNFTs(req: Request, res: Response){
    return res.status(200).send("OK");
}

export function getAllFiles(req: Request, res: Response){
    return res.status(200).send("OK");
}

export function updateMerchant(req: Request, res: Response){
    return res.status(200).send("OK");
}

export function updateNFT(req: Request, res: Response){
    return res.status(200).send("OK");
}

export function updateUser(req: Request, res: Response){
    return res.status(200).send("OK");
}

export function updateFile(req: Request, res: Response){
    return res.status(200).send("OK");
}







export default{
    getAllUsers,
    getAllMerchants,
    getAllNFTs,
    getAllFiles,
    updateMerchant,
    updateNFT,
    updateUser,
    updateFile
}