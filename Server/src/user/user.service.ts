import {Request, Response} from 'express'
import databaseService from "../database/database.service";
import {UserRole} from "../database/database.type";


export async function getUserInfo(req: Request, res: Response) {
    const sessionId = req.query?.sessionId as string;
    const address = await databaseService.getAddressBySessionId(sessionId);

    const info = databaseService.getUserInfo(address);
    if(info){
        return res.status(200).send(info);
    }
    res.status(400).send("Failed to get user info");
}

export async function getAllNFTs(req: Request, res: Response) {
    const sessionId = req.query?.sessionId as string;
    const address = await databaseService.getAddressBySessionId(sessionId);
    const nfts = await databaseService.getNFTsByAddress(address);
    return res.status(200).send(nfts);
}

export default {
    getUserInfo,
    getAllNFTs
}