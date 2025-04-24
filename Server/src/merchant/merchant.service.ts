import { Request, Response } from 'express'
import databaseService from "../database/database.service";


export async function uploadQualification(req: Request, res: Response) {

    const { merchantName, merchantAddress } = req.body;
    const file = req.file as Express.Multer.File;
    const sessionId = req.query?.sessionId as string;

    const address = await databaseService.getAddressBySessionId(sessionId);

    const bucketUploaded = await databaseService.uploadFile(address, file);
    const databaseUpload = await databaseService.updateMerchant(merchantName, merchantAddress, address)


}

export async function getAllContracts(req: Request, res: Response) {
    //TODO:
    return res.status(200).send("OK");
}

export default {
    uploadQualification,
    getAllContracts
}