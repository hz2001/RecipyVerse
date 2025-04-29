import {Request, Response} from 'express'
import databaseService from "../database/database.service";
import {UserRole} from "../database/database.type";


export async function uploadQualification(req: Request, res: Response) {
    const { merchantName, merchantAddress } = req.body;
    const file = req.file as Express.Multer.File;
    const sessionId = req.query?.sessionId as string;

    const address = await databaseService.getAddressBySessionId(sessionId);

    const bucketUploaded = await databaseService.uploadFile(address, file);
    const databaseUpload = await databaseService.updateMerchant(merchantAddress, merchantName, address)

    if(bucketUploaded && databaseUpload){
        await databaseService.updateUser(address,UserRole.MERCHANT)
        res.status(200).send("OK");
    } else{
        await databaseService.deleteUser(address);
        res.status(400).send("Failed to upload");
    }
}

export async function getAllContracts(req: Request, res: Response) {
    const sessionId = req.query?.sessionId as string;
    const address = await databaseService.getAddressBySessionId(sessionId);
    const contracts = await databaseService.getNFTContractsByAddress(address);
    return res.status(200).send(contracts);
}

export async function getInfoBySessionId(req: Request, res: Response){
    const sessionId = req.query?.sessionId as string;
    const address = await databaseService.getAddressBySessionId(sessionId);
    const merchant = await databaseService.getMerchant(address);
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