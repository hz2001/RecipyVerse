import {Request, Response} from 'express'
import nftDatabase from "../database/nfts.database";
import fileDatabase from "../database/file.databse";

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
    const ownerAddress = body.owner_address

    const file = req.file as Express.Multer.File;

    let fileUploaded = {success: true, message: ''};

    if (file != undefined) {
        fileUploaded = await fileDatabase.uploadFile(contractAddress, file, "nftPhoto");
    }

    const {
        success,
        message
    } = await nftDatabase.insertNewNFT(expireDate, creatorAddress, couponName, couponType, couponImg, totalAmount, swapping, contractAddress, details, detailsHash, ownerAddress)

    if (success && fileUploaded.success) {
        res.status(200).send(message);
    } else {
        res.status(400).send(`${message} ${fileUploaded.message}`.trim());
    }

}

export async function updateNFT(req: Request, res: Response) {
    const body = req.body;
    const id = req.params?.id as string;
    const nft = await nftDatabase.getDetailedNFTById(id);

    if (!nft) {
        return res.status(404).send("NFT not found");
    }

    const file = req.file as Express.Multer.File;
    const expireDate = body.expires_at ? `${body.expires_at}T00:00:00.000Z` : nft.expires_at;
    const creatorAddress = body.creator_address ?? nft.creator_address;
    const couponName = body.coupon_name ?? nft.coupon_name;
    const couponType = body.coupon_type ?? nft.coupon_type;
    const couponImg = body.coupon_image ?? nft.coupon_image;
    const totalAmount = body.total_supply ?? nft.total_supply;
    const swapping = body.swapping ?? nft.swapping;
    const contractAddress = body.contract_address ?? nft.contract_address;
    const tokenId = body.token_id ?? nft.token_id;
    const details = body.details ?? nft.details;
    const details_hash = body.detail_hash ?? nft.detail_hash

    let fileUploaded = {success: true, message: ''};
    if (file) {
        fileUploaded = await fileDatabase.uploadFile(contractAddress, file, "nftPhoto");
    }

    const {success, message} = await nftDatabase.updateNFT(
        id,
        expireDate,
        creatorAddress,
        couponName,
        couponType,
        couponImg,
        totalAmount,
        swapping,
        contractAddress,
        details,
        details_hash,
        tokenId
    );

    if (success && fileUploaded.success) {
        res.status(200).send(message);
    } else {
        res.status(400).send(`${message} ${fileUploaded.message}`.trim());
    }
}

export async function getAllPendingSwapping(req:Request, res:Response) {
    const nfts = await nftDatabase.getSwappingNFTs()

    return res.status(200).send(nfts)
}

export async function getAllNFTs(req:Request, res:Response){
    const nfts = await nftDatabase.getAllNFTs()
    return res.status(200).send(nfts)
}


export default {
    createNFT,
    updateNFT,
    getAllPendingSwapping,
    getAllNFTs
}