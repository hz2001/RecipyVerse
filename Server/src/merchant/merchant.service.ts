import {Request, Response} from 'express'
import {UserRole} from "../database/database.type";
import verificationDatabase from "../database/verification.service"
import userDatabase from "../database/users.service"
import merchantDatabase from "../database/merchants.service"
import fileDatabase from "../database/file.service"
import nftDatabase from "../database/nfts.service"

export async function uploadQualification(req: Request, res: Response) {
    const { merchantName, merchantAddress } = req.body;
    const file = req.file as Express.Multer.File;
    const sessionId = req.query?.sessionId as string;

    const address = await verificationDatabase.getAddressBySessionId(sessionId);

    const bucketUploaded = await fileDatabase.uploadFile(address, file, "license");
    const databaseUpload = await merchantDatabase.updateMerchant(merchantAddress, merchantName, address)

    if(bucketUploaded && databaseUpload){
        await userDatabase.updateUser(address,UserRole.MERCHANT)
        res.status(200).send("OK");
    } else{
        await userDatabase.deleteUser(address);
        res.status(400).send("Failed to upload");
    }
}

export async function getAllContracts(req: Request, res: Response) {
    const sessionId = req.query?.sessionId as string;
    const address = await verificationDatabase.getAddressBySessionId(sessionId);
    const contracts = await nftDatabase.getNFTsByCreator(address);
    return res.status(200).send(contracts);
}

export async function getInfoBySessionId(req: Request, res: Response){
    const sessionId = req.query?.sessionId as string;
    const address = await verificationDatabase.getAddressBySessionId(sessionId);
    const merchant = await merchantDatabase.getMerchant(address);
    if(merchant){
        return res.status(200).send(merchant);
    }
    return res.status(400).send("Failed to get merchant info");
}

export default {
    uploadQualification,
    getAllContracts,
    getInfoBySessionId
}