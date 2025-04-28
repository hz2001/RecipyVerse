import {supabase} from "./database";
import {Merchant, User, UserRole, Verification, VerifyMessage} from "./database.type";

export async function getVerifyMessage(address: string) {
    try {
        const {data, error} = await supabase
            .from('verification')
            .select("*")
            .eq('address', address);

        if (error) {
            console.error('Error:', error);
            return "";
        }

        const messages = data as VerifyMessage[];
        return messages && messages.length > 0 ? messages[0].message : "";
    } catch (e) {
        console.error('Error:', e);
        return "";
    }
}

export async function getRoleBySessionId(sessionId: string) {
    const {data, error} = await supabase
        .from('verification')
        .select(`*`)
        .eq('session_id', sessionId);

    const verification = data && data.length > 0 ? data[0] as Verification : null;

    if (verification) {
        const address = verification.address;
        const {data: user} = await supabase
            .from('users')
            .select(`*`)
            .eq('wallet_address', address);
        return user && user.length > 0 ? user[0].role : UserRole.USER;
    }
    return UserRole.USER;
}

export async function getAddressBySessionId(sessionId: string) {
    const {data, error} = await supabase
        .from('verification')
        .select(`*`)
        .eq('session_id', sessionId);
    return error ? null : data && data.length > 0 ? data[0].address : null;
}

export async function updateVerifyMessage(address: string, message?: string, sessionId?: string, expireAt?: string) {
    const {data} = await supabase
        .from('verification')
        .select("*")
        .eq('address', address);

    const verification = data && data.length > 0 ? data[0] as Verification : null;
    if (verification) {
        message = message ? message : verification.message;
        sessionId = sessionId ? sessionId : verification.sessionId;
        expireAt = expireAt ? expireAt : verification.expire_at;
    }

    const {error} = await supabase
        .from('verification')
        .upsert({
            address: address, message: message, session_id: sessionId, expire_at: expireAt,
        }, {onConflict: 'address'});

    if (error) {
        console.error('Error:', error);
        return {success: false, message: error.message};
    }
    return {success: true, message: "Success"};
}

export async function uploadFile(address: string, file: Express.Multer.File) {
    const {error} = await supabase.storage
        .from('merchantlicense')
        .upload(`${address}/license`, file.buffer, {
            contentType: file.mimetype, upsert: true
        })

    if (error) {
        console.error('Error on upload:', error);
        return {success: false, message: error.message};
    }
    return {success: true, message: "Success"};

}

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

export async function updateUser(address: string, role: UserRole = UserRole.USER) {
    let {data} = await supabase
        .from('users')
        .select(`*`)
        .eq('wallet_address', address);
    const user = data && data.length > 0 ? data[0] as User : null;

    if (user) {
        role = role ? role : user.role;
    }

    let {error} = await supabase
        .from('users')
        .upsert({
            wallet_address: address, role: role
        })

    if (error) {
        console.error('Error on update user:', error);
        return {success: false, message: error.message};
    }
    return {success: true, message: "Success"};
}

export async function getISSessionExpired(sessionId: string) {
    const {data, error} = await supabase
        .from('verification')
        .select(`*`)
        .eq('session_id', sessionId);

    if (error) {
        return false;
    }
    if (data && data.length > 0) {
        const verification = data[0] as Verification;
        const expiresAt = new Date(verification.expire_at);
        const now = new Date();
        return now < expiresAt;
    }
    return false;
}

export async function deleteBySessionId(sessionId: string) {
    const {error} = await supabase
        .from('verification')
        .delete()
        .eq('session_id', sessionId);
    if (error) {
        console.error('Error on delete by session id:', error);
        return {success: false, message: error.message};
    }
    return {success: true, message: "Success"};
}

export default {
    getVerifyMessage,
    getRoleBySessionId,
    getAddressBySessionId,
    getISSessionExpired,
    updateUser,
    uploadFile,
    updateMerchant,
    updateVerifyMessage,
    deleteBySessionId
}