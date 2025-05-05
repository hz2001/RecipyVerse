import {NextFunction, Request, Response} from "express";
import {UserRole} from "../database/database.type";
import verificationDatabase from "../database/verification.database"
import userDatabase from "../database/users.database"
import merchantDatabase from "../database/merchants.database"

export function checkRole(requiredRole?: string, requireVerified?: boolean) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const sessionId = req.query?.sessionId;
        if (typeof sessionId !== "string" || !sessionId) return res.status(400).send("sessionId is required");

        const address = await verificationDatabase.getAddressBySessionId(sessionId);
        const role = await userDatabase.getUserRole(address);
        const valid = await verificationDatabase.getISSessionExpired(sessionId);

        if (!valid) return res.status(401).send("Session is not valid");

        if (role === UserRole.ADMIN) {
            return next();
        }

        if (requiredRole && role !== requiredRole) {
            return res.status(403).send(`You do not have ${requiredRole} permission`);
        }

        if (requireVerified && requireVerified && role === UserRole.MERCHANT) {
            const merchantInfo = await merchantDatabase.getMerchant(address);
            if(merchantInfo == null){
                return res.status(403).send("Merchant info is not found");
            }
            const isVerified = merchantInfo.is_verified
            if(!isVerified){
                return res.status(403).send("Merchant is not verified");
            }
            return next();
        }

        return next();
    }
}