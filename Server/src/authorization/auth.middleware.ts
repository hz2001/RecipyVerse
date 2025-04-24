import {NextFunction, Request, Response} from "express";
import databaseService from "../database/database.service";
import {UserRole} from "../database/database.type";

export function isAdmin() {
    return async (req: Request, res: Response, next: NextFunction) => {
        const sessionId = req.query?.sessionId;
        if (typeof sessionId !== "string" || !sessionId) return res.status(400).send("sessionId is required");

        const role = await databaseService.getRole(sessionId);
        if(role != UserRole.ADMIN){
            return res.status(404).send("You are not Owner")
        }
        return next();
    }
}

export function isMerchant() {
    return async (req: Request, res: Response, next: NextFunction) => {
        const sessionId = req.query?.sessionId;
        if (typeof sessionId !== "string" || !sessionId) return res.status(400).send("sessionId is required");

        const role = await databaseService.getRole(sessionId);
        if(role != UserRole.MERCHANT){
            return res.status(404).send("You are not Merchant")
        }
        return next();
    }
}