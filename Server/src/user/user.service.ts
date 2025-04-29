import {Request, Response} from 'express'
import databaseService from "../database/database.service";


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

export async function getDetailedNFT(req: Request, res: Response) {
    const nftId = req.params?.nftId as string

    const nft = await databaseService.getDetailedNFTById(nftId);
    if(nft){
        return res.status(200).send(nft);
    }
    return res.status(400).send("Failed to get detailed nft");
}

export default {
    getUserInfo,
    getAllNFTs,
    getDetailedNFT
}