import {NextFunction, Request, Response} from "express";
import databaseService, {isSessionValid} from "../database/database.service";
import {UserRole} from "../database/database.type";

export function checkRole(requiredRole?: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const sessionId = req.query?.sessionId;
        if (typeof sessionId !== "string" || !sessionId) return res.status(400).send("sessionId is required");

        const role = await databaseService.getRole(sessionId);
        const valid = await databaseService.isSessionValid(sessionId);

        if (!valid) return res.status(401).send("Session is expired");

        if (role === UserRole.ADMIN) {
            return next();
        }

        if (requiredRole && role !== requiredRole) {
            return res.status(403).send(`You do not have ${requiredRole} permission`);
        }

        return next();
    }
}