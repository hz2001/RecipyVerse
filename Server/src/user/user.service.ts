import {Request, Response} from 'express'
import verificationDatabase from "../database/verification.database"
import userDatabase from "../database/users.database"
import nftDatabase from "../database/nfts.database"

export async function getUserInfo(req: Request, res: Response) {
    const sessionId = req.query?.sessionId as string;
    const address = await verificationDatabase.getAddressBySessionId(sessionId);

    const info = await userDatabase.getUserInfo(address);
    if(info){
        return res.status(200).send(info);
    }
    res.status(400).send("Failed to get user info");
}

export async function getAllNFTs(req: Request, res: Response) {
    const sessionId = req.query?.sessionId as string;
    const address = await verificationDatabase.getAddressBySessionId(sessionId);
    const nfts = await nftDatabase.getNFTsByAddress(address);
    return res.status(200).send(nfts);
}

export async function getDetailedNFT(req: Request, res: Response) {
    const nftId = req.params?.nftId as string

    const nft = await nftDatabase.getDetailedNFTById(nftId);
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