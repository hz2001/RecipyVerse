import { Request, Response } from 'express'
import { verifyMessage } from "ethers";
import databaseService from "../database/database.service";


export async function sendTimeStamp(req: Request, res: Response) {
    try{
        const date = new Date();
        const token = date.getTime().toString();
        const message = "Verify Check at " + token;
        const address = req.query.address as string;
        const a = await databaseService.updateVerifyMessage(message, address);

        res.status(200).send(message);
    }catch(e){
        console.log(e);
    }
}

export async function verifyCheck(req: Request, res: Response) {
    try{
        const { sign, account } = req.body;
        const message = await databaseService.getVerifyMessage(account) as string;
        const recovered = verifyMessage(message, sign);
        const result = recovered.toLowerCase() === account.toLowerCase();

        if(result){
            //TODO: add database interaction
            res.status(200).send("OK");
        }else {
            res.status(400).send("Signature does not match");
        }
    }catch(e){
        console.log(e);
    }

}








export default {
    verifyCheck,
    sendTimeStamp
}