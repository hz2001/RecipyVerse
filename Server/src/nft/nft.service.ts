import {Request, Response} from 'express'
import databaseService from "../database/database.service";


export async function createNFT(req: Request, res: Response) {
    const body = req.body;
    const expireDate = `${body.expires_at}T00:00:00.000Z`;
    const creatorAddress = body.creator_address;
    const couponName = body.coupon_name;
    const couponType = body.coupon_type;
    const couponImg = body.coupon_image;
    const totalAmount = body.total_supply;
    const swapping = body.swapping;
    const contractAddress = body.contract_address;
    const details = body.details
    const detailsHash = body.details_hash

    const {
        success,
        message
    } = await databaseService.insertNewNFT(expireDate, creatorAddress, couponName, couponType, couponImg, totalAmount, swapping, contractAddress, details, detailsHash)

    if (success) {
        res.status(200).send(message);
    }
    res.status(400).send(message);
}


export default {
    createNFT
}