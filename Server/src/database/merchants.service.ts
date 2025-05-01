import {supabase} from "./database";
import {Merchant} from "./database.type";

export async function updateMerchant(merchantAddress: string, merchantName?: string, walletAddress?: string, isVerified: boolean = false) {
    const {data} = await supabase
        .from('merchants')
        .select(`*`)
        .eq('merchant_address', merchantAddress);

    const merchant = data && data.length > 0 ? data[0] as Merchant : null;
    if (merchant) {
        merchantName = merchantName ? merchantName : merchant.merchant_name;
        walletAddress = walletAddress ? walletAddress : merchant.wallet_address;
        isVerified = isVerified ? isVerified : merchant.is_verified;
    }

    const {error} = await supabase
        .from('merchants')
        .upsert({
            merchant_address: merchantAddress,
            merchant_name: merchantName,
            wallet_address: walletAddress,
            is_verified: isVerified,
        }, {onConflict: 'merchant_address'});

    if (error) {
        console.error('Error:', error);
        return {success: false, message: error.message};
    }
    return {success: true, message: "Success"};
}

export async function getMerchant(address: string) {
    const {data: merchant} = await supabase
        .from('merchants')
        .select(`*`)
        .eq('wallet_address', address);
    return merchant && merchant.length > 0 ? merchant[0] as Merchant : null;
}

export default {
    updateMerchant,
    getMerchant
}
