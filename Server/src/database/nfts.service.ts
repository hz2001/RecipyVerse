import {supabase} from "./database";
import {NFT} from "./database.type";

export async function getNFTsByCreator(address: string) {
    const {data, error} = await supabase
        .from('nfts')
        .select(`*`)
        .eq('creator_address', address);
    return data && data.length > 0 ? data as NFT[] : []
}

export async function getNFTsByAddress(address: string) {
    const {data, error} = await supabase
        .from('nfts')
        .select(`*`)
        .eq('owner_address', address);
    return data && data.length > 0 ? data as NFT[] : []
}

export async function getDetailedNFTById(nftId: string) {
    const {data, error} = await supabase
        .from('nfts')
        .select(`*`)
        .eq('id', nftId);
    return data && data.length > 0 ? data[0] as NFT : null;
}

export async function insertNewNFT(expirationTimeStamp: string, creatorAddress: string, couponName: string, couponType: string, couponImg: string, totalAmount: number, swapping: string, contractAddress: string, details: string, detailHash: string) {
    const {error} = await supabase
        .from('nfts')
        .insert({
            expires_at: expirationTimeStamp,
            creator_address: creatorAddress,
            details: details,
            details_hash: detailHash,
            coupon_name: couponName,
            coupon_type: couponType,
            coupon_image: couponImg,
            total_supply: totalAmount,
            swapping: swapping,
            contract_address: contractAddress
        });
    if (error) {
        console.error('Error on insert new NFT:', error);
        return {success: false, message: error.message};
    }
    return {success: true, message: "Success"};
}

export default {
    getNFTsByCreator,
    getNFTsByAddress,
    getDetailedNFTById,
    insertNewNFT
}