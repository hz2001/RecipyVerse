import {supabase} from "./database";
import {Verification, VerifyMessage} from "./database.type";

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

export async function getAddressBySessionId(sessionId: string) {
    const {data, error} = await supabase
        .from('verification')
        .select(`*`)
        .eq('session_id', sessionId);
    return data && data.length > 0 ? data[0].address as string : "";
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

export default {
    getVerifyMessage,
    getAddressBySessionId,
    updateVerifyMessage,
    getISSessionExpired
}
