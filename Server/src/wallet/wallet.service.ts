import {Request, Response} from 'express'
import {verifyMessage} from "ethers";
import verificationDatabase from "../database/verification.service"
import userDatabase from "../database/users.service"

export async function sendTimeStamp(req: Request, res: Response) {
    try {
        const date = new Date();
        const random = Math.random();
        const token = (date.getTime() + random).toString();
        const message = "Verify Check at " + token;
        const address = req.query.address as string;
        const {success: isSuccess, message: errorMessage} = await verificationDatabase.updateVerifyMessage(address, message);
        if (!isSuccess) {
            return res.status(403).send("Failed to update verify message:" + errorMessage);
        }
        res.status(200).send(message);
    } catch (e) {
        console.log(e);
    }
}

export async function verifyCheck(req: Request, res: Response) {
    try {
        const {sign, account} = req.body;
        const message = await verificationDatabase.getVerifyMessage(account) as string;
        const recovered = verifyMessage(message, sign);
        const result = recovered.toLowerCase() === account.toLowerCase();

        if (result) {
            const sessionId = crypto.randomUUID();
            const expireAt = new Date(Date.now() + 3600000).toISOString();
            const {
                success: isSuccess,
                message: errorMessage
            } = await verificationDatabase.updateVerifyMessage(account, undefined, sessionId, expireAt);

            if (!isSuccess) {
                return res.status(403).send("Failed to update verify message:" + errorMessage);
            }
            await userDatabase.updateUser(account);
            res.status(200).send(sessionId);
        } else {
            res.status(403).send("Signature does not match");
        }
    } catch (e) {
        console.log(e);
    }

}

export default {
    verifyCheck, sendTimeStamp
}