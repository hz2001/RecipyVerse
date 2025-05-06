import {supabase} from "./database";
import {NFT} from "./database.type";

export async function getNFTsByCreator(address: string) {
    const {data} = await supabase
        .from('nfts')
        .select(`*`)
        .ilike('creator_address', address);
    return data && data.length > 0 ? data as NFT[] : []
}

export async function getNFTsByAddress(address: string) {
    const {data, error} = await supabase
        .from('nfts')
        .select(`*`)
        .ilike('owner_address', address);
    if (error) {
        console.error('Error on get NFTs by address:', error);
        return [];
    }
    console.log(data);
    return data && data.length > 0 ? data as NFT[] : []
}

export async function getDetailedNFTById(nftId: string) {
    const {data} = await supabase
        .from('nfts')
        .select(`*`)
        .eq('id', nftId);
    return data && data.length > 0 ? data[0] as NFT : null;
}

export async function insertNewNFT(expirationTimeStamp: string, creatorAddress: string, couponName: string, couponType: string, couponImg: string, totalAmount: number, swapping: string, contractAddress: string, details: string, detailHash: string, ownerAddress: string) {
    const {data, error} = await supabase
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
            contract_address: contractAddress,
            owner_address: ownerAddress,
        }).select();
    if (error) {
        console.error('Error on insert new NFT:', error);
        return {success: false, message: error.message};
    }

    const dataNFT = data && data.length > 0 ? data[0] as NFT : null;
    return {success: true, message: dataNFT};
}

export async function updateNFT(nftId: string, expirationTimeStamp: string, creatorAddress: string, couponName: string, couponType: string, couponImg: string, totalAmount: number, swapping: string, contractAddress: string, details: string, detailHash: string, tokenId: string) {
    const {error} = await supabase
        .from('nfts')
        .update({
            expires_at: expirationTimeStamp,
            creator_address: creatorAddress,
            coupon_name: couponName,
            coupon_type: couponType,
            coupon_image: couponImg,
            total_supply: totalAmount,
            swapping: swapping,
            contract_address: contractAddress,
            details: details,
            details_hash: detailHash,
            token_id: tokenId
        })
        .eq('id', nftId)
        .single()
    if (error) {
        console.error('Error on update NFT:', error);
        return {success: false, message: error.message};
    }
    return {success: true, message: "Success"};
}

export async function getSwappingNFTs() {
    const {data} = await supabase
        .from('nfts')
        .select(`*`)
        .not('swapping', 'is', null)

    return data && data.length > 0 ? data as NFT[] : []   
}

export async function getAllNFTs() {
    const {data, error} = await supabase
        .from('nfts')
        .select(`*`)
    if (error) {console.error('Error on get all NFTs:', error); return []}
    return data && data.length > 0 ? data as NFT[] : []
}


export default {
    getNFTsByCreator,
    getNFTsByAddress,
    getDetailedNFTById,
    updateNFT,
    insertNewNFT,
    getSwappingNFTs,
    getAllNFTs
}